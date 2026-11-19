const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Appointment = require('../models/Appointment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const { normalizePhoneNumber } = require('../utils/phoneNormalizer');
const { calculateLeadScore } = require('../services/leadScoringService');
const { matchPropertiesForCustomer } = require('../services/matchingService');
const { triggerAutomations } = require('../services/automationEngine');

// @desc    Get all customers with advanced filtering & search
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const {
      search,
      leadStatus,
      priority,
      preferredLocation,
      propertyCategory,
      minBudget,
      maxBudget,
      assignedBrokerId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { companyId: req.companyId };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (leadStatus && leadStatus !== 'All') {
      query.leadStatus = leadStatus;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (preferredLocation) {
      query.preferredLocation = { $regex: preferredLocation, $options: 'i' };
    }

    if (propertyCategory && propertyCategory !== 'Any') {
      query['requirements.propertyCategory'] = propertyCategory;
    }

    if (minBudget || maxBudget) {
      query['requirements.maxBudget'] = {};
      if (minBudget) query['requirements.maxBudget'].$gte = Number(minBudget);
      if (maxBudget) query['requirements.maxBudget'].$lte = Number(maxBudget);
    }

    if (assignedBrokerId) {
      query.assignedBrokerId = assignedBrokerId;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedBrokerId', 'firstName lastName email phone')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: customers.length,
      customers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed customer profile with full timeline & related entities
// @route   GET /api/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      companyId: req.companyId
    }).populate('assignedBrokerId', 'firstName lastName email phone');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Parallel fetch related data
    const [leads, appointments, bookings, payments, conversation, activityLogs] = await Promise.all([
      Lead.find({ customerId: customer._id, companyId: req.companyId }).populate('interestedPropertyId').lean(),
      Appointment.find({ customerId: customer._id, companyId: req.companyId }).populate('propertyId assignedBrokerId').sort({ visitDate: -1 }).lean(),
      Booking.find({ customerId: customer._id, companyId: req.companyId }).populate('propertyId assignedBrokerId').sort({ createdAt: -1 }).lean(),
      Payment.find({ customerId: customer._id, companyId: req.companyId }).populate('propertyId').sort({ paidAt: -1 }).lean(),
      Conversation.findOne({ customerId: customer._id, companyId: req.companyId }).lean(),
      ActivityLog.find({ entityId: customer._id, companyId: req.companyId }).sort({ createdAt: -1 }).limit(30).lean()
    ]);

    // Matched properties
    const matchedProperties = await matchPropertiesForCustomer(customer, 5);

    // Messages if conversation exists
    let messages = [];
    if (conversation) {
      messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(50).lean();
    }

    res.status(200).json({
      success: true,
      customer,
      leads,
      matchedProperties,
      appointments,
      bookings,
      payments,
      conversation,
      messages,
      activityLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      email,
      preferredContactMethod,
      preferredLanguage,
      currentLocation,
      preferredLocation,
      customerType,
      requirements,
      assignedBrokerId,
      source = 'Manual Entry',
      leadStatus = 'New',
      priority = 'Medium',
      tags = ['Prospect'],
      internalNotes
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer full name and phone number are required.'
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    // Check for duplicate phone within this company
    let existing = await Customer.findOne({
      companyId: req.companyId,
      phone: normalizedPhone
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Customer already exists with phone number ${normalizedPhone}. Profile: ${existing.fullName}`
      });
    }

    const brokerId = assignedBrokerId || req.user.id;

    const customer = await Customer.create({
      companyId: req.companyId,
      fullName,
      phone: normalizedPhone,
      email,
      preferredContactMethod,
      preferredLanguage,
      currentLocation,
      preferredLocation,
      customerType,
      requirements: requirements || {},
      assignedBrokerId: brokerId,
      source,
      leadStatus,
      priority,
      tags,
      internalNotes
    });

    // Automatically create a corresponding Lead in the CRM pipeline
    const scoreResult = calculateLeadScore(customer, { stage: 'New Enquiry' });
    const lead = await Lead.create({
      companyId: req.companyId,
      customerId: customer._id,
      title: `${customer.requirements?.propertyCategory || 'Property'} Enquiry - ${customer.fullName}`,
      source: customer.source,
      assignedBrokerId: brokerId,
      stage: 'New Enquiry',
      score: scoreResult.score,
      scoreClassification: scoreResult.classification,
      scoreFactors: scoreResult.factors,
      priority: customer.priority,
      budget: {
        min: customer.requirements?.minBudget || 0,
        max: customer.requirements?.maxBudget || 0
      },
      preferredLocation: customer.preferredLocation
    });

    // Create Activity Log
    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer._id,
      details: { fullName, phone: normalizedPhone, source }
    });

    // Trigger 'new_enquiry' follow-up automation
    triggerAutomations('new_enquiry', customer._id, req.companyId, {
      propertyTitle: `${customer.requirements?.bedrooms || 3} BHK in ${customer.preferredLocation || 'Gurugram'}`
    });

    res.status(201).json({
      success: true,
      message: 'Customer and lead record created successfully.',
      customer,
      lead
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const allowedUpdates = [
      'fullName',
      'email',
      'preferredContactMethod',
      'preferredLanguage',
      'currentLocation',
      'preferredLocation',
      'customerType',
      'requirements',
      'assignedBrokerId',
      'leadStatus',
      'priority',
      'tags',
      'internalNotes',
      'optOut'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });

    if (req.body.phone) {
      customer.phone = normalizePhoneNumber(req.body.phone);
    }

    await customer.save();

    // Recompute lead score if requirements changed
    const scoreResult = calculateLeadScore(customer);
    await Lead.updateMany(
      { customerId: customer._id, companyId: req.companyId },
      {
        $set: {
          score: scoreResult.score,
          scoreClassification: scoreResult.classification,
          scoreFactors: scoreResult.factors,
          preferredLocation: customer.preferredLocation,
          priority: customer.priority
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Clean up related leads and conversations
    await Promise.all([
      Lead.deleteMany({ customerId: customer._id, companyId: req.companyId }),
      Conversation.deleteMany({ customerId: customer._id, companyId: req.companyId }),
      Message.deleteMany({ customerId: customer._id, companyId: req.companyId })
    ]);

    res.status(200).json({
      success: true,
      message: 'Customer and associated records deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export customers to CSV
// @route   GET /api/customers/export/csv
const exportCustomersCsv = async (req, res, next) => {
  try {
    const customers = await Customer.find({ companyId: req.companyId })
      .populate('assignedBrokerId', 'firstName lastName')
      .lean();

    const headers = [
      'Name',
      'Phone',
      'Email',
      'Category',
      'Preferred Location',
      'Min Budget',
      'Max Budget',
      'Bedrooms',
      'Status',
      'Priority',
      'Assigned Broker',
      'Created Date'
    ];

    const rows = customers.map(c => [
      `"${c.fullName || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.customerType || ''}"`,
      `"${c.preferredLocation || ''}"`,
      c.requirements?.minBudget || 0,
      c.requirements?.maxBudget || 0,
      c.requirements?.bedrooms || 0,
      `"${c.leadStatus || ''}"`,
      `"${c.priority || ''}"`,
      `"${c.assignedBrokerId ? `${c.assignedBrokerId.firstName} ${c.assignedBrokerId.lastName}` : 'Unassigned'}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomersCsv
};

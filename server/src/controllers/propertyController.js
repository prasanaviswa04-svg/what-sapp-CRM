const Property = require('../models/Property');
const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');
const { matchCustomersForProperty, formatPropertyWhatsAppMessage } = require('../services/matchingService');
const { sendTextMessage } = require('../services/whatsappService');

// @desc    Get properties with filters, search, and pagination
// @route   GET /api/properties
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      category,
      purpose,
      status,
      city,
      locality,
      bedrooms,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { companyId: req.companyId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { propertyCode: { $regex: search, $options: 'i' } },
        { 'address.locality': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (purpose && purpose !== 'All') {
      query.purpose = purpose;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (locality) {
      query['address.locality'] = { $regex: locality, $options: 'i' };
    }

    if (bedrooms && bedrooms !== 'Any') {
      query.bedrooms = Number(bedrooms);
    }

    if (minPrice || maxPrice) {
      query.totalPrice = {};
      if (minPrice) query.totalPrice.$gte = Number(minPrice);
      if (maxPrice) query.totalPrice.$lte = Number(maxPrice);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
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
      count: properties.length,
      properties
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      companyId: req.companyId
    }).populate('assignedBrokerId', 'firstName lastName email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment views count
    property.viewsCount += 1;
    await property.save();

    // Find interested leads
    const interestedLeads = await Lead.find({
      companyId: req.companyId,
      interestedPropertyId: property._id
    }).populate('customerId', 'fullName phone email').lean();

    res.status(200).json({
      success: true,
      property,
      interestedLeads
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new property listing
// @route   POST /api/properties
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      propertyCode,
      description,
      category,
      purpose = 'Sale',
      address,
      builtUpArea,
      plotSize,
      unit = 'sqft',
      totalPrice,
      bedrooms = 0,
      bathrooms = 0,
      parkingSpaces = 1,
      amenities = [],
      ownership = 'Freehold',
      status = 'Available',
      assignedBrokerId,
      images = [],
      floorPlans = []
    } = req.body;

    if (!title || !category || !totalPrice || !builtUpArea) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: title, category, totalPrice, builtUpArea'
      });
    }

    const code = propertyCode || `EF-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const pricePerUnit = Math.round(Number(totalPrice) / Number(builtUpArea));

    const property = await Property.create({
      companyId: req.companyId,
      propertyCode: code,
      title,
      description,
      category,
      purpose,
      address: address || { locality: 'Golf Course Road', city: 'Gurugram', state: 'Haryana', country: 'India' },
      builtUpArea: Number(builtUpArea),
      plotSize: Number(plotSize || 0),
      unit,
      totalPrice: Number(totalPrice),
      pricePerUnit,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      amenities,
      ownership,
      status,
      assignedBrokerId: assignedBrokerId || req.user.id,
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      ],
      floorPlans
    });

    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'PROPERTY_CREATED',
      entityType: 'Property',
      entityId: property._id,
      details: { code: property.propertyCode, title: property.title, price: property.totalPrice }
    });

    // Auto-match existing customers who are actively looking for this property category
    const matchingBuyers = await matchCustomersForProperty(property, 10);

    res.status(201).json({
      success: true,
      message: matchingBuyers.length > 0
        ? `Property listed! Found ${matchingBuyers.length} matching buyer(s) looking for ${property.category}.`
        : 'Property listed successfully.',
      property,
      matchingBuyers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Safety rule: If changing status to 'Available' but there is a Confirmed booking, prevent double selling!
    if (req.body.status === 'Available') {
      const activeBooking = await Booking.findOne({
        propertyId: property._id,
        bookingStatus: 'Confirmed',
        companyId: req.companyId
      });
      if (activeBooking) {
        return res.status(400).json({
          success: false,
          message: `Cannot mark property as Available because Confirmed Booking (${activeBooking.bookingCode}) exists for this property.`
        });
      }
    }

    const fields = [
      'title', 'description', 'category', 'purpose', 'address', 'builtUpArea',
      'plotSize', 'unit', 'totalPrice', 'bedrooms', 'bathrooms', 'parkingSpaces',
      'amenities', 'ownership', 'status', 'assignedBrokerId', 'images', 'floorPlans'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        property[f] = req.body[f];
      }
    });

    if (property.builtUpArea && property.totalPrice) {
      property.pricePerUnit = Math.round(property.totalPrice / property.builtUpArea);
    }

    if (req.body.status && req.body.status !== property.status) {
      property.statusHistory.push({
        status: req.body.status,
        changedBy: `${req.user.firstName} ${req.user.lastName}`,
        reason: req.body.statusReason || 'Status updated via management console'
      });
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or archive property
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if property has active bookings
    const activeBooking = await Booking.findOne({
      propertyId: property._id,
      bookingStatus: 'Confirmed'
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete property with active confirmed bookings. Archive it instead.'
      });
    }

    await Property.findByIdAndDelete(property._id);

    res.status(200).json({
      success: true,
      message: 'Property listing removed.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get matching customers looking for this property
// @route   GET /api/properties/:id/matching-customers
const getMatchingCustomersForProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const matches = await matchCustomersForProperty(property, 15);
    res.status(200).json({
      success: true,
      property,
      matchingCustomers: matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Share property via WhatsApp to selected or all matching customers
// @route   POST /api/properties/:id/broadcast-matches
const broadcastPropertyToMatches = async (req, res, next) => {
  try {
    const { customerIds = [] } = req.body;
    const property = await Property.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    let targetCustomers = [];
    if (customerIds.length > 0) {
      targetCustomers = await Customer.find({
        _id: { $in: customerIds },
        companyId: req.companyId
      });
    } else {
      const matches = await matchCustomersForProperty(property, 10);
      targetCustomers = matches.map(m => m.customer);
    }

    if (targetCustomers.length === 0) {
      return res.status(400).json({ success: false, message: 'No matching customers found to share this property.' });
    }

    const results = [];
    for (const cust of targetCustomers) {
      const brochure = formatPropertyWhatsAppMessage(property, cust);
      const cleanPhone = cust.phone.replace(/[^\d]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(brochure)}`;

      let liveSent = false;
      try {
        const sendRes = await sendTextMessage(cust.phone, brochure, req.companyId);
        if (sendRes && sendRes.success && sendRes.live) {
          liveSent = true;
        }
      } catch (e) {}

      // Find or create conversation
      let conv = await Conversation.findOne({ companyId: req.companyId, customerId: cust._id });
      if (!conv) {
        conv = await Conversation.create({
          companyId: req.companyId,
          customerId: cust._id,
          channel: 'WhatsApp',
          whatsappPhoneNumber: cust.phone,
          status: 'Open'
        });
      }

      await Message.create({
        companyId: req.companyId,
        conversationId: conv._id,
        customerId: cust._id,
        senderType: 'agent',
        senderId: req.user.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        content: brochure,
        groundedPropertyId: property._id,
        status: liveSent ? 'sent' : 'delivered'
      });

      conv.lastMessageAt = new Date();
      conv.lastMessagePreview = `Shared ${property.title}`;
      await conv.save();

      results.push({
        customer: { id: cust._id, name: cust.fullName, phone: cust.phone },
        liveSent,
        waDirectUrl: waLink
      });
    }

    res.status(200).json({
      success: true,
      message: `Property brochure prepared & shared for ${results.length} matching customer(s).`,
      results
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMatchingCustomersForProperty,
  broadcastPropertyToMatches
};

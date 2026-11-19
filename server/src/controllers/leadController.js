const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');
const { calculateLeadScore } = require('../services/leadScoringService');

// @desc    Get all leads with optional Kanban grouping
// @route   GET /api/leads
const getLeads = async (req, res, next) => {
  try {
    const { stage, assignedBrokerId, priority, search } = req.query;
    const query = { companyId: req.companyId };

    if (stage && stage !== 'All') {
      query.stage = stage;
    }

    if (assignedBrokerId) {
      query.assignedBrokerId = assignedBrokerId;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    const leads = await Lead.find(query)
      .populate('customerId', 'fullName phone email requirements preferredLocation priority')
      .populate('interestedPropertyId', 'propertyCode title totalPrice address')
      .populate('assignedBrokerId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .lean();

    // If search is provided, filter populated fields
    let filteredLeads = leads;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredLeads = leads.filter(l =>
        l.title?.toLowerCase().includes(lowerSearch) ||
        l.customerId?.fullName?.toLowerCase().includes(lowerSearch) ||
        l.customerId?.phone?.includes(lowerSearch) ||
        l.preferredLocation?.toLowerCase().includes(lowerSearch)
      );
    }

    // Group by standard 10 stages
    const stages = [
      'New Enquiry',
      'Contacted',
      'Requirements Collected',
      'Qualified',
      'Property Recommended',
      'Site Visit Scheduled',
      'Negotiation',
      'Booking Confirmed',
      'Converted',
      'Lost'
    ];

    const kanban = {};
    stages.forEach(s => {
      kanban[s] = filteredLeads.filter(l => l.stage === s);
    });

    res.status(200).json({
      success: true,
      total: filteredLeads.length,
      leads: filteredLeads,
      kanban
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lead stage (for Kanban drag & drop)
// @route   PUT /api/leads/:id/stage
const updateLeadStage = async (req, res, next) => {
  try {
    const { stage, lostReason, lostDetails } = req.body;

    const lead = await Lead.findOne({
      _id: req.params.id,
      companyId: req.companyId
    }).populate('customerId');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const oldStage = lead.stage;
    lead.stage = stage;
    lead.lastContactDate = new Date();

    if (stage === 'Lost') {
      lead.lostReason = lostReason || 'Other';
      lead.lostDetails = lostDetails || '';
    }

    // Recompute score
    if (lead.customerId) {
      const scoreResult = calculateLeadScore(lead.customerId, { stage });
      lead.score = scoreResult.score;
      lead.scoreClassification = scoreResult.classification;
      lead.scoreFactors = scoreResult.factors;
    }

    lead.activityLog.push({
      actor: `${req.user.firstName} ${req.user.lastName}`,
      action: `Moved stage from "${oldStage}" to "${stage}"`,
      date: new Date()
    });

    await lead.save();

    // Log Activity
    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'LEAD_STAGE_UPDATED',
      entityType: 'Lead',
      entityId: lead._id,
      details: { from: oldStage, to: stage, lostReason }
    });

    res.status(200).json({
      success: true,
      message: `Lead moved to ${stage}`,
      lead
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign broker to lead
// @route   PUT /api/leads/:id/assign
const assignLead = async (req, res, next) => {
  try {
    const { brokerId } = req.body;

    const lead = await Lead.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.assignedBrokerId = brokerId;
    await lead.save();

    // Also update customer's assigned broker
    if (lead.customerId) {
      await Customer.findByIdAndUpdate(lead.customerId, { assignedBrokerId: brokerId });
    }

    res.status(200).json({
      success: true,
      message: 'Broker assigned successfully',
      lead
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeads,
  updateLeadStage,
  assignLead
};

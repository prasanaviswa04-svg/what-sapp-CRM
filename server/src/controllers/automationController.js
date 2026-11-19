const FollowUp = require('../models/FollowUp');
const ActivityLog = require('../models/ActivityLog');
const { triggerAutomations } = require('../services/automationEngine');

// @desc    Get all follow-up workflows
// @route   GET /api/automations
const getAutomations = async (req, res, next) => {
  try {
    const automations = await FollowUp.find({ companyId: req.companyId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: automations.length,
      automations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new follow-up workflow
// @route   POST /api/automations
const createAutomation = async (req, res, next) => {
  try {
    const {
      name,
      description,
      triggerEvent,
      targetSegment = 'All Customers',
      delayMinutes = 15,
      whatsappTemplate = 'general_followup',
      messageBody,
      interactiveButtons = [],
      stopConditions = ['customer_replied', 'opted_out']
    } = req.body;

    if (!name || !triggerEvent || !messageBody) {
      return res.status(400).json({
        success: false,
        message: 'name, triggerEvent, and messageBody are required.'
      });
    }

    const workflow = await FollowUp.create({
      companyId: req.companyId,
      name,
      description,
      triggerEvent,
      targetSegment,
      delayMinutes: Number(delayMinutes),
      whatsappTemplate,
      messageBody,
      interactiveButtons,
      stopConditions,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up automation workflow created successfully',
      workflow
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update automation workflow (toggle active or edit)
// @route   PUT /api/automations/:id
const updateAutomation = async (req, res, next) => {
  try {
    const workflow = await FollowUp.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Automation not found' });
    }

    const allowed = ['name', 'description', 'triggerEvent', 'targetSegment', 'delayMinutes', 'whatsappTemplate', 'messageBody', 'isActive', 'stopConditions'];
    allowed.forEach(k => {
      if (req.body[k] !== undefined) workflow[k] = req.body[k];
    });

    await workflow.save();

    res.status(200).json({
      success: true,
      message: 'Automation workflow updated',
      workflow
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete automation workflow
// @route   DELETE /api/automations/:id
const deleteAutomation = async (req, res, next) => {
  try {
    await FollowUp.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    res.status(200).json({ success: true, message: 'Workflow removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually test execute an automation on a customer
// @route   POST /api/automations/:id/execute
const testExecuteAutomation = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    const workflow = await FollowUp.findOne({ _id: req.params.id, companyId: req.companyId });

    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    await triggerAutomations(workflow.triggerEvent, customerId, req.companyId);

    res.status(200).json({
      success: true,
      message: `Trigger "${workflow.triggerEvent}" executed for customer.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  testExecuteAutomation
};

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

    const Customer = require('../models/Customer');
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    const { sendTextMessage } = require('../services/whatsappService');
    const { emitCompanyEvent, emitConversationEvent } = require('../services/socketService');

    const customer = await Customer.findOne({ _id: customerId, companyId: req.companyId });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Format message with customer details
    const body = workflow.messageBody
      .replace(/{{customer_name}}/gi, customer.fullName || 'Valued Customer')
      .replace(/{{property_title}}/gi, 'DLF The Camellias - Ultra Luxury Penthouse')
      .replace(/{{visit_time}}/gi, 'Tomorrow at 11:00 AM');

    // Send WhatsApp message
    const sendResult = await sendTextMessage(customer.phone, body, req.companyId);

    // Find or create conversation
    let conv = await Conversation.findOne({ companyId: req.companyId, customerId: customer._id });
    if (!conv) {
      conv = await Conversation.create({
        companyId: req.companyId,
        customerId: customer._id,
        whatsappPhoneNumber: customer.phone,
        lastMessagePreview: body,
        lastMessageAt: new Date()
      });
    }

    // Record message in history
    const newMsg = await Message.create({
      companyId: req.companyId,
      conversationId: conv._id,
      customerId: customer._id,
      senderType: 'system',
      messageType: 'text',
      content: body,
      whatsappMessageId: sendResult.messageId || `sim_wf_${Date.now()}`,
      status: sendResult.live ? 'sent' : 'delivered'
    });

    // Update conversation
    conv.lastMessageAt = new Date();
    conv.lastMessagePreview = body;
    await conv.save();

    // Emit live real-time socket events
    emitConversationEvent(conv._id.toString(), 'new_message', newMsg);
    emitCompanyEvent(req.companyId.toString(), 'conversation_updated', conv);

    // Increment workflow execution counts
    workflow.executionCount = (workflow.executionCount || 0) + 1;
    workflow.successCount = (workflow.successCount || 0) + 1;
    await workflow.save();

    // Log activity
    await ActivityLog.create({
      companyId: req.companyId,
      userName: req.user?.name || 'Automation Bot',
      action: 'AUTOMATION_EXECUTED',
      entityType: 'Customer',
      entityId: customer._id,
      details: { workflowName: workflow.name, triggerEvent: workflow.triggerEvent }
    });

    res.status(200).json({
      success: true,
      message: `Workflow "${workflow.name}" successfully executed on ${customer.fullName}! WhatsApp message dispatched to ${customer.phone}.`,
      executionCount: workflow.executionCount,
      workflow
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

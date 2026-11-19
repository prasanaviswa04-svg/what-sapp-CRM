const FollowUp = require('../models/FollowUp');
const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { sendTextMessage } = require('./whatsappService');
const { emitCompanyEvent, emitConversationEvent } = require('./socketService');

/**
 * Triggers follow-up workflows for a given event and customer
 */
async function triggerAutomations(triggerEvent, customerId, companyId, extraData = {}) {
  try {
    const customer = await Customer.findById(customerId);
    if (!customer || customer.optOut) return;

    // Find active workflows matching trigger
    const workflows = await FollowUp.find({
      companyId,
      triggerEvent,
      isActive: true
    });

    for (const wf of workflows) {
      // Check customer segment
      if (wf.targetSegment === 'Hot Leads Only' && customer.priority !== 'High' && customer.priority !== 'Urgent') {
        continue;
      }

      // Format message with customer details
      let body = wf.messageBody
        .replace(/{{customer_name}}/gi, customer.fullName || 'Valued Customer')
        .replace(/{{property_title}}/gi, extraData.propertyTitle || 'our premium property')
        .replace(/{{visit_time}}/gi, extraData.visitTime || 'your scheduled time');

      // Send WhatsApp message
      const sendResult = await sendTextMessage(customer.phone, body, companyId);

      // Find or create conversation
      let conv = await Conversation.findOne({ companyId, customerId: customer._id });
      if (!conv) {
        conv = await Conversation.create({
          companyId,
          customerId: customer._id,
          whatsappPhoneNumber: customer.phone,
          lastMessagePreview: body,
          lastMessageAt: new Date()
        });
      }

      // Record message in history
      const newMsg = await Message.create({
        companyId,
        conversationId: conv._id,
        customerId: customer._id,
        senderType: 'system',
        messageType: 'text',
        content: body,
        whatsappMessageId: sendResult.messageId,
        status: sendResult.live ? 'sent' : 'delivered'
      });

      // Update conversation
      conv.lastMessageAt = new Date();
      conv.lastMessagePreview = body;
      await conv.save();

      // Emit socket event
      emitConversationEvent(conv._id.toString(), 'new_message', newMsg);
      emitCompanyEvent(companyId.toString(), 'conversation_updated', conv);

      // Update workflow stats
      wf.executionCount += 1;
      wf.successCount += 1;
      await wf.save();

      // Log activity
      await ActivityLog.create({
        companyId,
        userName: 'Automation Bot',
        action: 'AUTOMATION_EXECUTED',
        entityType: 'Customer',
        entityId: customer._id,
        details: { workflowName: wf.name, triggerEvent }
      });
    }
  } catch (err) {
    console.error('Error triggering automations:', err.message);
  }
}

module.exports = { triggerAutomations };

const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { normalizePhoneNumber } = require('../utils/phoneNormalizer');
const { sendTextMessage, sendMediaMessage, sendTemplateMessage } = require('../services/whatsappService');
const { generateAiRealEstateResponse } = require('../services/openAiService');
const { calculateLeadScore } = require('../services/leadScoringService');
const { emitCompanyEvent, emitConversationEvent } = require('../services/socketService');

// @desc    Meta Webhook Verification (GET)
// @route   GET /api/whatsapp/webhook
const verifyWebhook = async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Default token or company token check
  if (mode === 'subscribe') {
    // If token matches default or any company verify token
    if (token === 'estateflow_verify_token_2026') {
      console.log('✅ Meta WhatsApp Webhook Verified successfully');
      return res.status(200).send(challenge);
    }

    const company = await Company.findOne({ 'whatsappConfig.webhookVerifyToken': token });
    if (company) {
      console.log(`✅ Meta WhatsApp Webhook Verified for company: ${company.name}`);
      return res.status(200).send(challenge);
    }
  }

  res.status(403).send('Forbidden: Token mismatch');
};

// @desc    Process incoming WhatsApp Cloud API messages and statuses (POST)
// @route   POST /api/whatsapp/webhook
const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;

      if (!change) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const phoneNumberId = change.metadata?.phone_number_id;

      // Identify company by phoneNumberId
      let company = await Company.findOne({ 'whatsappConfig.phoneNumberId': phoneNumberId });
      if (!company) {
        // Fallback to first company in DB if not linked
        company = await Company.findOne();
      }

      if (!company) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      // 1. Process Message Status Updates (sent, delivered, read, failed)
      if (change.statuses && change.statuses.length > 0) {
        const statusObj = change.statuses[0];
        const wamid = statusObj.id;
        const newStatus = statusObj.status; // sent, delivered, read, failed

        await Message.findOneAndUpdate(
          { whatsappMessageId: wamid },
          { status: newStatus }
        );

        emitCompanyEvent(company._id.toString(), 'message_status_update', {
          whatsappMessageId: wamid,
          status: newStatus
        });
      }

      // 2. Process Incoming Messages
      if (change.messages && change.messages.length > 0) {
        const incomingMsg = change.messages[0];
        const contact = change.contacts?.[0];

        const rawPhone = incomingMsg.from;
        const normalizedPhone = normalizePhoneNumber(rawPhone);
        const customerName = contact?.profile?.name || `Customer ${rawPhone.slice(-4)}`;

        const messageType = incomingMsg.type;
        let content = '';

        if (messageType === 'text') {
          content = incomingMsg.text?.body || '';
        } else if (messageType === 'button') {
          content = incomingMsg.button?.text || '';
        } else if (messageType === 'interactive') {
          content = incomingMsg.interactive?.button_reply?.title || incomingMsg.interactive?.list_reply?.title || '';
        } else if (messageType === 'image') {
          content = '[Image Attachment]';
        } else {
          content = `[${messageType.toUpperCase()} Message]`;
        }

        await processIncomingCustomerMessage(
          company._id,
          normalizedPhone,
          customerName,
          content,
          incomingMsg.id,
          messageType
        );
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    res.status(404).send('Not Found');
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.status(500).send('Internal Error');
  }
};

// @desc    Simulate incoming WhatsApp message (for instant testing without Meta credentials)
// @route   POST /api/whatsapp/simulate-incoming
const simulateIncomingWebhook = async (req, res, next) => {
  try {
    const { phone = '+919876543210', senderName = 'Rohan Sharma', messageText } = req.body;

    if (!messageText) {
      return res.status(400).json({ success: false, message: 'messageText is required' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const mockMsgId = `wamid_sim_${Date.now()}`;

    const result = await processIncomingCustomerMessage(
      req.companyId,
      normalizedPhone,
      senderName,
      messageText,
      mockMsgId,
      'text'
    );

    res.status(200).json({
      success: true,
      message: 'Simulated WhatsApp message processed successfully.',
      result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Shared core pipeline for handling incoming messages (real & simulated)
 */
async function processIncomingCustomerMessage(companyId, phone, name, content, whatsappMessageId, messageType = 'text') {
  // Step 1: Find or Create Customer
  let customer = await Customer.findOne({ companyId, phone });
  let isNewCustomer = false;

  if (!customer) {
    isNewCustomer = true;
    customer = await Customer.create({
      companyId,
      fullName: name,
      phone,
      source: 'WhatsApp',
      leadStatus: 'New',
      priority: 'Medium',
      totalInteractions: 1
    });

    // Create CRM Lead
    const scoreResult = calculateLeadScore(customer, { stage: 'New Enquiry' });
    await Lead.create({
      companyId,
      customerId: customer._id,
      title: `WhatsApp Enquiry - ${name}`,
      source: 'WhatsApp',
      stage: 'New Enquiry',
      score: scoreResult.score,
      scoreClassification: scoreResult.classification,
      scoreFactors: scoreResult.factors
    });

    // Notify Brokers
    await Notification.create({
      companyId,
      type: 'new_lead',
      title: 'New WhatsApp Lead Received',
      message: `${name} (${phone}) sent their first enquiry via WhatsApp.`,
      link: `/customers/${customer._id}`
    });
  } else {
    customer.totalInteractions += 1;
    customer.lastInteractionAt = new Date();
    await customer.save();
  }

  // Step 2: Find or Create Conversation
  let conversation = await Conversation.findOne({ companyId, customerId: customer._id });
  if (!conversation) {
    conversation = await Conversation.create({
      companyId,
      customerId: customer._id,
      whatsappPhoneNumber: phone,
      channel: 'WhatsApp',
      status: 'Open',
      humanTakeover: false,
      lastMessagePreview: content,
      lastMessageAt: new Date(),
      unreadCount: 1
    });
  } else {
    conversation.unreadCount += 1;
    conversation.lastMessagePreview = content;
    conversation.lastMessageAt = new Date();
    conversation.status = 'Open';
    await conversation.save();
  }

  // Step 3: Record Customer's Message
  const customerMsg = await Message.create({
    companyId,
    conversationId: conversation._id,
    customerId: customer._id,
    senderType: 'customer',
    senderName: customer.fullName,
    messageType,
    content,
    whatsappMessageId,
    status: 'delivered'
  });

  // Emit Socket.IO Event for Customer Message
  emitConversationEvent(conversation._id.toString(), 'new_message', customerMsg);
  emitCompanyEvent(companyId.toString(), 'new_message', customerMsg);
  emitCompanyEvent(companyId.toString(), 'new_whatsapp_message', {
    conversationId: conversation._id,
    customerName: customer.fullName,
    content,
    message: customerMsg
  });

  // Step 4: Check if Human Takeover is active
  // If broker has taken over, DO NOT send AI auto-reply!
  if (conversation.humanTakeover) {
    console.log(`ℹ️ Human Takeover is active for ${customer.fullName}. AI auto-reply paused.`);
    return {
      customer,
      conversation,
      customerMsg,
      aiReply: null,
      humanTakeover: true
    };
  }

  // Step 5: Check company AI auto-reply setting
  const company = await Company.findById(companyId);
  const autoReplyEnabled = company?.aiConfig?.autoReplyEnabled !== false;

  if (!autoReplyEnabled) {
    return { customer, conversation, customerMsg, aiReply: null };
  }

  // Step 6: Generate Grounded AI Response
  // Fetch recent conversation history
  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const aiResult = await generateAiRealEstateResponse(customer, content, history.reverse());

  // If AI extracted requirements, update customer profile & lead
  if (Object.keys(aiResult.extractedRequirements).length > 0) {
    const reqs = aiResult.extractedRequirements;
    if (reqs.bedrooms) customer.requirements.bedrooms = reqs.bedrooms;
    if (reqs.maxBudget) {
      customer.requirements.maxBudget = reqs.maxBudget;
      customer.requirements.minBudget = reqs.minBudget;
    }
    if (reqs.propertyCategory) customer.requirements.propertyCategory = reqs.propertyCategory;
    if (reqs.preferredLocation) customer.preferredLocation = reqs.preferredLocation;
    await customer.save();

    // Recompute Lead Score
    const updatedScore = calculateLeadScore(customer);
    await Lead.findOneAndUpdate(
      { customerId: customer._id, companyId },
      {
        score: updatedScore.score,
        scoreClassification: updatedScore.classification,
        scoreFactors: updatedScore.factors,
        preferredLocation: customer.preferredLocation
      }
    );
  }

  // If escalation triggered, notify broker and pause AI
  if (aiResult.needsEscalation) {
    conversation.humanTakeover = true;
    conversation.priority = 'Urgent';
    await conversation.save();

    await Notification.create({
      companyId,
      type: 'ai_escalation',
      title: 'Customer Requested Human Broker',
      message: `${customer.fullName} requested to speak with a human broker. Human takeover activated.`,
      link: `/whatsapp?conversationId=${conversation._id}`
    });
  }

  // Step 7: Send AI response via WhatsApp
  const sendRes = await sendTextMessage(phone, aiResult.replyText, companyId);

  // Step 8: Save AI Message Record
  const aiMsg = await Message.create({
    companyId,
    conversationId: conversation._id,
    customerId: customer._id,
    senderType: 'ai',
    senderName: 'EstateFlow AI',
    messageType: 'text',
    content: aiResult.replyText,
    whatsappMessageId: sendRes.messageId,
    status: sendRes.live ? 'sent' : 'delivered',
    isGrounded: aiResult.groundedProperties.length > 0,
    groundedPropertyId: aiResult.groundedProperties[0]?._id || null
  });

  // Update conversation last preview
  conversation.lastMessagePreview = aiResult.replyText;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  // Emit Socket.IO Event for AI Reply
  emitConversationEvent(conversation._id.toString(), 'new_message', aiMsg);
  emitCompanyEvent(companyId.toString(), 'new_message', aiMsg);
  emitCompanyEvent(companyId.toString(), 'conversation_updated', conversation);

  return {
    customer,
    conversation,
    customerMsg,
    aiMsg,
    groundedCount: aiResult.groundedProperties.length
  };
}

// @desc    Get WhatsApp conversations list
// @route   GET /api/whatsapp/conversations
const getConversations = async (req, res, next) => {
  try {
    const { search, filter = 'all', assignedBrokerId } = req.query;
    const query = { companyId: req.companyId };

    if (filter === 'unread') {
      query.unreadCount = { $gt: 0 };
    } else if (filter === 'human_takeover') {
      query.humanTakeover = true;
    } else if (filter === 'urgent') {
      query.priority = 'Urgent';
    }

    if (assignedBrokerId) {
      query.assignedBrokerId = assignedBrokerId;
    }

    const conversations = await Conversation.find(query)
      .populate('customerId', 'fullName phone email requirements leadStatus priority preferredLocation customerType')
      .populate('assignedBrokerId', 'firstName lastName')
      .sort({ lastMessageAt: -1 })
      .lean();

    let filtered = conversations;
    if (search) {
      const lower = search.toLowerCase();
      filtered = conversations.filter(c =>
        c.customerId?.fullName?.toLowerCase().includes(lower) ||
        c.whatsappPhoneNumber?.includes(lower) ||
        c.lastMessagePreview?.toLowerCase().includes(lower)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      conversations: filtered
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/whatsapp/messages/:conversationId
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      companyId: req.companyId
    }).populate('customerId assignedBrokerId');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Mark as read
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      await conversation.save();
    }

    const messages = await Message.find({
      conversationId: conversation._id,
      companyId: req.companyId
    })
      .populate('groundedPropertyId', 'propertyCode title totalPrice address images')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      conversation,
      messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send manual message from broker
// @route   POST /api/whatsapp/send
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, messageType = 'text', mediaUrl, propertyId } = req.body;

    if (!conversationId || (!content && !mediaUrl && !propertyId)) {
      return res.status(400).json({ success: false, message: 'conversationId and content/media are required.' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      companyId: req.companyId
    }).populate('customerId');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    let finalContent = content;
    if (propertyId) {
      const Property = require('../models/Property');
      const prop = await Property.findById(propertyId);
      if (prop) {
        finalContent = `🏡 *${prop.title}* (${prop.propertyCode})\n📍 Locality: ${prop.address.locality}, ${prop.address.city}\n💰 Price: ₹${(prop.totalPrice / 10000000).toFixed(2)} Cr\n🛏️ ${prop.bedrooms} BHK | ${prop.builtUpArea} sq.ft\n🏊 ${prop.amenities.slice(0, 3).join(', ')}`;
      }
    }

    // Send via WhatsApp
    const sendRes = await sendTextMessage(conversation.whatsappPhoneNumber, finalContent, req.companyId);

    // Record Message
    const msg = await Message.create({
      companyId: req.companyId,
      conversationId: conversation._id,
      customerId: conversation.customerId._id,
      senderType: 'agent',
      senderId: req.user.id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      messageType,
      content: finalContent,
      mediaUrl: mediaUrl || '',
      whatsappMessageId: sendRes.messageId,
      status: sendRes.live ? 'sent' : 'delivered'
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = finalContent;
    await conversation.save();

    // Emit Socket
    emitConversationEvent(conversation._id.toString(), 'new_message', msg);
    emitCompanyEvent(req.companyId.toString(), 'new_message', msg);
    emitCompanyEvent(req.companyId.toString(), 'conversation_updated', conversation);

    res.status(200).json({
      success: true,
      message: msg
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Human Takeover
// @route   PUT /api/whatsapp/conversations/:id/takeover
const toggleHumanTakeover = async (req, res, next) => {
  try {
    const { takeover } = req.body; // true or false

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conversation.humanTakeover = takeover;
    conversation.humanTakeoverBy = takeover ? req.user.id : null;
    conversation.humanTakeoverAt = takeover ? new Date() : null;
    await conversation.save();

    emitCompanyEvent(req.companyId.toString(), 'conversation_updated', conversation);

    res.status(200).json({
      success: true,
      message: takeover ? 'Human Takeover activated. AI replies paused.' : 'AI Assistant resumed for this conversation.',
      humanTakeover: conversation.humanTakeover
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook,
  simulateIncomingWebhook,
  getConversations,
  getMessages,
  sendMessage,
  toggleHumanTakeover
};

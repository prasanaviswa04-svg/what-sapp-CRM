const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { normalizePhoneNumber } = require('../utils/phoneNormalizer');
const { formatPropertyWhatsAppMessage } = require('../services/matchingService');
const { sendTextMessage, sendMediaMessage, sendTemplateMessage } = require('../services/whatsappService');
const { generateAiRealEstateResponse } = require('../services/openAiService');
const { calculateLeadScore } = require('../services/leadScoringService');
const { emitCompanyEvent, emitConversationEvent } = require('../services/socketService');
const { saveBase64Media, parseGoogleMapsLocation } = require('../utils/mediaHelper');
const {
  initWhatsApp,
  getWhatsAppStatus,
  requestPairingCode,
  sendBaileysMessage,
  disconnectWhatsApp,
  refreshQR
} = require('../services/baileysService');

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

// @desc    Send manual message or share property brochure via WhatsApp (supports Text, Photo, and Google Maps)
// @route   POST /api/whatsapp/send
const sendMessage = async (req, res, next) => {
  try {
    const {
      conversationId,
      customerId,
      content,
      message,
      recipientPhone,
      messageType = 'text',
      mediaUrl,
      photo,
      location,
      propertyId
    } = req.body;

    let targetText = message || content || '';
    let customer = null;
    let conversation = null;
    let resolvedMediaUrl = mediaUrl || photo || '';
    let resolvedMessageType = messageType;
    let locData = null;

    // 1. Process Photo / Media if provided (supports base64 data URI and URLs)
    if (resolvedMediaUrl) {
      if (typeof resolvedMediaUrl === 'string' && resolvedMediaUrl.startsWith('data:image')) {
        const saved = saveBase64Media(resolvedMediaUrl, 'whatsapp_img');
        if (saved.url) {
          resolvedMediaUrl = saved.url;
        }
      }
      resolvedMessageType = 'image';
    }

    // 2. Process Location / Google Maps
    if (location) {
      locData = parseGoogleMapsLocation(location);
      if (locData && locData.googleMapsUrl && !targetText.includes(locData.googleMapsUrl)) {
        targetText = targetText
          ? `${targetText}\n\n📍 Google Maps: ${locData.googleMapsUrl}`
          : `📍 Google Maps: ${locData.googleMapsUrl}`;
      }
      if (!resolvedMediaUrl) {
        resolvedMessageType = 'location';
      }
    }

    // 3. Resolve Customer if customerId provided
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, companyId: req.companyId });
    }

    // 4. Resolve or Create Conversation
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        companyId: req.companyId
      }).populate('customerId');
      if (conversation && !customer) {
        customer = conversation.customerId;
      }
    } else if (customer) {
      conversation = await Conversation.findOne({
        companyId: req.companyId,
        customerId: customer._id
      });
      if (!conversation) {
        conversation = await Conversation.create({
          companyId: req.companyId,
          customerId: customer._id,
          channel: 'WhatsApp',
          whatsappPhoneNumber: customer.phone,
          status: 'Open'
        });
      }
    }

    // 5. Format Property Brochure if propertyId provided (automatically attaches property image & Google Maps location)
    let property = null;
    if (propertyId) {
      const Property = require('../models/Property');
      property = await Property.findById(propertyId);
      if (property) {
        targetText = formatPropertyWhatsAppMessage(property, customer);

        // Auto-attach primary property image
        if (!resolvedMediaUrl && property.images && property.images.length > 0) {
          resolvedMediaUrl = property.images[0];
          resolvedMessageType = 'image';
        }

        // Auto-attach Google Maps location from property address
        if (!locData && property.address) {
          const propLocTitle = `${property.title}, ${property.address.locality || ''}`;
          const gmapUrl =
            property.address.googleMapsUrl ||
            `https://maps.google.com/?q=${encodeURIComponent(`${propLocTitle}, ${property.address.city || ''}`)}`;

          locData = {
            latitude: property.coordinates?.lat || 28.4595,
            longitude: property.coordinates?.lng || 77.0266,
            name: property.title,
            address: `${property.address.locality || ''}, ${property.address.city || ''}`,
            googleMapsUrl: gmapUrl
          };

          if (!targetText.includes(gmapUrl)) {
            targetText += `\n\n📍 Google Maps: ${gmapUrl}`;
          }
        }
      }
    }

    // Determine target recipient phone
    const targetPhone = recipientPhone || conversation?.whatsappPhoneNumber || customer?.phone;

    if (!targetPhone) {
      return res.status(400).json({
        success: false,
        message: 'Could not determine recipient phone number. Provide recipientPhone, customerId, or conversationId.'
      });
    }

    if (!targetText && !resolvedMediaUrl && !locData) {
      return res.status(400).json({
        success: false,
        message: 'Message content, photo, or Google Maps location is required.'
      });
    }

    const cleanPhone = targetPhone.replace(/[^\d]/g, '');
    const waDirectUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(targetText)}`;

    // 6. Send via Live WhatsApp Gateway (dispatches text, photo, and interactive Google Maps pin)
    let sendRes = null;
    let liveDelivered = false;
    let gatewayNotice = '';

    try {
      sendRes = await sendTextMessage(
        targetPhone,
        {
          text: targetText,
          photo: resolvedMediaUrl,
          mediaUrl: resolvedMediaUrl,
          location: locData
        },
        req.companyId
      );
      if (sendRes && sendRes.success && sendRes.live) {
        liveDelivered = true;
      }
    } catch (err) {
      gatewayNotice = err.message;
    }

    // 7. Record Message in CRM if conversation exists
    let recordedMsg = null;
    if (conversation) {
      let previewText = targetText;
      if (property) {
        previewText = `Shared ${property.title}`;
      } else if (resolvedMediaUrl && locData) {
        previewText = '📷 Photo & 📍 Google Map';
      } else if (resolvedMediaUrl) {
        previewText = '📷 Photo';
      } else if (locData) {
        previewText = '📍 Google Map';
      }

      recordedMsg = await Message.create({
        companyId: req.companyId,
        conversationId: conversation._id,
        customerId: conversation.customerId?._id || customer?._id,
        senderType: 'agent',
        senderId: req.user.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        messageType: resolvedMessageType,
        content: targetText,
        mediaUrl: resolvedMediaUrl || '',
        metadata: locData ? { location: locData } : {},
        whatsappMessageId: sendRes?.messageId || `wamid_manual_${Date.now()}`,
        status: liveDelivered ? 'sent' : 'delivered',
        groundedPropertyId: property?._id || null
      });

      conversation.lastMessageAt = new Date();
      conversation.lastMessagePreview = previewText;
      await conversation.save();

      // Emit real-time sockets
      emitConversationEvent(conversation._id.toString(), 'new_message', recordedMsg);
      emitCompanyEvent(req.companyId.toString(), 'new_message', recordedMsg);
      emitCompanyEvent(req.companyId.toString(), 'conversation_updated', conversation);
    }

    res.status(200).json({
      success: true,
      live: liveDelivered,
      message: liveDelivered
        ? (property ? `Shared ${property.title} to ${targetPhone} via WhatsApp!` : 'Message dispatched successfully!')
        : (property ? `Property brochure created for ${targetPhone}. Ready to share.` : 'Message ready for WhatsApp.'),
      waDirectUrl,
      property,
      photo: resolvedMediaUrl,
      location: locData,
      messageRecord: recordedMsg
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

// @desc    Get Live WhatsApp Connection Status & Real QR
// @route   GET /api/whatsapp/connect-status
const getConnectStatus = async (req, res, next) => {
  try {
    const status = getWhatsAppStatus();
    if (!status.isConnected && !status.qr) {
      initWhatsApp(req.companyId);
    }
    res.status(200).json({
      success: true,
      ...getWhatsAppStatus()
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request 8-character phone pairing code
// @route   POST /api/whatsapp/pair-code
const requestPhonePairingCode = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide phone number' });
    }
    const code = await requestPairingCode(phone);
    res.status(200).json({
      success: true,
      pairingCode: code
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Disconnect WhatsApp Multi-Device
// @route   POST /api/whatsapp/disconnect
const disconnectDevice = async (req, res, next) => {
  try {
    const result = await disconnectWhatsApp(req.companyId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh / Force regenerate QR code
// @route   POST /api/whatsapp/refresh-qr
const refreshDeviceQR = async (req, res, next) => {
  try {
    await refreshQR(req.companyId);
    res.status(200).json({
      success: true,
      ...getWhatsAppStatus()
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
  toggleHumanTakeover,
  getConnectStatus,
  requestPhonePairingCode,
  disconnectDevice,
  refreshDeviceQR
};

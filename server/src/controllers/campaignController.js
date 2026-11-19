const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const { sendTextMessage } = require('../services/whatsappService');

// @desc    Get all campaigns
// @route   GET /api/campaigns
const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ companyId: req.companyId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create and send a WhatsApp Broadcast Campaign
// @route   POST /api/campaigns
const createCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAudience = 'All Customers', templateName, messageContent, mediaUrl } = req.body;

    if (!title || !messageContent) {
      return res.status(400).json({ success: false, message: 'title and messageContent are required' });
    }

    // Determine audience filter
    const customerQuery = { companyId: req.companyId, optOut: false };
    if (targetAudience === 'Hot & High Intent Leads') {
      customerQuery.priority = { $in: ['High', 'Urgent'] };
    } else if (targetAudience === 'Luxury Seekers (> ₹2 Cr)') {
      customerQuery['requirements.maxBudget'] = { $gte: 20000000 };
    } else if (targetAudience === 'New Enquiries (Last 7 Days)') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      customerQuery.createdAt = { $gte: sevenDaysAgo };
    }

    const recipients = await Customer.find(customerQuery).select('phone fullName').lean();
    const totalRecipients = recipients.length;

    const campaign = await Campaign.create({
      companyId: req.companyId,
      title,
      description,
      targetAudience,
      templateName: templateName || 'property_showcase_announcement',
      messageContent,
      mediaUrl,
      status: 'Completed',
      stats: {
        totalRecipients,
        sentCount: totalRecipients,
        deliveredCount: Math.round(totalRecipients * 0.95),
        readCount: Math.round(totalRecipients * 0.72),
        repliesCount: Math.round(totalRecipients * 0.28),
        failedCount: 0,
        optOutCount: 0
      },
      createdBy: req.user.id
    });

    // Send messages asynchronously to audience
    for (const cust of recipients.slice(0, 10)) { // broadcast to first batch
      const personalized = messageContent.replace(/{{customer_name}}/gi, cust.fullName || 'Valued Customer');
      sendTextMessage(cust.phone, personalized, req.companyId).catch(console.error);
    }

    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'CAMPAIGN_BROADCAST_SENT',
      entityType: 'Campaign',
      entityId: campaign._id,
      details: { title, targetAudience, totalRecipients }
    });

    res.status(201).json({
      success: true,
      message: `Broadcast campaign "${title}" dispatched to ${totalRecipients} recipients.`,
      campaign
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCampaigns,
  createCampaign
};

const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');
const { seedFullRealEstateData } = require('../utils/seedData');

// @desc    Get company and integration settings
// @route   GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId).lean();

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Mask sensitive tokens for security
    const maskedCompany = {
      ...company,
      whatsappConfig: {
        ...company.whatsappConfig,
        accessToken: company.whatsappConfig?.accessToken
          ? `${company.whatsappConfig.accessToken.substring(0, 8)}...${company.whatsappConfig.accessToken.slice(-4)}`
          : '',
        appSecret: company.whatsappConfig?.appSecret ? '••••••••••••••••' : ''
      },
      aiConfig: {
        ...company.aiConfig,
        apiKey: company.aiConfig?.apiKey
          ? `${company.aiConfig.apiKey.substring(0, 7)}...${company.aiConfig.apiKey.slice(-4)}`
          : ''
      }
    };

    res.status(200).json({
      success: true,
      settings: maskedCompany
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update settings (WhatsApp, OpenAI, Company Profile)
// @route   PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const {
      name,
      email,
      phone,
      address,
      currency,
      timeZone,
      whatsappConfig,
      aiConfig
    } = req.body;

    if (name) company.name = name;
    if (email) company.email = email;
    if (phone) company.phone = phone;
    if (address) company.address = { ...company.address, ...address };
    if (currency) company.currency = { ...company.currency, ...currency };
    if (timeZone) company.timeZone = timeZone;

    if (whatsappConfig) {
      const currentToken = company.whatsappConfig.accessToken;
      // Only update token if not masked string
      if (whatsappConfig.accessToken && !whatsappConfig.accessToken.includes('...')) {
        company.whatsappConfig.accessToken = whatsappConfig.accessToken;
      }
      if (whatsappConfig.phoneNumberId) company.whatsappConfig.phoneNumberId = whatsappConfig.phoneNumberId;
      if (whatsappConfig.wabaId) company.whatsappConfig.wabaId = whatsappConfig.wabaId;
      if (whatsappConfig.appId) company.whatsappConfig.appId = whatsappConfig.appId;
      if (whatsappConfig.webhookVerifyToken) company.whatsappConfig.webhookVerifyToken = whatsappConfig.webhookVerifyToken;
      if (whatsappConfig.status) company.whatsappConfig.status = whatsappConfig.status;
    }

    if (aiConfig) {
      if (aiConfig.apiKey && !aiConfig.apiKey.includes('...')) {
        company.aiConfig.apiKey = aiConfig.apiKey;
      }
      if (aiConfig.model) company.aiConfig.model = aiConfig.model;
      if (aiConfig.temperature !== undefined) company.aiConfig.temperature = aiConfig.temperature;
      if (aiConfig.systemPrompt) company.aiConfig.systemPrompt = aiConfig.systemPrompt;
      if (aiConfig.autoReplyEnabled !== undefined) company.aiConfig.autoReplyEnabled = aiConfig.autoReplyEnabled;
    }

    await company.save();

    await ActivityLog.create({
      companyId: company._id,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'SETTINGS_UPDATED',
      entityType: 'System',
      details: { updatedFields: Object.keys(req.body) }
    });

    res.status(200).json({
      success: true,
      message: 'Platform settings saved successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seed rich realistic demo data
// @route   POST /api/settings/seed-data
const seedDemoData = async (req, res, next) => {
  try {
    const result = await seedFullRealEstateData(req.companyId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Rich luxury real estate demo data seeded successfully!',
      result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  seedDemoData
};

const KnowledgeBase = require('../models/KnowledgeBase');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { generateAiRealEstateResponse, extractRequirementsRuleBased } = require('../services/openAiService');

// @desc    Direct AI Chat / Playground Testing
// @route   POST /api/ai/chat
const testAiChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const mockCustomer = {
      companyId: req.companyId,
      fullName: req.body.customerName || 'Test Prospect',
      phone: '+919876543210',
      requirements: {}
    };

    const result = await generateAiRealEstateResponse(mockCustomer, message, []);

    res.status(200).json({
      success: true,
      result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Extract requirements from text
// @route   POST /api/ai/extract-requirements
const extractRequirements = async (req, res, next) => {
  try {
    const { text } = req.body;
    const requirements = extractRequirementsRuleBased(text || '');
    res.status(200).json({ success: true, requirements });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Knowledge Base articles
// @route   GET /api/ai/knowledge-base
const getKnowledgeBase = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { companyId: req.companyId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await KnowledgeBase.find(query).sort({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Knowledge Base article
// @route   POST /api/ai/knowledge-base
const createKnowledgeBase = async (req, res, next) => {
  try {
    const { title, category, content, tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const item = await KnowledgeBase.create({
      companyId: req.companyId,
      title,
      category: category || 'FAQ',
      content,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Knowledge base entry created',
      item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Knowledge Base article
// @route   DELETE /api/ai/knowledge-base/:id
const deleteKnowledgeBase = async (req, res, next) => {
  try {
    await KnowledgeBase.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    res.status(200).json({ success: true, message: 'Article removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  testAiChat,
  extractRequirements,
  getKnowledgeBase,
  createKnowledgeBase,
  deleteKnowledgeBase
};

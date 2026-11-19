const express = require('express');
const router = express.Router();
const {
  verifyWebhook,
  handleWebhook,
  simulateIncomingWebhook,
  getConversations,
  getMessages,
  sendMessage,
  toggleHumanTakeover
} = require('../controllers/whatsappController');
const { protect } = require('../middleware/authMiddleware');

// Public Webhooks for Meta WhatsApp Cloud API
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhook);

// Protected WhatsApp CRM Endpoints
router.use(protect);
router.post('/simulate-incoming', simulateIncomingWebhook);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/send', sendMessage);
router.put('/conversations/:id/takeover', toggleHumanTakeover);

module.exports = router;

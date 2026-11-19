const express = require('express');
const router = express.Router();
const {
  testAiChat,
  extractRequirements,
  getKnowledgeBase,
  createKnowledgeBase,
  deleteKnowledgeBase
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/chat', testAiChat);
router.post('/extract-requirements', extractRequirements);
router.get('/knowledge-base', getKnowledgeBase);
router.post('/knowledge-base', createKnowledgeBase);
router.delete('/knowledge-base/:id', deleteKnowledgeBase);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getLeads, updateLeadStage, assignLead } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeads);
router.put('/:id/stage', updateLeadStage);
router.put('/:id/assign', assignLead);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign } = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCampaigns);
router.post('/', createCampaign);

module.exports = router;

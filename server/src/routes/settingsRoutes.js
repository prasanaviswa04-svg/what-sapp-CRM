const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, seedDemoData } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/seed-data', seedDemoData);

module.exports = router;

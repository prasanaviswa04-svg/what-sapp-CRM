const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getDashboardAnalytics);
router.get('/dashboard', getDashboardAnalytics);
router.get('/reports', getDashboardAnalytics);

module.exports = router;

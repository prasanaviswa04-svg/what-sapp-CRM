const express = require('express');
const router = express.Router();
const { getMatchesForCustomer, matchCustomCriteria } = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/customer/:customerId', getMatchesForCustomer);
router.post('/test', matchCustomCriteria);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getMatchesForCustomer, matchCustomCriteria, getAllMatches } = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllMatches);
router.get('/customer/:customerId', getMatchesForCustomer);
router.post('/test', matchCustomCriteria);

module.exports = router;

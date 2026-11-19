const express = require('express');
const router = express.Router();
const { getPayments, recordPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPayments);
router.post('/', recordPayment);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getBookings, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;

const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const { triggerAutomations } = require('../services/automationEngine');

// @desc    Get all bookings
// @route   GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { companyId: req.companyId };

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'fullName phone email')
      .populate('propertyId', 'propertyCode title totalPrice address images status')
      .populate('assignedBrokerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    let filtered = bookings;
    if (search) {
      const lower = search.toLowerCase();
      filtered = bookings.filter(b =>
        b.bookingCode?.toLowerCase().includes(lower) ||
        b.customerId?.fullName?.toLowerCase().includes(lower) ||
        b.propertyId?.title?.toLowerCase().includes(lower)
      );
    }

    res.status(200).json({
      success: true,
      total: filtered.length,
      bookings: filtered
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const {
      customerId,
      propertyId,
      assignedBrokerId,
      agreedPrice,
      advanceAmount,
      termsAndConditions,
      paymentMethod = 'Bank Transfer',
      transactionId
    } = req.body;

    if (!customerId || !propertyId || !agreedPrice || !advanceAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId, propertyId, agreedPrice, and advanceAmount.'
      });
    }

    // Safety check: Is property already booked or sold?
    const property = await Property.findOne({ _id: propertyId, companyId: req.companyId });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.status === 'Sold' || property.status === 'Reserved') {
      return res.status(409).json({
        success: false,
        message: `Property ${property.propertyCode} is currently ${property.status} and cannot be booked.`
      });
    }

    const bookingCode = `BK-${Date.now().toString().slice(-6)}`;
    const broker = assignedBrokerId || req.user.id;

    const booking = await Booking.create({
      companyId: req.companyId,
      bookingCode,
      customerId,
      propertyId,
      assignedBrokerId: broker,
      agreedPrice: Number(agreedPrice),
      advanceAmount: Number(advanceAmount),
      paymentStatus: Number(advanceAmount) >= Number(agreedPrice) ? 'Paid' : 'Partially Paid',
      bookingStatus: 'Confirmed',
      termsAndConditions: termsAndConditions || 'Standard Sale Agreement Terms apply.',
      confirmedAt: new Date()
    });

    // Update Property status to 'Reserved'
    property.status = 'Reserved';
    property.statusHistory.push({
      status: 'Reserved',
      changedBy: `${req.user.firstName} ${req.user.lastName}`,
      reason: `Booking ${bookingCode} confirmed with advance of ₹${advanceAmount}`
    });
    await property.save();

    // Create Initial Payment Record
    const remainingBalance = Math.max(0, Number(agreedPrice) - Number(advanceAmount));
    const payment = await Payment.create({
      companyId: req.companyId,
      bookingId: booking._id,
      customerId,
      propertyId,
      transactionId: transactionId || `TXN-${Date.now().toString().slice(-8)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      totalAmount: Number(agreedPrice),
      amountPaid: Number(advanceAmount),
      remainingBalance,
      paymentMethod,
      status: 'Paid',
      paidAt: new Date()
    });

    // Move Lead to 'Booking Confirmed'
    await Lead.findOneAndUpdate(
      { customerId, companyId: req.companyId },
      { stage: 'Booking Confirmed', lastContactDate: new Date() }
    );

    // Trigger 'booking_confirmed' automation
    triggerAutomations('booking_confirmed', customerId, req.companyId, {
      propertyTitle: property.title
    });

    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking._id,
      details: { bookingCode, propertyCode: property.propertyCode, advanceAmount }
    });

    res.status(201).json({
      success: true,
      message: 'Booking successfully confirmed and property marked as Reserved.',
      booking,
      payment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, companyId: req.companyId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.bookingStatus = 'Cancelled';
    booking.cancelledReason = reason || 'Customer request';
    await booking.save();

    // Restore property to Available
    await Property.findByIdAndUpdate(booking.propertyId, { status: 'Available' });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and property restored to Available.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBookings,
  createBooking,
  cancelBooking
};

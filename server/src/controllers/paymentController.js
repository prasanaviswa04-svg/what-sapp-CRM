const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all payments
// @route   GET /api/payments
const getPayments = async (req, res, next) => {
  try {
    const { status, paymentMethod, search } = req.query;
    const query = { companyId: req.companyId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    const payments = await Payment.find(query)
      .populate('customerId', 'fullName phone email')
      .populate('propertyId', 'propertyCode title address totalPrice')
      .populate('bookingId', 'bookingCode agreedPrice')
      .sort({ paidAt: -1 })
      .lean();

    let filtered = payments;
    if (search) {
      const lower = search.toLowerCase();
      filtered = payments.filter(p =>
        p.transactionId?.toLowerCase().includes(lower) ||
        p.invoiceNumber?.toLowerCase().includes(lower) ||
        p.customerId?.fullName?.toLowerCase().includes(lower) ||
        p.bookingId?.bookingCode?.toLowerCase().includes(lower)
      );
    }

    // Totals aggregation
    const totalCollected = filtered.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalPending = filtered.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.remainingBalance || 0), 0);

    res.status(200).json({
      success: true,
      totalCount: filtered.length,
      totalCollected,
      totalPending,
      payments: filtered
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record a new payment
// @route   POST /api/payments
const recordPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      customerId,
      propertyId,
      amountPaid,
      paymentMethod = 'Bank Transfer',
      transactionId,
      dueDate,
      notes
    } = req.body;

    if (!bookingId || !amountPaid) {
      return res.status(400).json({ success: false, message: 'bookingId and amountPaid are required' });
    }

    const booking = await Booking.findOne({ _id: bookingId, companyId: req.companyId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Calculate total paid so far
    const existingPayments = await Payment.find({ bookingId: booking._id, status: 'Paid' });
    const previouslyPaid = existingPayments.reduce((acc, p) => acc + p.amountPaid, 0);
    const newTotalPaid = previouslyPaid + Number(amountPaid);
    const remainingBalance = Math.max(0, booking.agreedPrice - newTotalPaid);

    const payment = await Payment.create({
      companyId: req.companyId,
      bookingId: booking._id,
      customerId: customerId || booking.customerId,
      propertyId: propertyId || booking.propertyId,
      transactionId: transactionId || `TXN-${Date.now().toString().slice(-8)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      totalAmount: booking.agreedPrice,
      amountPaid: Number(amountPaid),
      remainingBalance,
      paymentMethod,
      status: 'Paid',
      dueDate: dueDate ? new Date(dueDate) : null,
      notes
    });

    // Update booking payment status
    booking.paymentStatus = remainingBalance === 0 ? 'Paid' : 'Partially Paid';
    await booking.save();

    await ActivityLog.create({
      companyId: req.companyId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: payment._id,
      details: { amountPaid, transactionId: payment.transactionId }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPayments,
  recordPayment
};

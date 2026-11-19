const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    index: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Cash'],
    default: 'UPI'
  },
  status: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Refunded'],
    default: 'Paid',
    index: true
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date,
    default: Date.now
  },
  receiptUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

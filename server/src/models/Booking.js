const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  bookingCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
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
    required: true,
    index: true
  },
  assignedBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  agreedPrice: {
    type: Number,
    required: true
  },
  advanceAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid'],
    default: 'Partially Paid'
  },
  bookingStatus: {
    type: String,
    enum: ['Initiated', 'Pending Confirmation', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed',
    index: true
  },
  termsAndConditions: {
    type: String,
    default: 'Standard Real Estate Sale Agreement Terms & Conditions apply.'
  },
  documents: [
    {
      title: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  cancelledReason: {
    type: String,
    default: ''
  },
  confirmedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'Property Enquiry'
  },
  source: {
    type: String,
    enum: ['WhatsApp', 'Website Form', 'Direct Call', 'Referral', 'Walk-in', 'Facebook Ad', 'Google Ad', 'Manual Entry'],
    default: 'WhatsApp'
  },
  interestedPropertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  assignedBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  stage: {
    type: String,
    enum: [
      'New Enquiry',
      'Contacted',
      'Requirements Collected',
      'Qualified',
      'Property Recommended',
      'Site Visit Scheduled',
      'Negotiation',
      'Booking Confirmed',
      'Converted',
      'Lost'
    ],
    default: 'New Enquiry',
    index: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
    index: true
  },
  scoreClassification: {
    type: String,
    enum: ['Cold', 'Warm', 'Hot', 'High Intent'],
    default: 'Warm'
  },
  scoreFactors: {
    type: [String],
    default: []
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  preferredLocation: {
    type: String,
    default: ''
  },
  lostReason: {
    type: String,
    enum: ['', 'Budget Mismatch', 'Location Unsuitable', 'Bought Elsewhere', 'Postponed Plan', 'Unresponsive', 'Unrealistic Demands', 'Other'],
    default: ''
  },
  lostDetails: {
    type: String,
    default: ''
  },
  lastContactDate: {
    type: Date,
    default: Date.now
  },
  nextFollowUpDate: {
    type: Date
  },
  activityLog: [
    {
      actor: String,
      action: String,
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

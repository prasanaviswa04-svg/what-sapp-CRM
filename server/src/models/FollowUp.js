const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  triggerEvent: {
    type: String,
    enum: [
      'new_enquiry',
      'visit_scheduled',
      'visit_completed',
      'booking_confirmed',
      'payment_due',
      'inactive_lead_3d',
      'inactive_lead_7d',
      'property_matched'
    ],
    required: true,
    index: true
  },
  targetSegment: {
    type: String,
    enum: ['All Customers', 'Hot Leads Only', 'Active Enquiries', 'Unresponsive Leads', 'VIP Buyers'],
    default: 'All Customers'
  },
  delayMinutes: {
    type: Number,
    default: 15 // e.g. 15 minutes after trigger
  },
  whatsappTemplate: {
    type: String,
    default: 'general_followup'
  },
  messageBody: {
    type: String,
    required: true
  },
  interactiveButtons: [
    {
      id: String,
      title: String
    }
  ],
  stopConditions: {
    type: [String],
    default: ['customer_replied', 'booked_site_visit', 'opted_out']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);

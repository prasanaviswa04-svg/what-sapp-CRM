const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  targetAudience: {
    type: String,
    enum: [
      'All Customers',
      'Hot & High Intent Leads',
      'Luxury Seekers (> ₹2 Cr)',
      'New Enquiries (Last 7 Days)',
      'Active Site Visitors',
      'Investors'
    ],
    default: 'All Customers'
  },
  templateName: {
    type: String,
    required: true,
    default: 'property_showcase_announcement'
  },
  messageContent: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Paused', 'Cancelled'],
    default: 'Completed',
    index: true
  },
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    optOutCount: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);

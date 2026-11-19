const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
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
  whatsappPhoneNumber: {
    type: String,
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['WhatsApp', 'Webchat', 'SMS'],
    default: 'WhatsApp'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastMessagePreview: {
    type: String,
    default: ''
  },
  assignedBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'Resolved', 'Closed'],
    default: 'Open',
    index: true
  },
  humanTakeover: {
    type: Boolean,
    default: false,
    index: true
  },
  humanTakeoverBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  humanTakeoverAt: {
    type: Date
  },
  labels: {
    type: [String],
    default: ['General']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  aiSummary: {
    type: String,
    default: ''
  },
  customerServiceWindowExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24hr Meta window
  }
}, { timestamps: true });

conversationSchema.index({ companyId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);

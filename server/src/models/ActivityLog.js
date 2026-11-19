const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'System'
  },
  action: {
    type: String,
    required: true // e.g. "CUSTOMER_CREATED", "LEAD_STAGE_UPDATED", "WHATSAPP_SENT", "BOOKING_CONFIRMED"
  },
  entityType: {
    type: String,
    enum: ['Customer', 'Lead', 'Property', 'Conversation', 'Appointment', 'Booking', 'Payment', 'Campaign', 'User', 'System'],
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

activityLogSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

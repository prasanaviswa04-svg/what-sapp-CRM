const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null means broadcast to all brokers in company
    index: true
  },
  type: {
    type: String,
    enum: [
      'new_lead',
      'whatsapp_message',
      'appointment_scheduled',
      'booking_confirmed',
      'payment_received',
      'ai_escalation',
      'task_assigned',
      'system_alert'
    ],
    default: 'system_alert'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

notificationSchema.index({ companyId: 1, userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

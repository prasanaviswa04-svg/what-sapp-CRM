const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  senderType: {
    type: String,
    enum: ['customer', 'agent', 'ai', 'system'],
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  senderName: {
    type: String,
    default: ''
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'video', 'template', 'interactive', 'location'],
    default: 'text'
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaCaption: {
    type: String,
    default: ''
  },
  templateName: {
    type: String,
    default: ''
  },
  templateParams: {
    type: Array,
    default: []
  },
  interactiveButtons: [
    {
      id: String,
      title: String
    }
  ],
  whatsappMessageId: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent',
    index: true
  },
  failureReason: {
    type: String,
    default: ''
  },
  isGrounded: {
    type: Boolean,
    default: false
  },
  groundedPropertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);

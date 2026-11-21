const mongoose = require('mongoose');

const marketplaceActivitySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'OWNER_REGISTERED',
      'BROKER_REGISTERED',
      'PROPERTY_SUBMITTED',
      'REQUIREMENT_SUBMITTED',
      'SUBMISSION_UPDATED',
      'VERIFICATION_STARTED',
      'INFO_REQUESTED',
      'SUBMISSION_APPROVED',
      'SUBMISSION_REJECTED',
      'LISTING_PUBLISHED',
      'OPPORTUNITY_ASSIGNED',
      'WHATSAPP_NOTIFICATION_SENT',
      'CRM_RECORD_SYNCED'
    ],
    index: true
  },
  actorType: {
    type: String,
    enum: ['Owner', 'Broker', 'Internal Employee', 'System Automation'],
    default: 'System Automation'
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  actorName: {
    type: String,
    default: ''
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceSubmission',
    default: null
  },
  submissionCode: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

marketplaceActivitySchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('MarketplaceActivity', marketplaceActivitySchema);

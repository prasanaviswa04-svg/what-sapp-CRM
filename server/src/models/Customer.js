const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  countryCode: {
    type: String,
    default: '+91'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  preferredContactMethod: {
    type: String,
    enum: ['WhatsApp', 'Phone Call', 'Email', 'In Person'],
    default: 'WhatsApp'
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  currentLocation: {
    type: String,
    default: ''
  },
  preferredLocation: {
    type: String,
    default: ''
  },
  customerType: {
    type: String,
    enum: ['Buyer', 'Seller', 'Tenant', 'Investor', 'Other'],
    default: 'Buyer'
  },
  requirements: {
    propertyCategory: {
      type: String,
      enum: ['Any', 'Residential', 'Commercial', 'Land', 'Plot', 'Apartment', 'Villa', 'Independent House', 'Office Space', 'Rental'],
      default: 'Apartment'
    },
    purpose: {
      type: String,
      enum: ['Buy', 'Rent', 'Invest', 'Sell'],
      default: 'Buy'
    },
    minBudget: {
      type: Number,
      default: 0
    },
    maxBudget: {
      type: Number,
      default: 0
    },
    preferredSizeSqft: {
      type: Number,
      default: 0
    },
    bedrooms: {
      type: Number,
      default: 0
    },
    bathrooms: {
      type: Number,
      default: 0
    },
    preferredAmenities: {
      type: [String],
      default: []
    },
    purchaseTimeline: {
      type: String,
      enum: ['Immediate (0-1 month)', 'Near term (1-3 months)', 'Medium term (3-6 months)', 'Exploring (>6 months)'],
      default: 'Near term (1-3 months)'
    },
    financingNeeded: {
      type: Boolean,
      default: false
    }
  },
  assignedBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  source: {
    type: String,
    enum: [
      'WhatsApp',
      'Website Form',
      'Direct Call',
      'Referral',
      'Walk-in',
      'Facebook Ad',
      'Google Ad',
      'Manual Entry',
      'Direct Property Owner',
      'Real Estate Broker',
      'Property Agent',
      'Marketplace Submission'
    ],
    default: 'WhatsApp'
  },
  marketplaceSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceSubmission',
    default: null
  },
  sourceBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceUser',
    default: null
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Interested', 'Site Visit Scheduled', 'Negotiating', 'Booked', 'Closed', 'Lost'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  tags: {
    type: [String],
    default: ['Prospect']
  },
  internalNotes: {
    type: String,
    default: ''
  },
  consentGiven: {
    type: Boolean,
    default: true
  },
  consentTimestamp: {
    type: Date,
    default: Date.now
  },
  optOut: {
    type: Boolean,
    default: false
  },
  optOutReason: {
    type: String,
    default: ''
  },
  totalInteractions: {
    type: Number,
    default: 1
  },
  lastInteractionAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound unique index for multi-tenant phone normalization
customerSchema.index({ companyId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);

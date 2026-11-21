const mongoose = require('mongoose');

const marketplaceSubmissionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  submissionId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  marketplaceUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceUser',
    default: null,
    index: true
  },
  submitterType: {
    type: String,
    enum: ['Owner', 'Broker'],
    required: true,
    index: true
  },
  submitterName: {
    type: String,
    required: true,
    trim: true
  },
  submitterEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  submitterPhone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  submitterWhatsApp: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    default: ''
  },
  submissionCategory: {
    type: String,
    enum: ['Property', 'Requirement'],
    required: true,
    index: true
  },
  submissionType: {
    type: String,
    enum: [
      'Property for Sale',
      'Property for Rent',
      'Land and Plot Listings',
      'Commercial Properties',
      'Residential Properties',
      'Buyer Requirements',
      'Seller Requirements',
      'Rental Requirements',
      'Investment Requirements'
    ],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'New Submission',
      'Under Review',
      'Information Required',
      'Verified',
      'Approved',
      'Published',
      'Rejected',
      'Archived'
    ],
    default: 'New Submission',
    index: true
  },
  source: {
    type: String,
    enum: [
      'Direct Property Owner',
      'Real Estate Broker',
      'Property Agent',
      'Website Submission'
    ],
    default: 'Website Submission',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },

  // Property Details (populated when submissionCategory === 'Property')
  propertyDetails: {
    category: {
      type: String,
      default: 'Residential'
    },
    propertyType: {
      type: String,
      default: 'Apartment'
    },
    purpose: {
      type: String,
      enum: ['Sale', 'Rent', 'Lease'],
      default: 'Sale'
    },
    price: {
      type: Number,
      default: 0
    },
    rentalPrice: {
      type: Number,
      default: 0
    },
    builtUpArea: {
      type: Number,
      default: 0
    },
    plotArea: {
      type: Number,
      default: 0
    },
    areaUnit: {
      type: String,
      default: 'sqft'
    },
    bedrooms: {
      type: Number,
      default: 0
    },
    bathrooms: {
      type: Number,
      default: 0
    },
    furnishing: {
      type: String,
      enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
      default: 'Semi-Furnished'
    },
    address: {
      street: { type: String, default: '' },
      locality: { type: String, default: '' },
      city: { type: String, default: 'Gurugram' },
      state: { type: String, default: 'Haryana' },
      country: { type: String, default: 'India' },
      postalCode: { type: String, default: '' }
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    videos: {
      type: [String],
      default: []
    },
    ownershipInfo: {
      type: String,
      default: 'Freehold'
    },
    availability: {
      type: String,
      default: 'Ready to Move'
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },

  // Requirement Details (populated when submissionCategory === 'Requirement')
  requirementDetails: {
    clientName: { type: String, default: '' },
    clientPhone: { type: String, default: '' },
    clientEmail: { type: String, default: '' },
    customerType: { type: String, default: 'Buyer' },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    preferredLocations: { type: [String], default: [] },
    propertyCategories: { type: [String], default: ['Residential'] },
    preferredBedrooms: { type: [Number], default: [] },
    possessionTimeline: { type: String, default: 'Immediate' },
    financingRequired: { type: Boolean, default: false },
    notes: { type: String, default: '' }
  },

  // Automated Duplicate Detection Engine
  duplicateDetection: {
    isDuplicate: { type: Boolean, default: false },
    confidenceScore: { type: Number, default: 0 },
    matchedSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceSubmission', default: null },
    flaggedReason: { type: String, default: '' },
    reviewStatus: { type: String, enum: ['Clean', 'Flagged', 'Dismissed', 'Merged'], default: 'Clean' }
  },

  // Internal Verification & Governance Workflow
  verification: {
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedByName: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    verificationNotes: { type: String, default: '' },
    informationRequested: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    publishedAt: { type: Date, default: null }
  },

  // Assigned Internal Employee / Broker (Opportunity Distribution)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  assignedToName: {
    type: String,
    default: ''
  },

  // Mapping to Existing CRM Entities
  crmMapping: {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null }
  },

  // Audit Trail of Status Changes
  statusHistory: [
    {
      status: String,
      changedBy: String,
      changedById: mongoose.Schema.Types.ObjectId,
      note: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],

  // Outgoing & Incoming WhatsApp / Contact Logs
  communicationHistory: [
    {
      channel: { type: String, default: 'WhatsApp' },
      template: String,
      message: String,
      status: { type: String, default: 'sent' },
      recipientPhone: String,
      whatsappMessageId: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// Compound indexes
marketplaceSubmissionSchema.index({ companyId: 1, status: 1, submissionCategory: 1 });
marketplaceSubmissionSchema.index({ companyId: 1, submitterPhone: 1 });
marketplaceSubmissionSchema.index({ companyId: 1, 'propertyDetails.address.city': 1 });

module.exports = mongoose.model('MarketplaceSubmission', marketplaceSubmissionSchema);

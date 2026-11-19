const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  propertyCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
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
  category: {
    type: String,
    enum: [
      'Residential',
      'Commercial',
      'Land',
      'Plot',
      'Apartment',
      'Villa',
      'Independent House',
      'Office Space',
      'Rental'
    ],
    required: true,
    index: true
  },
  purpose: {
    type: String,
    enum: ['Sale', 'Rent', 'Lease'],
    default: 'Sale',
    index: true
  },
  address: {
    street: { type: String, default: '' },
    locality: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    state: { type: String, default: 'Haryana' },
    country: { type: String, default: 'India' },
    postalCode: { type: String, default: '' }
  },
  coordinates: {
    lat: { type: Number, default: 28.4595 },
    lng: { type: Number, default: 77.0266 }
  },
  plotSize: {
    type: Number,
    default: 0
  },
  builtUpArea: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['sqft', 'sqyd', 'acre'],
    default: 'sqft'
  },
  totalPrice: {
    type: Number,
    required: true,
    index: true
  },
  pricePerUnit: {
    type: Number,
    default: 0
  },
  bedrooms: {
    type: Number,
    default: 0,
    index: true
  },
  bathrooms: {
    type: Number,
    default: 0
  },
  parkingSpaces: {
    type: Number,
    default: 1
  },
  amenities: {
    type: [String],
    default: [
      'Gated Community',
      '24/7 Security',
      'Clubhouse',
      'Swimming Pool',
      'Gymnasium',
      'Power Backup',
      'Children Play Area',
      'Car Parking'
    ]
  },
  ownership: {
    type: String,
    enum: ['Freehold', 'Leasehold', 'Power of Attorney', 'Co-operative'],
    default: 'Freehold'
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Available',
      'Reserved',
      'Under Negotiation',
      'Sold',
      'Rented',
      'Unavailable',
      'Archived'
    ],
    default: 'Available',
    index: true
  },
  statusHistory: [
    {
      status: String,
      changedBy: String,
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  assignedBrokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  images: {
    type: [String],
    default: []
  },
  floorPlans: {
    type: [String],
    default: []
  },
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  viewsCount: {
    type: Number,
    default: 0
  },
  enquiriesCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for search and matching
propertySchema.index({ companyId: 1, category: 1, status: 1, totalPrice: 1 });
propertySchema.index({ companyId: 1, 'address.city': 1, 'address.locality': 1 });

module.exports = mongoose.model('Property', propertySchema);

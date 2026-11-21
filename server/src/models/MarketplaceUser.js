const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const marketplaceUserSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['Owner', 'Broker'],
    required: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  whatsappNumber: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended', 'Rejected'],
    default: 'Active',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  // Dedicated profile for real estate brokers, property dealers & agencies
  brokerProfile: {
    companyName: { type: String, default: '' },
    businessContactNumber: { type: String, default: '' },
    operatingLocations: { type: [String], default: [] },
    serviceAreas: { type: [String], default: [] },
    propertyCategories: { type: [String], default: ['Residential', 'Commercial'] },
    yearsExperience: { type: Number, default: 1 },
    licenseNumber: { type: String, default: '' },
    reraNumber: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    documents: [
      {
        name: String,
        url: String,
        documentType: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  // Dedicated profile for direct property owners
  ownerProfile: {
    currentCity: { type: String, default: '' },
    currentAddress: { type: String, default: '' },
    idProofType: { type: String, default: 'Aadhaar / National ID' },
    idProofNumber: { type: String, default: '' },
    ownershipType: { type: String, enum: ['Individual', 'Joint', 'Corporate'], default: 'Individual' },
    preferredContactMethod: { type: String, enum: ['WhatsApp', 'Phone Call', 'Email'], default: 'WhatsApp' },
    documents: [
      {
        name: String,
        url: String,
        documentType: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  approvedSubmissions: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });

// Pre-save fullName and password hash
marketplaceUserSchema.pre('save', async function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  if (!this.whatsappNumber && this.phone) {
    this.whatsappNumber = this.phone;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
marketplaceUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token
marketplaceUserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      companyId: this.companyId,
      userType: this.userType,
      email: this.email,
      name: this.fullName,
      isMarketplaceUser: true
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || '30d' }
  );
};

module.exports = mongoose.model('MarketplaceUser', marketplaceUserSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const userSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
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
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: [
      'Super Admin',
      'Company Admin',
      'Real Estate Manager',
      'Property Broker',
      'Sales Agent',
      'Customer Support Agent'
    ],
    default: 'Property Broker',
    index: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    type: [String],
    default: []
  },
  assignedPropertiesCount: {
    type: Number,
    default: 0
  },
  assignedLeadsCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [
    {
      ip: String,
      userAgent: String,
      device: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// Pre-save password hash
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      companyId: this.companyId,
      role: this.role,
      email: this.email,
      name: `${this.firstName} ${this.lastName}`
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

// Generate Refresh Token
userSchema.methods.getSignedRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
};

module.exports = mongoose.model('User', userSchema);

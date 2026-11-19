const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'EstateFlow Prime Realty'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'contact@estateflow.io'
  },
  phone: {
    type: String,
    trim: true,
    default: '+91 98765 43210'
  },
  address: {
    street: { type: String, default: 'One Horizon Center, Golf Course Road' },
    city: { type: String, default: 'Gurugram' },
    state: { type: String, default: 'Haryana' },
    country: { type: String, default: 'India' },
    postalCode: { type: String, default: '122002' }
  },
  logo: {
    type: String,
    default: ''
  },
  currency: {
    code: { type: String, default: 'INR' },
    symbol: { type: String, default: '₹' }
  },
  timeZone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  // WhatsApp Meta Cloud API configuration
  whatsappConfig: {
    wabaId: { type: String, default: '' },
    phoneNumberId: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    appId: { type: String, default: '' },
    appSecret: { type: String, default: '' },
    webhookVerifyToken: { type: String, default: 'estateflow_verify_token_2026' },
    apiVersion: { type: String, default: 'v21.0' },
    businessPhoneNumber: { type: String, default: '+919876543210' },
    status: { type: String, enum: ['connected', 'disconnected', 'test_mode'], default: 'test_mode' }
  },
  // OpenAI Configuration
  aiConfig: {
    apiKey: { type: String, default: '' },
    model: { type: String, default: 'gpt-4o-mini' },
    temperature: { type: Number, default: 0.2 },
    systemPrompt: {
      type: String,
      default: 'You are EstateFlow AI, an elite, polite, and helpful luxury real estate consultant. Your goal is to assist customers in finding their ideal property, answer questions accurately using verified database records, collect their budget, preferred location, and requirements conversationally, and schedule site visits. NEVER invent or hallucinate property prices, availability, or amenities.'
    },
    autoReplyEnabled: { type: Boolean, default: true },
    escalationKeywords: {
      type: [String],
      default: ['human', 'agent', 'broker', 'speak to someone', 'complaint', 'fraud', 'call me', 'talk to human']
    }
  },
  businessHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '20:00' },
    workDays: { type: [Number], default: [1, 2, 3, 4, 5, 6] } // Mon - Sat
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);

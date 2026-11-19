const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'estateflow-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'estateflow-refresh-secret-jwt-key-2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Meta WhatsApp Cloud API defaults
  META_WHATSAPP_TOKEN: process.env.META_WHATSAPP_TOKEN || '',
  META_PHONE_NUMBER_ID: process.env.META_PHONE_NUMBER_ID || '',
  META_WABA_ID: process.env.META_WABA_ID || '',
  META_APP_SECRET: process.env.META_APP_SECRET || '',
  META_WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN || 'estateflow_verify_token_2026',
  META_API_VERSION: process.env.META_API_VERSION || 'v21.0',

  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Client URL for CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};

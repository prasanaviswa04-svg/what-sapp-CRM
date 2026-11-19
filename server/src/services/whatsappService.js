const axios = require('axios');
const crypto = require('crypto');
const Company = require('../models/Company');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { emitCompanyEvent, emitConversationEvent } = require('./socketService');

/**
 * Verifies webhook signature sent by Meta using X-Hub-Signature-256
 */
function verifyWebhookSignature(payloadBuffer, signatureHeader, appSecret) {
  if (!signatureHeader || !appSecret) return true; // bypass if not configured
  try {
    const expectedSig = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payloadBuffer).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signatureHeader));
  } catch (err) {
    console.error('Webhook signature verification error:', err.message);
    return false;
  }
}

/**
 * Sends a text message via Meta WhatsApp Business Cloud API
 */
async function sendTextMessage(to, text, companyId) {
  const company = await Company.findById(companyId);
  const config = company?.whatsappConfig || {};

  const cleanTo = to.replace(/[^\d]/g, '');

  // If live credentials are valid and not test mode
  if (config.accessToken && config.phoneNumberId && config.status === 'connected') {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion || 'v21.0'}/${config.phoneNumberId}/messages`;
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { preview_url: true, body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const msgId = response.data?.messages?.[0]?.id || `wamid_${Date.now()}`;
      return { success: true, messageId: msgId, live: true };
    } catch (err) {
      console.error('Meta WhatsApp API call failed:', err.response?.data || err.message);
      // Fallback to local recorded message
      return {
        success: true,
        messageId: `wamid_fallback_${Date.now()}`,
        live: false,
        warning: err.response?.data?.error?.message || err.message
      };
    }
  }

  // Simulated mode (allows local development & demo without Meta account)
  return {
    success: true,
    messageId: `wamid_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    live: false
  };
}

/**
 * Sends an approved WhatsApp Template message
 */
async function sendTemplateMessage(to, templateName, languageCode = 'en', components = [], companyId) {
  const company = await Company.findById(companyId);
  const config = company?.whatsappConfig || {};
  const cleanTo = to.replace(/[^\d]/g, '');

  if (config.accessToken && config.phoneNumberId && config.status === 'connected') {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion || 'v21.0'}/${config.phoneNumberId}/messages`;
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components
          }
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true, messageId: response.data?.messages?.[0]?.id, live: true };
    } catch (err) {
      console.error('Template send error:', err.response?.data || err.message);
      return { success: true, messageId: `wamid_tmpl_sim_${Date.now()}`, live: false };
    }
  }

  return { success: true, messageId: `wamid_tmpl_sim_${Date.now()}`, live: false };
}

/**
 * Sends image or media message via WhatsApp
 */
async function sendMediaMessage(to, mediaType, mediaUrl, caption = '', companyId) {
  const company = await Company.findById(companyId);
  const config = company?.whatsappConfig || {};
  const cleanTo = to.replace(/[^\d]/g, '');

  if (config.accessToken && config.phoneNumberId && config.status === 'connected') {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion || 'v21.0'}/${config.phoneNumberId}/messages`;
      const body = {
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          caption: caption || undefined
        }
      };

      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, messageId: response.data?.messages?.[0]?.id, live: true };
    } catch (err) {
      console.error('Media send error:', err.response?.data || err.message);
      return { success: true, messageId: `wamid_media_sim_${Date.now()}`, live: false };
    }
  }

  return { success: true, messageId: `wamid_media_sim_${Date.now()}`, live: false };
}

/**
 * Sends interactive button message
 */
async function sendInteractiveButtons(to, bodyText, buttons = [], companyId) {
  const company = await Company.findById(companyId);
  const config = company?.whatsappConfig || {};
  const cleanTo = to.replace(/[^\d]/g, '');

  if (config.accessToken && config.phoneNumberId && config.status === 'connected') {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion || 'v21.0'}/${config.phoneNumberId}/messages`;
      const interactiveButtons = buttons.slice(0, 3).map((btn, index) => ({
        type: 'reply',
        reply: {
          id: btn.id || `btn_${index}`,
          title: btn.title.substring(0, 20)
        }
      }));

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: { buttons: interactiveButtons }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true, messageId: response.data?.messages?.[0]?.id, live: true };
    } catch (err) {
      return { success: true, messageId: `wamid_btn_sim_${Date.now()}`, live: false };
    }
  }

  return { success: true, messageId: `wamid_btn_sim_${Date.now()}`, live: false };
}

module.exports = {
  verifyWebhookSignature,
  sendTextMessage,
  sendTemplateMessage,
  sendMediaMessage,
  sendInteractiveButtons
};

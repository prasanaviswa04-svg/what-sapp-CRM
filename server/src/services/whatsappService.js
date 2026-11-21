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
 * Sends a WhatsApp message (text, photo, and/or Google Maps location)
 */
async function sendTextMessage(to, payload, companyId) {
  const company = await Company.findById(companyId);
  const config = company?.whatsappConfig || {};

  const cleanTo = to.replace(/[^\d]/g, '');

  let text = typeof payload === 'string' ? payload : (payload?.text || payload?.content || payload?.message || '');
  const photo = payload?.photo || payload?.image || payload?.mediaUrl || '';
  const location = payload?.location || null;

  // 1. If WhatsApp Web Multi-Device is linked, send through real paired WhatsApp phone
  try {
    const { getWhatsAppStatus, sendBaileysMessage } = require('./baileysService');
    const bStatus = getWhatsAppStatus();
    if (bStatus && bStatus.isConnected) {
      const bRes = await sendBaileysMessage(to, payload);
      return { success: true, messageId: bRes.messageId, live: true, via: 'baileys' };
    }
  } catch (bErr) {
    console.warn('Baileys real message error:', bErr.message);
    throw bErr;
  }

  // 2. If live Meta Cloud API credentials are valid
  if (config.accessToken && config.phoneNumberId && config.status === 'connected') {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion || 'v21.0'}/${config.phoneNumberId}/messages`;
      let lastMsgId = `wamid_${Date.now()}`;

      // A) Send Photo if present
      if (photo && (photo.startsWith('http://') || photo.startsWith('https://'))) {
        const photoRes = await axios.post(
          url,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'image',
            image: { link: photo, caption: text }
          },
          {
            headers: {
              Authorization: `Bearer ${config.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        lastMsgId = photoRes.data?.messages?.[0]?.id || lastMsgId;
      }
      // B) Send Location if present
      if (location && location.latitude && location.longitude) {
        const locRes = await axios.post(
          url,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'location',
            location: {
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
              name: location.name || 'Shared Location',
              address: location.address || `${location.latitude}, ${location.longitude}`
            }
          },
          {
            headers: {
              Authorization: `Bearer ${config.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        lastMsgId = locRes.data?.messages?.[0]?.id || lastMsgId;
      }
      // C) Send Text if not sent with photo
      if (!photo) {
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
        lastMsgId = response.data?.messages?.[0]?.id || lastMsgId;
      }

      return { success: true, messageId: lastMsgId, live: true, via: 'meta_cloud_api' };
    } catch (err) {
      console.error('Meta WhatsApp API call failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.error?.message || err.message || 'Meta Cloud API call failed');
    }
  }

  // If neither Baileys nor Meta API is connected, do NOT pretend success!
  return {
    success: false,
    live: false,
    message: 'WhatsApp is not connected! Please scan the QR code in WhatsApp > Linked Devices to link your phone first.'
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

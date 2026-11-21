const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { emitCompanyEvent } = require('./socketService');
const { normalizePhoneNumber } = require('../utils/phoneNormalizer');

let waSocket = null;
let currentQR = null;
let reconnectAttempts = 0;
let isInitializing = false;
let messageQueue = Promise.resolve();

let connectionState = {
  isConnected: false,
  phoneNumber: '',
  pushname: '',
  connectedAt: null,
  platform: 'WhatsApp Web Multi-Device (Chrome / Windows)',
  antiBanShield: true
};

const sessionDir = path.join(__dirname, '..', '..', 'data', 'whatsapp_session');

async function initWhatsApp(companyId, forceFresh = false) {
  if (waSocket && connectionState.isConnected && !forceFresh) {
    return waSocket;
  }

  if (isInitializing && !forceFresh) {
    return waSocket;
  }
  isInitializing = true;

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    // ANTI-BAN SHIELD CONFIGURATION:
    // Uses authentic Windows Chrome 10.0 browser identity matching legitimate desktop WhatsApp Web
    waSocket = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 25000,
      browser: Browsers.windows('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: true
    });

    waSocket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        if (companyId) {
          emitCompanyEvent(companyId.toString(), 'whatsapp_qr', { qr });
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`ℹ️ WhatsApp socket closed: status ${statusCode}. Reconnecting: ${shouldReconnect}`);

        currentQR = null;
        connectionState.isConnected = false;

        if (statusCode === DisconnectReason.loggedOut) {
          // Clean credentials
          reconnectAttempts = 0;
          try {
            if (fs.existsSync(sessionDir)) {
              const files = fs.readdirSync(sessionDir);
              for (const file of files) {
                try {
                  fs.rmSync(path.join(sessionDir, file), { recursive: true, force: true });
                } catch (fe) {}
              }
            } else {
              fs.mkdirSync(sessionDir, { recursive: true });
            }
          } catch (e) {
            console.error('Error clearing session dir:', e.message);
          }
          waSocket = null;
          if (companyId) {
            emitCompanyEvent(companyId.toString(), 'whatsapp_disconnected', {});
            await Company.findByIdAndUpdate(companyId, {
              'whatsappConfig.status': 'disconnected'
            });
          }
        } else if (shouldReconnect) {
          reconnectAttempts++;
          // For status 408 (QR timed out waiting for scan), refresh immediately so QR is always active
          const delay = statusCode === 408 ? 1000 : Math.min(2000 * reconnectAttempts, 8000);
          console.log(`⏳ Refreshing live WhatsApp QR socket in ${delay / 1000}s...`);
          setTimeout(() => {
            isInitializing = false;
            initWhatsApp(companyId, true);
          }, delay);
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp Multi-Device connection established successfully with Anti-Ban Shield active!');
        currentQR = null;
        reconnectAttempts = 0;
        isInitializing = false;

        const phone = waSocket.user?.id ? waSocket.user.id.split(':')[0] : '';
        const name = waSocket.user?.name || waSocket.user?.notify || 'EstateFlow Agent';

        connectionState = {
          isConnected: true,
          phoneNumber: `+${phone}`,
          pushname: name,
          connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          platform: 'WhatsApp Web Multi-Device (Chrome / Windows)',
          antiBanShield: true
        };

        // Update company config in MongoDB
        try {
          const comp = companyId ? await Company.findById(companyId) : await Company.findOne();
          if (comp) {
            comp.whatsappConfig = comp.whatsappConfig || {};
            comp.whatsappConfig.status = 'connected';
            comp.whatsappConfig.phoneNumberId = phone;
            await comp.save();
            emitCompanyEvent(comp._id.toString(), 'whatsapp_connected', connectionState);
          }
        } catch (dbErr) {
          console.error('Error saving connected company:', dbErr.message);
        }
      }
    });

    const safeSaveCreds = async () => {
      try {
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }
        await saveCreds();
      } catch (saveErr) {
        console.warn('⚠️ Non-fatal creds.update error:', saveErr.message);
      }
    };

    waSocket.ev.on('creds.update', safeSaveCreds);

    // Handle inbound real WhatsApp messages
    waSocket.ev.on('messages.upsert', async ({ messages: newMsgs, type }) => {
      if (type !== 'notify') return;

      for (const msg of newMsgs) {
        if (!msg.message || msg.key.fromMe) continue;

        const senderJid = msg.key.remoteJid;
        if (!senderJid || senderJid.includes('@g.us')) continue; // skip group chats

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          '';

        const senderPhone = '+' + senderJid.split('@')[0];
        const senderName = msg.pushName || 'WhatsApp User';

        console.log(`📩 Inbound WhatsApp from ${senderName} (${senderPhone}): "${text}"`);

        try {
          const comp = companyId ? await Company.findById(companyId) : await Company.findOne();
          if (!comp) continue;

          let customer = await Customer.findOne({ companyId: comp._id, phone: senderPhone });
          if (!customer) {
            customer = await Customer.create({
              companyId: comp._id,
              fullName: senderName,
              phone: senderPhone,
              source: 'WhatsApp',
              leadStatus: 'New Lead'
            });
          }

          let conversation = await Conversation.findOne({ companyId: comp._id, customerId: customer._id });
          if (!conversation) {
            conversation = await Conversation.create({
              companyId: comp._id,
              customerId: customer._id,
              channel: 'WhatsApp',
              lastMessage: text,
              unreadCount: 1,
              status: 'Open'
            });
          } else {
            conversation.lastMessage = text;
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            await conversation.save();
          }

          await Message.create({
            companyId: comp._id,
            conversationId: conversation._id,
            senderType: 'Customer',
            content: text,
            channel: 'WhatsApp',
            status: 'delivered',
            timestamp: new Date()
          });

          emitCompanyEvent(comp._id.toString(), 'message_received', {
            customerId: customer._id,
            conversationId: conversation._id,
            text,
            senderPhone,
            senderName
          });
        } catch (err) {
          console.error('Error saving inbound WhatsApp message:', err.message);
        }
      }
    });

    return waSocket;
  } catch (err) {
    console.error('Error initializing WhatsApp socket:', err.message);
    waSocket = null;
    currentQR = null;
    return null;
  }
}

function getWhatsAppStatus() {
  return {
    ...connectionState,
    qr: currentQR
  };
}

async function requestPairingCode(phoneNumber) {
  if (!waSocket) {
    await initWhatsApp();
  }

  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  if (!cleanNumber) {
    throw new Error('Invalid phone number provided');
  }

  // Request authentic pairing code from WhatsApp servers
  const code = await waSocket.requestPairingCode(cleanNumber);
  console.log(`📱 WhatsApp Pairing code requested for ${cleanNumber}: ${code}`);
  return code;
}

async function sendBaileysMessage(to, text) {
  if (!waSocket || !connectionState.isConnected) {
    throw new Error('WhatsApp is not currently connected. Please link device by scanning the QR code first.');
  }

  const normalized = normalizePhoneNumber(to);
  const cleanNumber = normalized.replace(/[^\d]/g, '');
  if (!cleanNumber) {
    throw new Error('Invalid recipient phone number.');
  }
  const jid = `${cleanNumber}@s.whatsapp.net`;
  console.log(`🚀 Dispatching real WhatsApp message to JID: ${jid}...`);

  try {
    // Send human typing presence
    try {
      await waSocket.presenceSubscribe(jid);
      await waSocket.sendPresenceUpdate('available');
      await waSocket.sendPresenceUpdate('composing', jid);
      const typingDuration = Math.min(Math.max((text?.length || 10) * 15, 500), 1500);
      await new Promise((r) => setTimeout(r, typingDuration));
      await waSocket.sendPresenceUpdate('paused', jid);
    } catch (e) {
      // non-fatal
    }

    const sent = await waSocket.sendMessage(jid, { text });
    console.log(`✅ WhatsApp message delivered to ${cleanNumber}! MessageId: ${sent?.key?.id}`);
    return {
      success: true,
      messageId: sent?.key?.id || `baileys_${Date.now()}`,
      timestamp: new Date()
    };
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp message to ${jid}:`, err.message);
    throw err;
  }
}

async function refreshQR(companyId) {
  reconnectAttempts = 0;
  isInitializing = false;
  return await initWhatsApp(companyId, true);
}

async function disconnectWhatsApp(companyId) {
  currentQR = null;
  connectionState.isConnected = false;

  if (waSocket) {
    try {
      await waSocket.logout();
    } catch (e) {
      // ignore
    }
    try {
      waSocket.end(undefined);
    } catch (e) {}
    waSocket = null;
  }

  try {
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);
      for (const file of files) {
        try {
          fs.rmSync(path.join(sessionDir, file), { recursive: true, force: true });
        } catch (fe) {}
      }
    } else {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
  } catch (e) {
    // ignore
  }

  if (companyId) {
    try {
      await Company.findByIdAndUpdate(companyId, {
        'whatsappConfig.status': 'disconnected'
      });
      emitCompanyEvent(companyId.toString(), 'whatsapp_disconnected', {});
    } catch (dbErr) {
      console.warn('⚠️ Disconnect DB update error:', dbErr.message);
    }
  }

  // Re-initialize fresh socket to immediately provide new QR code
  setTimeout(() => initWhatsApp(companyId), 1500);

  return { success: true, message: 'WhatsApp disconnected' };
}

module.exports = {
  initWhatsApp,
  getWhatsAppStatus,
  requestPairingCode,
  sendBaileysMessage,
  disconnectWhatsApp,
  refreshQR
};

// backend/src/services/whatsappService.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

let sock = null;
let connectionStatus = 'INITIALIZING'; // 'DISCONNECTED' | 'AWAITING_SCAN' | 'CONNECTED' | 'CONNECTING'
let qrCodeString = null;
let qrCodeDataUrl = null;
let connectedPhone = null;
let reconnectTimer = null;
let isStarted = false;

const AUTH_FOLDER = path.join(__dirname, '../../auth_info_baileys');

async function initWhatsApp() {
  isStarted = true;
  try {
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['JanSeva Gov Desk', 'Chrome', '124.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCodeString = qr;
        try {
          qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 280, margin: 2 });
        } catch (e) {
          console.error('[WhatsApp QR Generation Error]', e.message);
        }
        connectionStatus = 'AWAITING_SCAN';
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`[WhatsApp] Connection closed (code: ${statusCode}). Logged out: ${isLoggedOut}`);

        connectionStatus = 'DISCONNECTED';
        qrCodeString = null;
        qrCodeDataUrl = null;
        connectedPhone = null;

        if (!isLoggedOut) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            initWhatsApp().catch(console.error);
          }, 5000);
        } else {
          try {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
          } catch (e) {}
        }
      } else if (connection === 'open') {
        connectionStatus = 'CONNECTED';
        qrCodeString = null;
        qrCodeDataUrl = null;
        const jid = sock.user?.id || '';
        connectedPhone = jid.split(':')[0] || jid.split('@')[0];
        console.log(`\n🟢 [WhatsApp Linked] Successfully connected as ${connectedPhone}! Alerts will be sent from this number.\n`);
      }
    });

    // 2-Way automated citizen query responses
    sock.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type === 'notify' && m.messages) {
          for (const msg of m.messages) {
            if (!msg.key.fromMe && msg.message) {
              const fromJid = msg.key.remoteJid;
              const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
              if (text && fromJid && !fromJid.endsWith('@g.us')) {
                const { processWhatsAppWebhook } = require('../../utils/notifications');
                const db = require('../db');
                const cleanFrom = fromJid.replace('@s.whatsapp.net', '');
                const response = await processWhatsAppWebhook({ from: cleanFrom, body: text }, {
                  findGrievanceById: async (id) => db.findGrievanceById(id),
                  findApplicationById: async (id) => db.findApplicationById(id)
                });
                if (response && response.reply) {
                  await sock.sendMessage(fromJid, { text: response.reply });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('[WhatsApp Bot Error]:', err.message);
      }
    });

  } catch (err) {
    console.error('[WhatsApp Service Init Failure]:', err.message);
    connectionStatus = 'DISCONNECTED';
  }
}

async function sendMessage(toPhone, text) {
  if (connectionStatus !== 'CONNECTED' || !sock) {
    return { success: false, reason: 'NOT_CONNECTED', status: connectionStatus };
  }

  try {
    const rawDigits = (toPhone || '').replace(/\D/g, '');
    const clean10 = rawDigits.slice(-10);
    const intlDigits = rawDigits.length >= 10 ? (rawDigits.startsWith('91') && rawDigits.length === 12 ? rawDigits : `91${clean10}`) : `91${clean10}`;
    const jid = `${intlDigits}@s.whatsapp.net`;

    const res = await sock.sendMessage(jid, { text });
    return {
      success: true,
      messageId: res?.key?.id,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

function getStatus() {
  return {
    status: connectionStatus,
    isConnected: connectionStatus === 'CONNECTED',
    connectedNumber: connectedPhone,
    qrCodeDataUrl: qrCodeDataUrl,
    hasQr: !!qrCodeDataUrl
  };
}

async function disconnect() {
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (e) {}
  try {
    fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
  } catch (e) {}
  connectionStatus = 'DISCONNECTED';
  qrCodeString = null;
  qrCodeDataUrl = null;
  connectedPhone = null;
  setTimeout(() => initWhatsApp(), 2000);
  return { success: true };
}

module.exports = {
  initWhatsApp,
  sendMessage,
  getStatus,
  disconnect,
  isConnected: () => connectionStatus === 'CONNECTED'
};

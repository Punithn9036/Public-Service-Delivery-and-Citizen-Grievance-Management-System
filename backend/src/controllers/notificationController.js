// backend/src/controllers/notificationController.js
const {
  sendNotification,
  getNotificationLogs,
  processWhatsAppWebhook,
  TEMPLATES
} = require('../../utils/notifications');
const GrievanceModel = require('../../models/grievance');
const ApplicationModel = require('../../models/application');
const db = require('../db');

/**
 * Retrieve dispatched notification logs
 */
const getLogs = async (req, res) => {
  try {
    const { phone, channel, status, limit } = req.query;
    const logs = getNotificationLogs({ phone, channel, status, limit });
    return res.json({
      count: logs.length,
      logs
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Send manual/test statutory notification
 */
const sendTestNotification = async (req, res) => {
  try {
    const { phone, template, data, channels } = req.body;

    if (!template || !TEMPLATES[template]) {
      return res.status(400).json({
        error: 'INVALID_TEMPLATE',
        message: `Template must be one of: ${Object.keys(TEMPLATES).join(', ')}`
      });
    }

    const receipts = await sendNotification({
      phone: phone || '+91 98765 43210',
      template,
      data: data || { id: 'TEST-2026-0001', department: 'General Administration', priority: 'Medium', slaHours: 72 },
      channels: channels || ['SMS', 'WHATSAPP']
    });

    return res.status(201).json({
      message: 'Notification successfully dispatched via National DLT Gateway.',
      receipts
    });
  } catch (err) {
    return res.status(500).json({ error: 'DISPATCH_ERROR', message: err.message });
  }
};

/**
 * Two-Way WhatsApp Interactive Webhook
 * Accepts incoming messages from citizens and returns automated redressal status
 */
const handleWhatsAppWebhook = async (req, res) => {
  try {
    const from = req.body.From || req.body.from || req.query.from;
    const body = req.body.Body || req.body.body || req.body.text || req.query.body || '';

    const lookupContext = {
      findGrievanceById: async (id) => {
        try {
          return await db.findGrievanceById(id);
        } catch (e) {
          return null;
        }
      },
      findApplicationById: async (id) => {
        try {
          return await db.findApplicationById(id);
        } catch (e) {
          return null;
        }
      }
    };

    const response = await processWhatsAppWebhook({ from, body }, lookupContext);

    // Return in standard JSON and also Twilio TwiML compatibility if requested
    if (req.headers['accept'] && req.headers['accept'].includes('xml')) {
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`<Response><Message>${response.reply}</Message></Response>`);
    }

    return res.json({
      success: true,
      sender: from,
      replyMessage: response.reply,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: 'WEBHOOK_ERROR', message: err.message });
  }
};

module.exports = {
  getLogs,
  sendTestNotification,
  handleWhatsAppWebhook
};

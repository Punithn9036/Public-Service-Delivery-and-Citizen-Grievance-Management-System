// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Retrieve statutory SMS and WhatsApp notification logs
router.get('/', notificationController.getLogs);

// Send manual/test notification
router.post('/test', notificationController.sendTestNotification);

// WhatsApp Multi-Device Linking & Status
router.get('/whatsapp-status', notificationController.getWhatsAppStatus);
router.post('/whatsapp-disconnect', notificationController.disconnectWhatsApp);

// Notification Live Dispatch Pause / Resume Controls
router.post('/pause', notificationController.pauseNotifications);
router.post('/resume', notificationController.resumeNotifications);
router.get('/pause-status', notificationController.getPauseStatus);

// Interactive Two-Way WhatsApp Webhook endpoints
router.post('/whatsapp-webhook', notificationController.handleWhatsAppWebhook);
router.post('/webhook', notificationController.handleWhatsAppWebhook);

module.exports = router;


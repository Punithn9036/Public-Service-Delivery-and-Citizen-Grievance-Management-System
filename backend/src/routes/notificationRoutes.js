// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Retrieve statutory SMS and WhatsApp notification logs
router.get('/', notificationController.getLogs);

// Send manual/test notification
router.post('/test', notificationController.sendTestNotification);

// Interactive Two-Way WhatsApp Webhook endpoints
router.post('/whatsapp-webhook', notificationController.handleWhatsAppWebhook);
router.post('/webhook', notificationController.handleWhatsAppWebhook);

module.exports = router;

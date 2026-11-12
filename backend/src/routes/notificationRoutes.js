// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { optionalVerifyToken, forbidOfficer } = require('../middleware/departmentAuth');

// Retrieve statutory SMS and WhatsApp notification logs
router.get('/', optionalVerifyToken, forbidOfficer, notificationController.getLogs);

// Send manual/test notification
router.post('/test', optionalVerifyToken, forbidOfficer, notificationController.sendTestNotification);

// WhatsApp Multi-Device Linking & Status
router.get('/whatsapp-status', optionalVerifyToken, forbidOfficer, notificationController.getWhatsAppStatus);
router.post('/whatsapp-disconnect', optionalVerifyToken, forbidOfficer, notificationController.disconnectWhatsApp);

// Notification Live Dispatch Pause / Resume Controls
router.post('/pause', optionalVerifyToken, forbidOfficer, notificationController.pauseNotifications);
router.post('/resume', optionalVerifyToken, forbidOfficer, notificationController.resumeNotifications);
router.get('/pause-status', notificationController.getPauseStatus);

// Interactive Two-Way WhatsApp Webhook endpoints
router.post('/whatsapp-webhook', notificationController.handleWhatsAppWebhook);
router.post('/webhook', notificationController.handleWhatsAppWebhook);

module.exports = router;


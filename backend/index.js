require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const grievanceRoutes = require('./src/routes/grievanceRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const ipfsRoutes = require('./src/routes/ipfsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const blockchainRoutes = require('./src/routes/blockchainRoutes');
const notificationController = require('./src/controllers/notificationController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'JanSeva / DIGIT CMS REST API Backend Gateway',
    timestamp: new Date().toISOString(),
    hyperledgerFabric: 'Channel janseva-channel / Chaincode grievance_cc Active',
    ipfsStorage: 'Active / Local Content-Addressed Store',
    statutoryNotifications: 'Active / SMS & WhatsApp DLT Gateway'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/upload', ipfsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/webhook/whatsapp', notificationController.handleWhatsAppWebhook);

const whatsappService = require('./src/services/whatsappService');

app.listen(PORT, () => {
  console.log(`[JanSeva Backend] Server running on http://localhost:${PORT}`);
  whatsappService.initWhatsApp().catch(err => {
    console.warn('[WhatsApp Service Init Warning]:', err.message);
  });
});

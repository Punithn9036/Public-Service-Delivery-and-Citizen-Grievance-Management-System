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

// Fallback 404 handler for API routes (always return JSON, never HTML)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Serve built React SPA in production if available
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler for API
app.use((err, req, res, next) => {
  console.error('[JanSeva API Error]:', err);
  if (res.headersSent) {
    return next(err);
  }
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      error: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.'
    });
  }
  next(err);
});

const whatsappService = require('./src/services/whatsappService');


app.listen(PORT, () => {
  console.log(`[JanSeva Backend] Server running on http://localhost:${PORT}`);
  whatsappService.initWhatsApp().catch(err => {
    console.warn('[WhatsApp Service Init Warning]:', err.message);
  });
});

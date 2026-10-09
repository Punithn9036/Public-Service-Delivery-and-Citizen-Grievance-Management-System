require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const grievanceRoutes = require('./src/routes/grievanceRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const ipfsRoutes = require('./src/routes/ipfsRoutes');

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
    hyperledgerFabric: 'PortalOrg / GovOrg Gateway Configured',
    ipfsStorage: 'Active / Local Content-Addressed Store'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/upload', ipfsRoutes);

app.listen(PORT, () => {
  console.log(`[JanSeva Backend] Server running on http://localhost:${PORT}`);
});

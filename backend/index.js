require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'JanSeva / DIGIT CMS REST API Backend Gateway',
    timestamp: new Date().toISOString(),
    hyperledgerFabric: 'PortalOrg / GovOrg Gateway Configured'
  });
});

// Grievances Placeholder Endpoint
app.get('/api/grievances', (req, res) => {
  res.json({
    message: 'JanSeva Citizen Grievances API Ready',
    grievances: []
  });
});

app.listen(PORT, () => {
  console.log(`[JanSeva Backend] Server running on http://localhost:${PORT}`);
});

// backend/src/routes/adminGovernanceRoutes.js
// Admin Control Room & Civic Advisory routes

const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { optionalVerifyToken } = require('../middleware/departmentAuth');
const {
  getAdminOfficers,
  addAdminOfficer,
  patchAdminOfficer,
  fetchAuditLogs,
  listCivicAdvisories,
  postCivicAdvisory,
  patchCivicAdvisory,
  fetchSlaPolicies,
  saveSlaPolicy,
  getControlRoomAnalytics
} = require('../controllers/adminGovernanceController');

const adminRouter = express.Router();

// Officer Lifecycle CRUD (Admin Only)
adminRouter.get('/officers', verifyToken, requireRole('ADMIN'), getAdminOfficers);
adminRouter.post('/officers', verifyToken, requireRole('ADMIN'), addAdminOfficer);
adminRouter.patch('/officers/:id', verifyToken, requireRole('ADMIN'), patchAdminOfficer);

// Governance Audit Logs (Admin Only)
adminRouter.get('/audit-logs', verifyToken, requireRole('ADMIN'), fetchAuditLogs);

// Dynamic SLA Policies (Officers can read own dept policy; Admin can edit all)
adminRouter.get('/sla-policies', verifyToken, requireRole('ADMIN', 'OFFICER'), fetchSlaPolicies);
adminRouter.put('/sla-policies', verifyToken, requireRole('ADMIN'), saveSlaPolicy);

// Real-Time Municipal Control Room Analytics (Admin Only)
adminRouter.get('/analytics', verifyToken, requireRole('ADMIN'), getControlRoomAnalytics);

const advisoryRouter = express.Router();
advisoryRouter.get('/', optionalVerifyToken, listCivicAdvisories);
advisoryRouter.post('/', verifyToken, requireRole('ADMIN'), postCivicAdvisory);
advisoryRouter.patch('/:id', verifyToken, requireRole('ADMIN'), patchCivicAdvisory);

module.exports = {
  adminRouter,
  advisoryRouter
};

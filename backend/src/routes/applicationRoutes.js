// backend/src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus
} = require('../controllers/applicationController');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public lookup & submission
router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.post('/', createApplication);

// Officer status update
router.patch('/:id/status', verifyToken, requireRole('ADMIN', 'OFFICER'), updateApplicationStatus);

module.exports = router;

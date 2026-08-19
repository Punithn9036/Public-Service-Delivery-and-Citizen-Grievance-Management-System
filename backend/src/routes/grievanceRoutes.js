const express = require('express');
const router = express.Router();
const { 
  getAllGrievances, 
  getGrievanceById, 
  createGrievance, 
  updateGrievanceStatus, 
  submitFeedback, 
  reopenGrievance 
} = require('../controllers/grievanceController');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public / Citizen Search & Lookup
router.get('/', getAllGrievances);
router.get('/:id', getGrievanceById);

// Submit new grievance
router.post('/', createGrievance);

// Official State Machine Transition Update (Restricted to Officers & Admins)
router.patch('/:id/status', verifyToken, requireRole('ADMIN', 'OFFICER'), updateGrievanceStatus);

// Citizen Feedback & Escalation
router.post('/:id/feedback', submitFeedback);
router.post('/:id/reopen', reopenGrievance);

module.exports = router;

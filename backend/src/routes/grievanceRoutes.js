const express = require('express');
const router = express.Router();
const { 
  getAllGrievances, 
  getGrievanceById, 
  createGrievance, 
  updateGrievanceStatus, 
  submitFeedback, 
  reopenGrievance,
  upvoteGrievance,
  getOfficerRoster
} = require('../controllers/grievanceController');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Sector-Based Officer Duty Roster & Queue Status
router.get('/officers/roster', getOfficerRoster);

// Public / Citizen Search & Lookup
router.get('/', getAllGrievances);
router.get('/:id', getGrievanceById);

// Submit new grievance
router.post('/', createGrievance);

// Official State Machine Transition Update (Restricted to Officers & Admins)
router.patch('/:id/status', verifyToken, requireRole('ADMIN', 'OFFICER'), updateGrievanceStatus);

// Citizen Feedback, Escalation, and Community Upvote
router.post('/:id/feedback', submitFeedback);
router.post('/:id/reopen', reopenGrievance);
router.post('/:id/upvote', upvoteGrievance);

module.exports = router;

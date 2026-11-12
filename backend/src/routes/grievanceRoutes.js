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
  getOfficerRoster,
  claimGrievance,
  transferGrievanceDepartment,
  bulkAssignGrievances,
  linkDuplicateGrievance
} = require('../controllers/grievanceController');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { optionalVerifyToken } = require('../middleware/departmentAuth');

// Sector-Based Officer Duty Roster & Queue Status
router.get('/officers/roster', optionalVerifyToken, getOfficerRoster);
router.post('/bulk-assign', verifyToken, requireRole('ADMIN'), bulkAssignGrievances);

// Public / Citizen Search & Lookup
router.get('/', optionalVerifyToken, getAllGrievances);
router.get('/:id', optionalVerifyToken, getGrievanceById);

// Submit new grievance
router.post('/', createGrievance);

// Official State Machine Transition Update (Restricted to Officers & Admins)
router.patch('/:id/status', verifyToken, requireRole('ADMIN', 'OFFICER'), updateGrievanceStatus);
router.post('/:id/claim', verifyToken, requireRole('ADMIN', 'OFFICER'), claimGrievance);
router.post('/:id/transfer', verifyToken, requireRole('ADMIN', 'OFFICER'), transferGrievanceDepartment);
router.post('/:id/link-duplicate', verifyToken, requireRole('ADMIN'), linkDuplicateGrievance);

// Citizen Feedback, Escalation, and Community Upvote
router.post('/:id/feedback', submitFeedback);
router.post('/:id/reopen', reopenGrievance);
router.post('/:id/upvote', upvoteGrievance);

module.exports = router;

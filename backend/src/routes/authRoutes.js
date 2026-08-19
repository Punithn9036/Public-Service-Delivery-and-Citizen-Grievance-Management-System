const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public Auth Endpoints
router.post('/register', register);
router.post('/login', login);

// Protected Auth Profile
router.get('/me', verifyToken, getProfile);

// RBAC Protected Test Route for Nodal Admins & Officers
router.get('/official-test', verifyToken, requireRole('ADMIN', 'OFFICER'), (req, res) => {
  res.json({
    message: 'Welcome Nodal Officer! RBAC Access granted.',
    user: req.user
  });
});

module.exports = router;

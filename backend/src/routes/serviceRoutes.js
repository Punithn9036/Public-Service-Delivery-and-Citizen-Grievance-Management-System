// backend/src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { getAllServices, getServiceById, createService, updateService } = require('../controllers/serviceController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', verifyToken, requireRole('ADMIN'), createService);
router.patch('/:id', verifyToken, requireRole('ADMIN'), updateService);

module.exports = router;

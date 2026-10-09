// backend/src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { getAllServices, getServiceById } = require('../controllers/serviceController');

router.get('/', getAllServices);
router.get('/:id', getServiceById);

module.exports = router;

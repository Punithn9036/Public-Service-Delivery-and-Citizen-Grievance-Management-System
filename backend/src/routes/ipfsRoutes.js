// backend/src/routes/ipfsRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getFile, getFileMeta } = require('../controllers/ipfsController');

// Upload endpoint supporting both multipart/form-data ('file') and JSON base64
router.post('/upload', upload.single('file'), uploadFile);

// IPFS Gateway lookup and streaming
router.get('/:cid', getFile);
router.get('/:cid/meta', getFileMeta);

module.exports = router;

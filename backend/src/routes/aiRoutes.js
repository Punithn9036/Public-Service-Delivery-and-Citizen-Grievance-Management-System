// backend/src/routes/aiRoutes.js
// Express routes for chatbot audio/text grievance extraction & AI capabilities
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { getCapabilities, extractGrievance } = require('../controllers/aiController');

// Dedicated memory uploader allowing audio blobs (WebM/MP4/OGG/WAV/MPEG) + optional photos
const aiMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max audio/evidence clip
  },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || '').toLowerCase();
    if (mime.startsWith('audio/') || mime.startsWith('image/') || mime === 'application/octet-stream') {
      return cb(null, true);
    }
    return cb(new Error(`Unsupported AI intake media type '${file.mimetype}'.`), false);
  }
});

router.get('/capabilities', getCapabilities);

router.post(
  '/extract-grievance',
  aiMediaUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
  ]),
  extractGrievance
);

module.exports = router;

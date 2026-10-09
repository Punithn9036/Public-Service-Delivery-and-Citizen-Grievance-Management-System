// backend/src/middleware/uploadMiddleware.js
// Multer middleware for handling citizen and officer document/photo uploads
const multer = require('multer');

// Store files in memory so we can compute IPFS CID hash before writing to storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
    'text/plain'
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not supported. Please upload an image (JPG, PNG, WebP) or PDF.`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size
  },
  fileFilter
});

module.exports = upload;

// backend/src/controllers/ipfsController.js
const { uploadToIPFS, getFileFromIPFS } = require('../../utils/ipfs');

/**
 * Upload single file (multipart form or JSON base64) to IPFS
 */
const uploadFile = async (req, res) => {
  try {
    let result;

    if (req.file) {
      // Multipart form upload
      result = await uploadToIPFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    } else if (req.body && (req.body.file || req.body.fileContent)) {
      // Base64 JSON upload
      const content = req.body.file || req.body.fileContent;
      const filename = req.body.filename || req.body.attachmentName || 'evidence.jpg';
      const mimeType = req.body.mimeType || 'image/jpeg';
      result = await uploadToIPFS(content, filename, mimeType);
    } else {
      return res.status(400).json({
        error: 'NO_FILE_PROVIDED',
        message: 'Please provide a file attachment (multipart/form-data or base64 JSON payload).'
      });
    }

    return res.status(201).json({
      message: 'Document successfully pinned to IPFS repository.',
      cid: result.cid,
      filename: result.filename,
      size: result.size,
      mimeType: result.mimeType,
      gatewayUrl: result.gatewayUrl
    });
  } catch (err) {
    return res.status(500).json({ error: 'IPFS_UPLOAD_ERROR', message: err.message });
  }
};

/**
 * Stream/Download file from IPFS Gateway by CID
 */
const getFile = async (req, res) => {
  try {
    const { cid } = req.params;
    const fileData = getFileFromIPFS(cid);

    if (!fileData) {
      return res.status(404).json({
        error: 'CID_NOT_FOUND',
        message: `Content Identifier '${cid}' not found in local IPFS store.`
      });
    }

    res.setHeader('Content-Type', fileData.meta.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', fileData.buffer.length);
    res.setHeader('ETag', `"${cid}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', `inline; filename="${fileData.meta.filename || cid}"`);

    return res.send(fileData.buffer);
  } catch (err) {
    return res.status(500).json({ error: 'IPFS_FETCH_ERROR', message: err.message });
  }
};

/**
 * Retrieve IPFS CID Metadata (hash verification, size, upload timestamp)
 */
const getFileMeta = async (req, res) => {
  try {
    const { cid } = req.params;
    const fileData = getFileFromIPFS(cid);

    if (!fileData) {
      return res.status(404).json({
        error: 'CID_NOT_FOUND',
        message: `Content Identifier '${cid}' not found.`
      });
    }

    return res.json({
      cid,
      ...fileData.meta
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  uploadFile,
  getFile,
  getFileMeta
};

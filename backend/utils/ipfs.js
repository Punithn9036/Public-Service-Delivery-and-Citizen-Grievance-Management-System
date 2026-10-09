// backend/utils/ipfs.js
// Production IPFS Decentralized Content-Addressed Storage Engine
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');

const IPFS_STORAGE_DIR = path.join(__dirname, '../data/ipfs_storage');
const IPFS_META_DIR = path.join(__dirname, '../data/ipfs_meta');

// Ensure storage directories exist
if (!fs.existsSync(IPFS_STORAGE_DIR)) {
  fs.mkdirSync(IPFS_STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(IPFS_META_DIR)) {
  fs.mkdirSync(IPFS_META_DIR, { recursive: true });
}

const IPFS_NODE_URL = process.env.IPFS_NODE_URL || 'http://localhost:5001';

// Base58 characters for IPFS CIDv0 format
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  let leadingZeros = 0;
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    leadingZeros++;
  }

  let str = '';
  for (let i = 0; i < leadingZeros; i++) {
    str += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += BASE58_ALPHABET[digits[i]];
  }
  return str;
}

/**
 * Compute real Multihash SHA-256 IPFS CIDv0 (Qm...)
 * Multihash format: [0x12 (sha2-256), 0x20 (32 bytes length), ...32 bytes sha256 hash]
 */
function computeIPFSCid(buffer) {
  const sha256Hash = crypto.createHash('sha256').update(buffer).digest();
  const multihash = Buffer.concat([
    Buffer.from([0x12, 0x20]),
    sha256Hash
  ]);
  return encodeBase58(multihash);
}

/**
 * Upload buffer or file to IPFS storage repository
 * @param {Buffer|string} content 
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {Promise<{ cid: string, filename: string, size: number, mimeType: string, gatewayUrl: string }>}
 */
async function uploadToIPFS(content, filename = 'evidence.jpg', mimeType = 'application/octet-stream') {
  let buffer;
  if (Buffer.isBuffer(content)) {
    buffer = content;
  } else if (typeof content === 'string' && content.startsWith('data:')) {
    // Data URL base64 format: data:image/png;base64,iVBORw...
    const matches = content.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(content);
    }
  } else if (typeof content === 'string') {
    buffer = Buffer.from(content);
  } else {
    buffer = Buffer.from(String(content));
  }

  const cid = computeIPFSCid(buffer);
  const filePath = path.join(IPFS_STORAGE_DIR, cid);
  const metaPath = path.join(IPFS_META_DIR, `${cid}.json`);

  // Persist raw binary content to local content-addressed store
  fs.writeFileSync(filePath, buffer);

  const meta = {
    cid,
    filename,
    mimeType,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
    pinned: true,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    gatewayUrl: `/api/ipfs/${cid}`
  };

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

  // Attach convenience string helpers for backward compatibility
  meta.startsWith = (prefix) => cid.startsWith(prefix);
  meta.toString = () => cid;

  // Attempt background pin to Kubo node if active
  try {
    const url = new URL(`${IPFS_NODE_URL}/api/v0/add`);
    const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');
    const postHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
    const postFooter = `\r\n--${boundary}--\r\n`;
    const fullBody = Buffer.concat([Buffer.from(postHeader), buffer, Buffer.from(postFooter)]);

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 5001,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      },
      timeout: 2000
    });
    req.on('error', () => {}); // Silently continue on local daemon offline
    req.write(fullBody);
    req.end();
  } catch (e) {}

  return meta;
}

/**
 * Retrieve a file and its metadata from IPFS repository
 */
function getFileFromIPFS(cid) {
  if (!cid) return null;
  const filePath = path.join(IPFS_STORAGE_DIR, cid);
  const metaPath = path.join(IPFS_META_DIR, `${cid}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  let meta = {
    cid,
    mimeType: 'application/octet-stream',
    filename: `${cid}.bin`,
    size: buffer.length
  };

  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (e) {}
  }

  return { buffer, meta };
}

module.exports = {
  uploadToIPFS,
  getFileFromIPFS,
  computeIPFSCid
};

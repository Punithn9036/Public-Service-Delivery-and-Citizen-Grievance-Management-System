// backend/src/routes/blockchainRoutes.js
// Routes for Hyperledger Fabric Blockchain Ledger, Explorer, and Cryptographic Verification

const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { optionalVerifyToken, forbidOfficer } = require('../middleware/departmentAuth');

// Network Information & Peer Topology
router.get('/info', optionalVerifyToken, forbidOfficer, blockchainController.getNetworkInfo);

// Block Explorer Endpoints
router.get('/blocks', optionalVerifyToken, forbidOfficer, blockchainController.getBlocks);
router.get('/blocks/:number', optionalVerifyToken, forbidOfficer, blockchainController.getBlockByNumber);

// Transaction Details
router.get('/transactions/:txId', blockchainController.getTransaction);

// Grievance On-Chain Audit History
router.get('/history/:grievanceId', blockchainController.getGrievanceHistory);

// Cryptographic Verification
router.get('/verify/:txId', blockchainController.verifyTransaction);
router.post('/verify/:txId', blockchainController.verifyTransaction);

module.exports = router;

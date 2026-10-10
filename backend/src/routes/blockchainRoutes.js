// backend/src/routes/blockchainRoutes.js
// Routes for Hyperledger Fabric Blockchain Ledger, Explorer, and Cryptographic Verification

const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// Network Information & Peer Topology
router.get('/info', blockchainController.getNetworkInfo);

// Block Explorer Endpoints
router.get('/blocks', blockchainController.getBlocks);
router.get('/blocks/:number', blockchainController.getBlockByNumber);

// Transaction Details
router.get('/transactions/:txId', blockchainController.getTransaction);

// Grievance On-Chain Audit History
router.get('/history/:grievanceId', blockchainController.getGrievanceHistory);

// Cryptographic Verification
router.get('/verify/:txId', blockchainController.verifyTransaction);
router.post('/verify/:txId', blockchainController.verifyTransaction);

module.exports = router;

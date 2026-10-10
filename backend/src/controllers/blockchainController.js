// backend/src/controllers/blockchainController.js
// Hyperledger Fabric REST Controller for Blockchain Ledger & Grievance State Verification

const FabricClient = require('../../fabric/client');

/**
 * Get Blockchain Network Info & Peer Topology
 * GET /api/blockchain/info
 */
const getNetworkInfo = async (req, res) => {
  try {
    const info = FabricClient.getBlockchainInfo();
    return res.json(info);
  } catch (err) {
    return res.status(500).json({ error: 'FABRIC_ERROR', message: err.message });
  }
};

/**
 * Get Paginated List of Ledger Blocks (Latest first)
 * GET /api/blockchain/blocks?limit=20&offset=0
 */
const getBlocks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = FabricClient.getBlocks(limit, offset);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'FABRIC_ERROR', message: err.message });
  }
};

/**
 * Get Block Details by Block Number
 * GET /api/blockchain/blocks/:number
 */
const getBlockByNumber = async (req, res) => {
  try {
    const blockNumber = req.params.number;
    const block = FabricClient.getBlockByNumber(blockNumber);
    if (!block) {
      return res.status(404).json({ error: 'BLOCK_NOT_FOUND', message: `Block #${blockNumber} does not exist on channel.` });
    }
    return res.json({ block });
  } catch (err) {
    return res.status(500).json({ error: 'FABRIC_ERROR', message: err.message });
  }
};

/**
 * Get Transaction Details by Cryptographic Transaction ID
 * GET /api/blockchain/transactions/:txId
 */
const getTransaction = async (req, res) => {
  try {
    const { txId } = req.params;
    const txDetails = FabricClient.getTransaction(txId);
    if (!txDetails) {
      return res.status(404).json({ error: 'TRANSACTION_NOT_FOUND', message: `Transaction '${txId}' not found on ledger.` });
    }
    return res.json(txDetails);
  } catch (err) {
    return res.status(500).json({ error: 'FABRIC_ERROR', message: err.message });
  }
};

/**
 * Query On-Chain Audit Trail for a specific Grievance Ticket
 * GET /api/blockchain/history/:grievanceId
 */
const getGrievanceHistory = async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const history = FabricClient.getGrievanceHistory(grievanceId);
    return res.json({
      grievanceId,
      channelId: FabricClient.CHANNEL_ID,
      chaincodeId: FabricClient.CHAINCODE_ID,
      count: history.length,
      history
    });
  } catch (err) {
    return res.status(500).json({ error: 'FABRIC_ERROR', message: err.message });
  }
};

/**
 * Verify Transaction Cryptographic Hash & Block Chaining Integrity
 * GET or POST /api/blockchain/verify/:txId
 */
const verifyTransaction = async (req, res) => {
  try {
    const { txId } = req.params;
    const verification = FabricClient.verifyTransaction(txId);
    if (!verification.verified) {
      return res.status(404).json(verification);
    }
    return res.json(verification);
  } catch (err) {
    return res.status(500).json({ error: 'FABRIC_ERROR', message: err.message });
  }
};

module.exports = {
  getNetworkInfo,
  getBlocks,
  getBlockByNumber,
  getTransaction,
  getGrievanceHistory,
  verifyTransaction
};

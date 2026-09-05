// backend/tests/auth_and_grievance.test.js
// Unit & Integration Test Suite for Auth and Grievance Lifecycle

const { signToken, verifyToken } = require('../utils/auth');
const { hashPassword, comparePassword } = require('../utils/password');
const { uploadToIPFS } = require('../utils/ipfs');
const FabricClient = require('../fabric/client');

describe('Core Functionality & Utility Unit Tests', () => {

  test('Password hashing and verification should work accurately', async () => {
    const rawPass = 'Citizen@Secure2026';
    const hash = await hashPassword(rawPass);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPass);

    const isMatch = await comparePassword(rawPass, hash);
    expect(isMatch).toBe(true);

    const wrongMatch = await comparePassword('WrongPassword!', hash);
    expect(wrongMatch).toBe(false);
  });

  test('JWT sign and verify helper should generate valid signed payloads', () => {
    const userPayload = {
      id: 101,
      userId: 'USR-CIT-999',
      email: 'test.citizen@example.com',
      role: 'CITIZEN',
      department: null
    };

    const token = signToken(userPayload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('USR-CIT-999');
    expect(decoded.role).toBe('CITIZEN');
  });

  test('IPFS upload helper should return a cryptographic Content Identifier (CID)', async () => {
    const testContent = 'Proof document data for road pot hole';
    const cid = await uploadToIPFS(testContent, 'evidence.txt');
    expect(cid).toBeDefined();
    expect(cid.startsWith('Qm')).toBe(true);
  });

  test('Fabric client should submit transaction and return 0x transaction ID', async () => {
    const res = await FabricClient.submitTransaction('CreateGrievance', ['GRV-2026-9999', 'Water Supply', 'Urgent']);
    expect(res.success).toBe(true);
    expect(res.txId.startsWith('0x')).toBe(true);
  });

});

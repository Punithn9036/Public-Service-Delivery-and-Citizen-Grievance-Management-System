// backend/tests/api_integration.test.js
// Comprehensive API Integration Test Suite for Phase 1 Endpoints
const request = require('supertest');
const express = require('express');

const authRoutes = require('../src/routes/authRoutes');
const grievanceRoutes = require('../src/routes/grievanceRoutes');
const applicationRoutes = require('../src/routes/applicationRoutes');
const serviceRoutes = require('../src/routes/serviceRoutes');
const ipfsRoutes = require('../src/routes/ipfsRoutes');
const notificationRoutes = require('../src/routes/notificationRoutes');
const blockchainRoutes = require('../src/routes/blockchainRoutes');
const notificationController = require('../src/controllers/notificationController');

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/webhook/whatsapp', notificationController.handleWhatsAppWebhook);

describe('Phase 1 REST API Integration Tests', () => {
  let citizenToken = '';
  let officerToken = '';
  let testGrievanceId = '';
  let testAppId = '';

  // 1. Authentication Tests
  describe('1. Authentication Endpoints', () => {
    test('POST /api/auth/register should create a new citizen account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test Citizen User',
          email: `citizen.test.${Date.now()}@example.com`,
          phone: '+91 99999 88888',
          password: 'Password123!',
          role: 'CITIZEN'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('CITIZEN');
      citizenToken = res.body.token;
    });

    test('POST /api/auth/login should authenticate existing seeded officer', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rajesh.varma@gov.in',
          password: 'Officer123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('OFFICER');
      officerToken = res.body.token;
    });

    test('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.role).toBe('CITIZEN');
    });
  });

  // 2. Public Services Catalog Tests
  describe('2. Public Services Endpoints', () => {
    test('GET /api/services should return all municipal services', async () => {
      const res = await request(app).get('/api/services');
      expect(res.statusCode).toBe(200);
      expect(res.body.services.length).toBeGreaterThanOrEqual(6);
      expect(res.body.services[0].serviceName).toBeDefined();
    });

    test('GET /api/services/:id should return single service details', async () => {
      const res = await request(app).get('/api/services/srv-1');
      expect(res.statusCode).toBe(200);
      expect(res.body.service.id).toBe('srv-1');
      expect(res.body.service.slaDays).toBe(7);
    });
  });

  // 3. Grievances Lifecycle Tests
  describe('3. Grievances Lifecycle Endpoints', () => {
    test('POST /api/grievances should lodge a new grievance with calculated SLA and TxID', async () => {
      const res = await request(app)
        .post('/api/grievances')
        .send({
          title: 'Burst Water Pipe on Ring Road Junction',
          category: 'Water Supply & Sanitation',
          department: 'Water Supply & Sanitation',
          description: 'High-pressure clean water is gushing across the road.',
          location: 'Ring Road Junction, Ward 10',
          landmark: 'Near Metro Station Pillar 42',
          priority: 'Urgent',
          citizenName: 'Aarav Sharma',
          citizenPhone: '+91 98765 43210'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.grievance).toBeDefined();
      expect(res.body.grievance.id).toMatch(/^GRV-/);
      expect(res.body.grievance.status).toBe('Submitted');
      expect(res.body.grievance.fabricTxId).toBeDefined();
      testGrievanceId = res.body.grievance.id;
    });

    test('GET /api/grievances should retrieve grievances with filters', async () => {
      const res = await request(app)
        .get('/api/grievances?department=Water%20Supply%20%26%20Sanitation');

      expect(res.statusCode).toBe(200);
      expect(res.body.grievances.length).toBeGreaterThan(0);
      expect(res.body.grievances.every(g => g.department === 'Water Supply & Sanitation')).toBe(true);
    });

    test('POST /api/grievances/:id/upvote should increment community count and escalate priority', async () => {
      const res = await request(app)
        .post(`/api/grievances/${testGrievanceId}/upvote`)
        .send({ citizenName: 'Local Resident' });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.reportCount).toBeGreaterThanOrEqual(2);
    });

    test('PATCH /api/grievances/:id/status should update status using state machine', async () => {
      // Transition: Submitted -> Under Review
      const res = await request(app)
        .patch(`/api/grievances/${testGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Under Review',
          officerName: 'Er. Rajesh Varma',
          note: 'Verified pipeline location. Crew dispatched.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.status).toBe('Under Review');
      expect(res.body.grievance.timeline.length).toBeGreaterThanOrEqual(2);
    });

    test('PATCH /api/grievances/:id/status should reject invalid state transition', async () => {
      // Cannot jump from Under Review straight to Resolved
      const res = await request(app)
        .patch(`/api/grievances/${testGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Resolved',
          note: 'Premature resolution attempt.'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('INVALID_STATE_TRANSITION');
    });
  });

  // 4. Service Applications Lifecycle Tests
  describe('4. Service Applications Endpoints', () => {
    test('POST /api/applications should submit a public service application', async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          serviceId: 'srv-1',
          serviceName: 'Issue of Birth Certificate',
          department: 'Revenue & Vital Statistics',
          applicantName: 'Meera Nambiar',
          applicantPhone: '+91 97711 22334',
          applicantEmail: 'meera.n@example.com'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.application).toBeDefined();
      expect(res.body.application.id).toMatch(/^APP-/);
      expect(res.body.application.status).toBe('Submitted');
      testAppId = res.body.application.id;
    });

    test('GET /api/applications should list applications with phone filter', async () => {
      const res = await request(app)
        .get('/api/applications?phone=%2B91%2097711%2022334');

      expect(res.statusCode).toBe(200);
      expect(res.body.applications.length).toBeGreaterThan(0);
      expect(res.body.applications[0].id).toBe(testAppId);
    });

    test('PATCH /api/applications/:id/status should update application status', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          status: 'In Verification',
          remarks: 'Documents received by Registrar officer.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.application.status).toBe('In Verification');
    });
  });

  // 5. Phase 2: Live IPFS Decentralized Document Storage Tests
  describe('5. Phase 2: Live IPFS Decentralized Storage Endpoints', () => {
    let uploadedCid = '';

    test('POST /api/ipfs/upload should pin a base64 document and return a valid Qm CID', async () => {
      const sampleText = 'JanSeva Decentralized Civic Evidence - Ground Truth Verification';
      const base64Data = 'data:text/plain;base64,' + Buffer.from(sampleText).toString('base64');

      const res = await request(app)
        .post('/api/ipfs/upload')
        .send({
          fileContent: base64Data,
          filename: 'civic_evidence.txt'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.cid).toBeDefined();
      expect(res.body.cid.startsWith('Qm')).toBe(true);
      expect(res.body.gatewayUrl).toBe(`/api/ipfs/${res.body.cid}`);
      expect(res.body.size).toBe(sampleText.length);
      uploadedCid = res.body.cid;
    });

    test('GET /api/ipfs/:cid should stream content back with proper HTTP headers', async () => {
      const res = await request(app)
        .get(`/api/ipfs/${uploadedCid}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('JanSeva Decentralized Civic Evidence - Ground Truth Verification');
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.headers['etag']).toBe(`"${uploadedCid}"`);
    });

    test('GET /api/ipfs/:cid/meta should retrieve cryptographic metadata', async () => {
      const res = await request(app)
        .get(`/api/ipfs/${uploadedCid}/meta`);

      expect(res.statusCode).toBe(200);
      expect(res.body.cid).toBe(uploadedCid);
      expect(res.body.filename).toBe('civic_evidence.txt');
      expect(res.body.sha256).toBeDefined();
      expect(res.body.pinned).toBe(true);
    });

    test('POST /api/grievances with fileContent should automatically pin to IPFS and save CID', async () => {
      const photoPayload = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
      
      const res = await request(app)
        .post('/api/grievances')
        .send({
          title: 'Deep Pothole with Water Logging',
          category: 'Roads & Infrastructure',
          department: 'Public Works & Infrastructure',
          description: 'Large crater in road causing traffic disruption and safety hazard.',
          location: 'Outer Ring Road, Ward 22',
          landmark: 'Opposite State Bank',
          priority: 'High',
          citizenName: 'Deepa Narayan',
          citizenPhone: '+91 98888 77777',
          fileContent: photoPayload,
          fileName: 'pothole_photo.jpg'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.grievance.ipfsDocumentCid).toBeDefined();
      expect(res.body.grievance.ipfsDocumentCid.startsWith('Qm')).toBe(true);
    });

    test('POST /api/applications with fileContent should automatically pin to IPFS and save CID', async () => {
      const certDoc = 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZz4+ZW5kb2JqCnRyYWlsZXI8PC9Sb290IDEgMCBSPj4=';

      const res = await request(app)
        .post('/api/applications')
        .send({
          serviceId: 'srv-1',
          serviceName: 'Issue of Birth Certificate',
          department: 'Revenue & Vital Statistics',
          applicantName: 'Rohan Deshmukh',
          applicantPhone: '+91 97777 66666',
          applicantEmail: 'rohan.d@example.com',
          identityProof: 'Aadhaar Card',
          identityNumber: '9988-7766-5544',
          fileContent: certDoc,
          fileName: 'aadhaar_scan.pdf'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.application.ipfsDocumentCid).toBeDefined();
      expect(res.body.application.ipfsDocumentCid.startsWith('Qm')).toBe(true);
    });

    test('GET /api/ipfs/:cid with invalid CID should return 404 CID_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/ipfs/QmNonExistentHash999999999999999999999999999');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('CID_NOT_FOUND');
    });
  });

  // 6. Phase 3: Statutory SMS & WhatsApp Notification Alerts Tests
  describe('6. Phase 3: Statutory SMS & WhatsApp Notification Alerts Tests', () => {
    test('POST /api/notifications/test should dispatch multi-channel statutory alerts with DLT compliance', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .send({
          phone: '+91 98765 43210',
          template: 'GRIEVANCE_LODGED',
          data: {
            id: 'GRV-2026-9999',
            department: 'Public Works & Infrastructure',
            priority: 'Urgent',
            slaHours: 24
          },
          channels: ['SMS', 'WHATSAPP']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.receipts).toHaveLength(2);
      expect(res.body.receipts[0].status).toBe('DELIVERED');
      expect(res.body.receipts[0].dltEntityId).toBe('DLT-GOV-IND-49201');
      expect(res.body.receipts[1].channel).toBe('WHATSAPP');
    });

    test('GET /api/notifications should retrieve statutory dispatch audit logs', async () => {
      const res = await request(app)
        .get('/api/notifications?limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
      expect(res.body.logs[0].id).toMatch(/^NOTIF-/);
      expect(res.body.logs[0].dispatchedAt).toBeDefined();
    });

    test('POST /api/webhook/whatsapp should answer STATUS queries with live grievance redressal information', async () => {
      const res = await request(app)
        .post('/api/webhook/whatsapp')
        .send({
          from: '+91 98765 43210',
          body: 'STATUS GRV-2026-8910'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.replyMessage).toContain('GRV-2026-8910');
      expect(res.body.replyMessage).toContain('JanSeva Redressal Status');
    });

    test('POST /api/webhook/whatsapp should handle HELP keyword with emergency contact numbers', async () => {
      const res = await request(app)
        .post('/api/webhook/whatsapp')
        .send({
          from: '+91 98765 43210',
          body: 'HELP'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.replyMessage).toContain('1800-425-GOV');
      expect(res.body.replyMessage).toContain('112');
    });

    test('POST /api/notifications/test with invalid template should return 400', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .send({
          phone: '+91 98765 43210',
          template: 'UNKNOWN_TEMPLATE_KEY'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('INVALID_TEMPLATE');
    });
  });

  // 6. Phase 4: Hyperledger Fabric Blockchain Smart Contract Tests
  describe('6. Hyperledger Fabric Blockchain & Verification', () => {
    let capturedTxId = '';
    let testGrievanceBlockNum = 0;

    test('GET /api/blockchain/info should return channel topology, Raft consensus, and peer status', async () => {
      const res = await request(app).get('/api/blockchain/info');

      expect(res.statusCode).toBe(200);
      expect(res.body.channelId).toBe('janseva-channel');
      expect(res.body.chaincodeId).toBe('grievance_cc');
      expect(res.body.status).toBe('SYNCHRONIZED');
      expect(res.body.consensus).toContain('Raft');
      expect(Array.isArray(res.body.peers)).toBe(true);
      expect(res.body.peers.length).toBeGreaterThanOrEqual(3);
    });

    test('GET /api/blockchain/blocks should return paginated list of sequential cryptographic blocks', async () => {
      const res = await request(app).get('/api/blockchain/blocks?limit=10&offset=0');

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.blocks)).toBe(true);

      const latestBlock = res.body.blocks[0];
      expect(latestBlock.blockNumber).toBeDefined();
      expect(latestBlock.currentBlockHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(latestBlock.previousBlockHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(latestBlock.dataHash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    test('GET /api/blockchain/blocks/0 should return Genesis Block #0 with OrdererMSP initialization', async () => {
      const res = await request(app).get('/api/blockchain/blocks/0');

      expect(res.statusCode).toBe(200);
      expect(res.body.block).toBeDefined();
      expect(res.body.block.blockNumber).toBe(0);
      expect(res.body.block.previousBlockHash).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
      expect(res.body.block.transactions[0].fcn).toBe('InitLedger');
    });

    test('Lodging a grievance should execute RecordGrievanceState on chaincode and chain a new block', async () => {
      const newGrievance = {
        title: 'Blockchain Verification Sewer Leakage',
        category: 'Water & Sanitation',
        department: 'Water Supply & Sanitation',
        description: 'Testing immutable smart contract state transitions.',
        location: 'Ward 10, Sector 4',
        priority: 'High',
        citizenName: 'Aarav Sharma',
        citizenPhone: '+91 98765 43210'
      };

      const res = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(newGrievance);

      expect(res.statusCode).toBe(201);
      expect(res.body.fabricTxId).toBeDefined();
      expect(res.body.fabricTxId).toMatch(/^0x[a-f0-9]{64}$/);
      expect(res.body.fabricBlockNumber).toBeGreaterThan(0);
      expect(res.body.fabricBlockHash).toMatch(/^0x[a-f0-9]{64}$/);

      capturedTxId = res.body.fabricTxId;
      testGrievanceBlockNum = res.body.fabricBlockNumber;
    });

    test('POST /api/blockchain/verify/:txId should cryptographically verify transaction and hash integrity', async () => {
      expect(capturedTxId).toBeDefined();

      const res = await request(app).post(`/api/blockchain/verify/${capturedTxId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.txId.toLowerCase()).toBe(capturedTxId.toLowerCase());
      expect(res.body.blockNumber).toBe(testGrievanceBlockNum);
      expect(res.body.channelId).toBe('janseva-channel');
      expect(res.body.hashIntegrityVerified).toBe(true);
      expect(res.body.confirmations).toBeGreaterThanOrEqual(1);
    });

    test('GET /api/blockchain/history/:grievanceId should return smart contract audit transitions', async () => {
      const res = await request(app).get('/api/blockchain/history/GRV-2026-8942');

      expect(res.statusCode).toBe(200);
      expect(res.body.grievanceId).toBe('GRV-2026-8942');
      expect(res.body.channelId).toBe('janseva-channel');
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.history)).toBe(true);

      const firstState = res.body.history[0];
      expect(firstState.txId).toBeDefined();
      expect(firstState.status).toBeDefined();
      expect(firstState.updatedByOrg).toBeDefined();
    });

    test('GET /api/blockchain/verify/:txId with nonexistent hash should return 404', async () => {
      const fakeTx = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const res = await request(app).get(`/api/blockchain/verify/${fakeTx}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.verified).toBe(false);
      expect(res.body.error).toBe('TRANSACTION_NOT_FOUND');
    });
  });

});

// backend/tests/master_audit.test.js
// Master Audit & Verification Suite for JanSeva Platform
// Covering Phase 3 (Auth/RBAC), Phase 4 (Grievances), Phase 5 (Applications), 
// Phase 6 (Blockchain/Fabric), Phase 7 (IPFS), Phase 8/9 (Roster/SLA), 
// Phase 10 (Notifications), Phase 12 (Security), Phase 14 (Edge Cases)

const request = require('supertest');
const express = require('express');
const crypto = require('crypto');

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
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/webhook/whatsapp', notificationController.handleWhatsAppWebhook);

// 404 handler
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `API endpoint '${req.originalUrl}' not found.` });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.code || 'INTERNAL_SERVER_ERROR', message: err.message });
});

describe('JANSEVA MASTER AUDIT & VALIDATION SUITE', () => {
  let citizenToken = '';
  let officerToken = '';
  let adminToken = '';
  let createdGrievanceId = '';
  let createdApplicationId = '';
  let uploadedIpfsCid = '';
  let fabricTxId = '';

  // =========================================================================
  // PHASE 3: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // =========================================================================
  describe('Phase 3: Authentication & Authorization Lifecycle', () => {
    const testCitizenEmail = `audit.citizen.${Date.now()}@example.com`;

    test('3.1 Registration: Public citizen account creation succeeds with 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Audit Citizen User',
          email: testCitizenEmail,
          phone: '+91 91234 56789',
          password: 'Password123!',
          role: 'CITIZEN'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.role).toBe('CITIZEN');
      expect(res.body.user.email).toBe(testCitizenEmail);
      expect(res.body.user.passwordHash).toBeUndefined(); // Password hash must never leak
      citizenToken = res.body.token;
    });

    test('3.2 Registration: Duplicate email registration is rejected with 409 USER_EXISTS', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate User Attempt',
          email: testCitizenEmail,
          phone: '+91 91234 56789',
          password: 'Password123!',
          role: 'CITIZEN'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('USER_EXISTS');
    });

    test('3.3 Security: Unrestricted Privilege Escalation Prevention (ADMIN role self-assignment blocked)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Malicious PrivEsc Attacker',
          email: `attacker.${Date.now()}@evil.com`,
          phone: '+91 99999 00000',
          password: 'Password123!',
          role: 'ADMIN' // Malicious attempt to register as Administrator
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    test('3.4 Security: Officer registration without valid Employee ID is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Fake Officer',
          email: `fake.officer.${Date.now()}@gov.in`,
          phone: '+91 98765 00000',
          password: 'Officer123!',
          role: 'OFFICER'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('EMPLOYEE_ID_REQUIRED');
    });

    test('3.5 Login: Valid citizen login with bcrypt authentication succeeds', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.sharma@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('CITIZEN');
      expect(res.body.user.email).toBe('aarav.sharma@example.com');
      citizenToken = res.body.token;
    });

    test('3.6 Login: Valid officer login with bcrypt authentication succeeds', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rajesh.varma@gov.in',
          password: 'Officer123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('OFFICER');
      expect(res.body.user.department).toBe('Water Supply & Sanitation');
      officerToken = res.body.token;
    });

    test('3.7 Login: Valid admin login with bcrypt authentication succeeds', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin.controlroom@gov.in',
          password: 'Admin123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
      adminToken = res.body.token;
    });

    test('3.8 Login: Invalid password is authenticated with real bcrypt and rejected with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.sharma@example.com',
          password: 'IncorrectPassword999!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });

    test('3.9 Login: Non-existent account is rejected with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user.999@example.com',
          password: 'AnyPassword123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });

    test('3.10 Authorization: Tampered or invalid JWT signature returns 401 INVALID_TOKEN', async () => {
      const tamperedToken = citizenToken.slice(0, -6) + 'abcdef';
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('INVALID_TOKEN');
    });

    test('3.11 Authorization: Missing Authorization header returns 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    test('3.12 RBAC: Citizen cannot access official officer/admin endpoint (403 FORBIDDEN_ROLE)', async () => {
      const res = await request(app)
        .get('/api/auth/official-test')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    test('3.13 RBAC: Officer can access official endpoint (200 OK)', async () => {
      const res = await request(app)
        .get('/api/auth/official-test')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.role).toBe('OFFICER');
    });

    test('3.14 RBAC: Admin can access official endpoint (200 OK)', async () => {
      const res = await request(app)
        .get('/api/auth/official-test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.role).toBe('ADMIN');
    });
  });

  // =========================================================================
  // PHASE 4: GRIEVANCE MANAGEMENT LIFECYCLE & STATE MACHINE
  // =========================================================================
  describe('Phase 4: Grievance Lifecycle & State Machine Enforcement', () => {
    test('4.1 Validation: Grievance submission with missing required fields returns 400', async () => {
      const res = await request(app)
        .post('/api/grievances')
        .send({
          title: '',
          category: ''
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    test('4.2 Submission: Lodging new grievance calculates SLA, allocates officer, and chains to Fabric', async () => {
      const res = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Damaged Water Main on 5th Cross Road',
          category: 'Water Supply & Sanitation',
          department: 'Water Supply & Sanitation',
          description: 'High pressure municipal pipe burst resulting in severe water loss.',
          location: '5th Cross, Sector 1, Ward 14',
          landmark: 'Opposite Government Primary School',
          priority: 'Urgent',
          citizenName: 'Aarav Sharma',
          citizenPhone: '+91 98765 43210',
          citizenEmail: 'aarav.sharma@example.com'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.grievance).toBeDefined();
      expect(res.body.grievance.id).toMatch(/^GRV-/);
      expect(res.body.grievance.status).toBe('Submitted');
      expect(res.body.grievance.priority).toBe('Urgent');
      expect(res.body.grievance.slaDeadline).toBeDefined();
      expect(res.body.fabricTxId).toMatch(/^0x[a-f0-9]{64}$/);
      expect(res.body.fabricBlockNumber).toBeGreaterThanOrEqual(1);

      createdGrievanceId = res.body.grievance.id;
      fabricTxId = res.body.fabricTxId;
    });

    test('4.3 State Machine: Citizen attempting official state change is rejected (403 FORBIDDEN_ROLE)', async () => {
      const res = await request(app)
        .patch(`/api/grievances/${createdGrievanceId}/status`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          nextStatus: 'In Progress',
          note: 'Citizen attempting unauthorized self-transition.'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    test('4.4 State Machine: Invalid transition (Submitted -> Resolved directly) is rejected (400)', async () => {
      const res = await request(app)
        .patch(`/api/grievances/${createdGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Resolved',
          note: 'Premature resolution without review or progress.'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('INVALID_STATE_TRANSITION');
    });

    test('4.5 State Machine: Transition 1: Submitted -> Under Review succeeds', async () => {
      const res = await request(app)
        .patch(`/api/grievances/${createdGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Under Review',
          officerName: 'Er. Rajesh Varma',
          note: 'Water supply control engineer reviewed incident parameters.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.status).toBe('Under Review');
      expect(res.body.fabricTxId).toMatch(/^0x[a-f0-9]{64}$/);
    });

    test('4.6 State Machine: Transition 2: Under Review -> Assigned succeeds', async () => {
      const res = await request(app)
        .patch(`/api/grievances/${createdGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Assigned',
          officerName: 'Er. Rajesh Varma',
          note: 'Assigned to Ward 14 Field Repair Team.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.status).toBe('Assigned');
    });

    test('4.7 State Machine: Transition 3: Assigned -> In Progress succeeds', async () => {
      const res = await request(app)
        .patch(`/api/grievances/${createdGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'In Progress',
          officerName: 'Er. Rajesh Varma',
          note: 'Excavation team on site; valve shut off and replacement pipe in transit.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.status).toBe('In Progress');
    });

    test('4.8 State Machine: Transition 4: In Progress -> Resolved succeeds and releases officer', async () => {
      const res = await request(app)
        .patch(`/api/grievances/${createdGrievanceId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Resolved',
          officerName: 'Er. Rajesh Varma',
          note: 'Main line welded, pressure restored, road asphalt patched.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.status).toBe('Resolved');
      expect(res.body.fabricTxId).toBeDefined();
    });

    test('4.9 Community: Upvoting increases report count', async () => {
      const res = await request(app)
        .post(`/api/grievances/${createdGrievanceId}/upvote`)
        .send({ citizenName: 'Local Shopkeeper' });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.reportCount).toBeGreaterThanOrEqual(2);
    });

    test('4.10 Feedback: Citizen rating (1-5 stars) and feedback note recorded', async () => {
      const res = await request(app)
        .post(`/api/grievances/${createdGrievanceId}/feedback`)
        .send({
          rating: 5,
          comments: 'Prompt response and clean road repair. Thank you!',
          officerRating: 5
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.feedback).toBeDefined();
      expect(res.body.feedback.rating).toBe(5);
    });

    test('4.11 Reopen: Citizen can reopen resolved grievance if issue reoccurs', async () => {
      const res = await request(app)
        .post(`/api/grievances/${createdGrievanceId}/reopen`)
        .send({
          reason: 'Water pressure dropped again near junction after 2 hours.',
          citizenName: 'Aarav Sharma'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.grievance.status).toBe('Under Review');
      expect(res.body.fabricTxId).toBeDefined();
    });

    test('4.12 Query: Filtering by department and status returns correct records', async () => {
      const res = await request(app)
        .get('/api/grievances?department=Water%20Supply%20%26%20Sanitation');

      expect(res.statusCode).toBe(200);
      expect(res.body.grievances.length).toBeGreaterThan(0);
      expect(res.body.grievances.every(g => g.department === 'Water Supply & Sanitation')).toBe(true);
    });
  });

  // =========================================================================
  // PHASE 5: PUBLIC SERVICE APPLICATIONS LIFECYCLE
  // =========================================================================
  describe('Phase 5: Public Service Applications Lifecycle', () => {
    test('5.1 Services Catalog: GET /api/services returns catalog with SLA and requirements', async () => {
      const res = await request(app).get('/api/services');
      expect(res.statusCode).toBe(200);
      expect(res.body.services.length).toBeGreaterThanOrEqual(6);
      expect(res.body.services[0].id).toBeDefined();
      expect(res.body.services[0].serviceName).toBeDefined();
      expect(res.body.services[0].slaDays).toBeGreaterThan(0);
    });

    test('5.2 Service Details: GET /api/services/:id returns single service details', async () => {
      const res = await request(app).get('/api/services/srv-1');
      expect(res.statusCode).toBe(200);
      expect(res.body.service.id).toBe('srv-1');
      expect(res.body.service.department).toBe('Revenue & Vital Statistics');
    });

    test('5.3 Service Details: Invalid service ID returns 404 NOT_FOUND', async () => {
      const res = await request(app).get('/api/services/srv-nonexistent-999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    test('5.4 Application: Submitting a service application returns 201 with APP ID and SLA', async () => {
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
          identityNumber: '9988-7766-5544'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.application).toBeDefined();
      expect(res.body.application.id).toMatch(/^APP-/);
      expect(res.body.application.status).toBe('Submitted');
      expect(res.body.application.estimatedCompletion).toBeDefined();
      createdApplicationId = res.body.application.id;
    });

    test('5.5 Application: Officer updates application status to In Verification', async () => {
      const res = await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          status: 'In Verification',
          remarks: 'Applicant documents verified by Revenue Sub-Registrar.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.application.status).toBe('In Verification');
    });

    test('5.6 Application: Phone query returns applicant submissions', async () => {
      const res = await request(app)
        .get('/api/applications?phone=%2B91%2097777%2066666');

      expect(res.statusCode).toBe(200);
      expect(res.body.applications.length).toBeGreaterThan(0);
      expect(res.body.applications[0].applicantPhone).toBe('+91 97777 66666');
    });
  });

  // =========================================================================
  // PHASE 6: HYPERLEDGER FABRIC BLOCKCHAIN & CRYPTOGRAPHIC VERIFICATION
  // =========================================================================
  describe('Phase 6: Hyperledger Fabric Smart Contract & Ledger Integrity', () => {
    test('6.1 Network Info: Channel topology, MSP identities, and Raft consensus are online', async () => {
      const res = await request(app).get('/api/blockchain/info');
      expect(res.statusCode).toBe(200);
      expect(res.body.channelId).toBe('janseva-channel');
      expect(res.body.chaincodeId).toBe('grievance_cc');
      expect(res.body.status).toBe('SYNCHRONIZED');
      expect(res.body.consensus).toContain('Raft');
      expect(res.body.peers.length).toBeGreaterThanOrEqual(3);
    });

    test('6.2 Genesis Block: Block #0 contains Genesis Orderer MSP configuration', async () => {
      const res = await request(app).get('/api/blockchain/blocks/0');
      expect(res.statusCode).toBe(200);
      expect(res.body.block.blockNumber).toBe(0);
      expect(res.body.block.previousBlockHash).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
      expect(res.body.block.transactions[0].fcn).toBe('InitLedger');
    });

    test('6.3 Block Chaining: Block list maintains sequential cryptographic hash integrity', async () => {
      const res = await request(app).get('/api/blockchain/blocks?limit=10&offset=0');
      expect(res.statusCode).toBe(200);
      expect(res.body.blocks.length).toBeGreaterThanOrEqual(2);

      const blocks = res.body.blocks;
      for (let i = 0; i < blocks.length - 1; i++) {
        expect(blocks[i].currentBlockHash).toMatch(/^0x[a-f0-9]{64}$/);
        expect(blocks[i].previousBlockHash).toMatch(/^0x[a-f0-9]{64}$/);
      }
    });

    test('6.4 Tx Verification: Cryptographic transaction verification confirms valid block insertion', async () => {
      expect(fabricTxId).toBeDefined();
      const res = await request(app).get(`/api/blockchain/verify/${fabricTxId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.txId.toLowerCase()).toBe(fabricTxId.toLowerCase());
      expect(res.body.channelId).toBe('janseva-channel');
      expect(res.body.hashIntegrityVerified).toBe(true);
    });

    test('6.5 On-Chain History: Grievance smart contract state transitions are auditable', async () => {
      const res = await request(app).get(`/api/blockchain/history/${createdGrievanceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.grievanceId).toBe(createdGrievanceId);
      expect(res.body.channelId).toBe('janseva-channel');
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.history)).toBe(true);
    });

    test('6.6 Tamper Detection: Non-existent transaction returns 404', async () => {
      const fakeTx = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
      const res = await request(app).get(`/api/blockchain/verify/${fakeTx}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.verified).toBe(false);
      expect(res.body.error).toBe('TRANSACTION_NOT_FOUND');
    });
  });

  // =========================================================================
  // PHASE 7: IPFS DECENTRALIZED STORAGE
  // =========================================================================
  describe('Phase 7: IPFS Document Storage & Content-Addressed Verification', () => {
    test('7.1 Upload: Pinned text document returns valid Base58 Qm CID', async () => {
      const content = 'Audited Evidence - Public Works Department Inspection - Ward 14';
      const base64 = 'data:text/plain;base64,' + Buffer.from(content).toString('base64');

      const res = await request(app)
        .post('/api/ipfs/upload')
        .send({
          fileContent: base64,
          filename: 'ward14_inspection.txt'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.cid).toBeDefined();
      expect(res.body.cid.startsWith('Qm')).toBe(true);
      expect(res.body.size).toBe(content.length);
      uploadedIpfsCid = res.body.cid;
    });

    test('7.2 Gateway Stream: Content retrieval streams bytes with exact ETag and MIME', async () => {
      const res = await request(app).get(`/api/ipfs/${uploadedIpfsCid}`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Audited Evidence - Public Works Department Inspection - Ward 14');
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.headers['etag']).toBe(`"${uploadedIpfsCid}"`);
    });

    test('7.3 Metadata: Content-addressed metadata returns SHA-256 and pin status', async () => {
      const res = await request(app).get(`/api/ipfs/${uploadedIpfsCid}/meta`);
      expect(res.statusCode).toBe(200);
      expect(res.body.cid).toBe(uploadedIpfsCid);
      expect(res.body.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(res.body.pinned).toBe(true);
    });

    test('7.4 Negative Case: Non-existent CID returns 404 CID_NOT_FOUND', async () => {
      const res = await request(app).get('/api/ipfs/QmNonExistentHash999999999999999999999999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('CID_NOT_FOUND');
    });
  });

  // =========================================================================
  // PHASE 8 & 9: OFFICER ROSTER & SLA MONITORING
  // =========================================================================
  describe('Phase 8 & 9: Officer Roster & SLA Monitoring', () => {
    test('8.1 Roster: GET /api/grievances/officers/roster returns active sector distribution', async () => {
      const res = await request(app).get('/api/grievances/officers/roster');
      expect(res.statusCode).toBe(200);
      expect(res.body.totalOfficers).toBeGreaterThan(0);
      expect(res.body.sectors.length).toBe(5);
      expect(res.body.departments.length).toBe(7);
      expect(Array.isArray(res.body.officers)).toBe(true);
    });
  });

  // =========================================================================
  // PHASE 10: CITIZEN COMMUNICATION & NOTIFICATIONS
  // =========================================================================
  describe('Phase 10: Statutory SMS & Interactive WhatsApp Webhooks', () => {
    test('10.1 Multi-Channel Dispatch: Test notification dispatches with DLT entity ID', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .send({
          phone: '+91 98765 43210',
          template: 'GRIEVANCE_RESOLVED',
          data: {
            id: createdGrievanceId || 'GRV-2026-8910',
            citizenName: 'Aarav Sharma',
            officerName: 'Er. Rajesh Varma'
          },
          channels: ['SMS', 'WHATSAPP']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.receipts).toHaveLength(2);
      expect(res.body.receipts[0].status).toBe('DELIVERED');
      expect(res.body.receipts[0].dltEntityId).toBe('DLT-GOV-IND-49201');
      expect(res.body.receipts[1].channel).toBe('WHATSAPP');
    });

    test('10.2 Dispatch Logs: GET /api/notifications returns statutory audit trail', async () => {
      const res = await request(app).get('/api/notifications?limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
      expect(res.body.logs[0].id).toMatch(/^NOTIF-/);
    });

    test('10.3 WhatsApp Webhook: STATUS command returns grievance state', async () => {
      const res = await request(app)
        .post('/api/webhook/whatsapp')
        .send({
          from: '+91 98765 43210',
          body: `STATUS ${createdGrievanceId || 'GRV-2026-8910'}`
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.replyMessage).toContain('JanSeva Redressal Status');
    });

    test('10.4 WhatsApp Webhook: HELP keyword returns emergency helpline numbers', async () => {
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
  });

  // =========================================================================
  // PHASE 12 & 14: SECURITY AUDIT & EDGE CASES
  // =========================================================================
  describe('Phase 12 & 14: Security Hardening & Edge Case Resilience', () => {
    test('12.1 SQL Injection Resistance: Query parameters handle quotation payloads safely', async () => {
      const injectionPayload = "'; DROP TABLE grievances; --";
      const res = await request(app)
        .get(`/api/grievances?department=${encodeURIComponent(injectionPayload)}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.grievances)).toBe(true);
    });

    test('12.2 XSS Resistance: HTML tags in grievance description are stored without execution', async () => {
      const xssPayload = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
      const res = await request(app)
        .post('/api/grievances')
        .send({
          title: 'Street Lighting Fault',
          category: 'Electrical & Infrastructure',
          department: 'Public Works & Infrastructure',
          description: xssPayload,
          location: 'Ward 8',
          priority: 'Medium',
          citizenName: 'Priya Sundaram',
          citizenPhone: '+91 98112 33445'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.grievance.description).toBe(xssPayload); // Retained safely as raw text
    });

    test('14.1 Route Not Found: Non-existent API route returns structured JSON 404, never HTML', async () => {
      const res = await request(app).get('/api/unknown/random/endpoint');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
      expect(res.headers['content-type']).toContain('application/json');
    });

    test('14.2 Empty Body: Empty POST body to auth login returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });
});

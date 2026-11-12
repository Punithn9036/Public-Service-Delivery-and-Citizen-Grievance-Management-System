// backend/tests/stage1_rbac_and_governance.test.js
// Stage 1 Verification: Strict Officer Department Isolation, Officer Field Actions, & Admin Governance Endpoints

const request = require('supertest');
const express = require('express');
const cors = require('cors');

const authRoutes = require('../src/routes/authRoutes');
const grievanceRoutes = require('../src/routes/grievanceRoutes');
const applicationRoutes = require('../src/routes/applicationRoutes');
const serviceRoutes = require('../src/routes/serviceRoutes');
const notificationRoutes = require('../src/routes/notificationRoutes');
const blockchainRoutes = require('../src/routes/blockchainRoutes');
const { adminRouter, advisoryRouter } = require('../src/routes/adminGovernanceRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/advisories', advisoryRouter);

describe('Stage 1 RBAC Isolation & Officer/Admin Governance Suite', () => {
  let waterOfficerToken = '';
  let publicWorksOfficerToken = '';
  let adminToken = '';

  let waterTicketId = '';
  let duplicateWaterTicketId = '';
  let publicWorksTicketId = '';
  let birthCertAppId = '';
  let waterConnAppId = '';
  let createdOfficerId = '';
  let createdAdvisoryId = '';

  beforeAll(async () => {
    const waterLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rajesh.varma@gov.in', password: 'Officer123!' });
    expect(waterLogin.statusCode).toBe(200);
    waterOfficerToken = waterLogin.body.token;

    const pwLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'vikram.singh@gov.in', password: 'Officer123!' });
    expect(pwLogin.statusCode).toBe(200);
    publicWorksOfficerToken = pwLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.controlroom@gov.in', password: 'Admin123!' });
    expect(adminLogin.statusCode).toBe(200);
    adminToken = adminLogin.body.token;

    // Seed department-specific test tickets & applications
    const gWater = await request(app).post('/api/grievances').send({
      title: 'Main Pipeline Rupture Sector 4',
      category: 'Water Supply',
      department: 'Water Supply & Sanitation',
      description: 'Major burst near Sector 4 tank',
      location: 'Sector 4 Tank',
      priority: 'High',
      citizenName: 'Test Citizen W',
      citizenPhone: '+91 90000 11111'
    });
    expect(gWater.statusCode).toBe(201);
    waterTicketId = gWater.body.grievance.id;

    const gWaterDup = await request(app).post('/api/grievances').send({
      title: 'Duplicate Main Pipeline Rupture Sector 4',
      category: 'Water Supply',
      department: 'Water Supply & Sanitation',
      description: 'Duplicate citizen complaint for Sector 4 tank rupture',
      location: 'Sector 4 Tank',
      priority: 'Medium',
      citizenName: 'Test Citizen Dup',
      citizenPhone: '+91 90000 11112'
    });
    expect(gWaterDup.statusCode).toBe(201);
    duplicateWaterTicketId = gWaterDup.body.grievance.id;

    const gPw = await request(app).post('/api/grievances').send({
      title: 'Broken Culvert Bridge Ward 9',
      category: 'Roads & Bridges',
      department: 'Public Works & Infrastructure',
      description: 'Road cave-in near Ward 9 junction',
      location: 'Ward 9 Junction',
      priority: 'Urgent',
      citizenName: 'Test Citizen PW',
      citizenPhone: '+91 90000 22222'
    });
    expect(gPw.statusCode).toBe(201);
    publicWorksTicketId = gPw.body.grievance.id;

    const birthApp = await request(app).post('/api/applications').send({
      serviceId: 'srv-1',
      applicantName: 'Neha Kulkarni',
      applicantPhone: '+91 91111 33333'
    });
    expect(birthApp.statusCode).toBe(201);
    birthCertAppId = birthApp.body.application.id;

    const waterApp = await request(app).post('/api/applications').send({
      serviceId: 'srv-2',
      applicantName: 'Suresh Nair',
      applicantPhone: '+91 91111 44444'
    });
    expect(waterApp.statusCode).toBe(201);
    waterConnAppId = waterApp.body.application.id;
  });

  describe('1. Strict Officer Department & Role Isolation', () => {
    test('GET /api/grievances scopes OFFICER strictly to own department', async () => {
      const res = await request(app)
        .get('/api/grievances')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.grievances.length).toBeGreaterThan(0);
      for (const g of res.body.grievances) {
        expect(g.department).toBe('Water Supply & Sanitation');
      }
      expect(res.body.grievances.some((g) => g.id === publicWorksTicketId)).toBe(false);
    });

    test('GET & PATCH /api/grievances/:id blocks cross-department OFFICER with 403 FORBIDDEN_DEPARTMENT', async () => {
      const getDenied = await request(app)
        .get(`/api/grievances/${publicWorksTicketId}`)
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(getDenied.statusCode).toBe(403);
      expect(getDenied.body.error).toBe('FORBIDDEN_DEPARTMENT');

      const patchDenied = await request(app)
        .patch(`/api/grievances/${publicWorksTicketId}/status`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({ nextStatus: 'Under Review', note: 'Attempted cross-dept edit' });
      expect(patchDenied.statusCode).toBe(403);
      expect(patchDenied.body.error).toBe('FORBIDDEN_DEPARTMENT');
    });

    test('GET & PATCH /api/applications enforces strict dept scoping (Water Officer CANNOT see/modify Birth Certificate)', async () => {
      const listRes = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.applications.some((a) => a.id === birthCertAppId)).toBe(false);
      expect(listRes.body.applications.some((a) => a.id === waterConnAppId)).toBe(true);

      const getDenied = await request(app)
        .get(`/api/applications/${birthCertAppId}`)
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(getDenied.statusCode).toBe(403);
      expect(getDenied.body.error).toBe('FORBIDDEN_DEPARTMENT');

      const patchDenied = await request(app)
        .patch(`/api/applications/${birthCertAppId}/status`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({ status: 'Approved', remarks: 'Trying to approve birth certificate from Water dept' });
      expect(patchDenied.statusCode).toBe(403);
      expect(patchDenied.body.error).toBe('FORBIDDEN_DEPARTMENT');

      // Same officer CAN request resubmission & verify docs on own-dept Water Connection
      const waterRes = await request(app)
        .patch(`/api/applications/${waterConnAppId}/status`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({
          status: 'Resubmission Required',
          resubmissionReason: 'Plot layout blueprint unclear',
          verifiedDocuments: ['Aadhaar Card']
        });
      expect(waterRes.statusCode).toBe(200);
      expect(waterRes.body.application.status).toBe('Resubmission Required');
      expect(waterRes.body.application.verifiedDocuments).toEqual(['Aadhaar Card']);
    });

    test('GET /api/grievances/officers/roster hides other officers details from OFFICER', async () => {
      const res = await request(app)
        .get('/api/grievances/officers/roster')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.scopedToSelf).toBe(true);
      expect(res.body.totalOfficers).toBe(1);
      expect(res.body.officers.length).toBe(1);
      expect(res.body.officers[0].department).toBe('Water Supply & Sanitation');
    });

    test('Blocks OFFICER from Blockchain block explorer, Global DLT/WhatsApp controls, and Admin analytics', async () => {
      const bRes = await request(app)
        .get('/api/blockchain/blocks')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(bRes.statusCode).toBe(403);
      expect(bRes.body.error).toBe('FORBIDDEN_ROLE');

      const nRes = await request(app)
        .get('/api/notifications/whatsapp-status')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(nRes.statusCode).toBe(403);
      expect(nRes.body.error).toBe('FORBIDDEN_ROLE');

      const aRes = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(aRes.statusCode).toBe(403);
    });
  });

  describe('2. New Officer Field Actions (Claim, Pending Info, Internal Note Privacy, IPFS Proof, Dept Transfer)', () => {
    test('Claim ticket, Pending Citizen Info with private internalNote stripped from citizen view, and Resolve with IPFS proof', async () => {
      const claimRes = await request(app)
        .post(`/api/grievances/${waterTicketId}/claim`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({ note: 'Claimed by Er. Rajesh Varma on morning shift.' });
      expect(claimRes.statusCode).toBe(200);
      expect(claimRes.body.grievance.status).toBe('Assigned');

      const clarRes = await request(app)
        .patch(`/api/grievances/${waterTicketId}/status`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({
          nextStatus: 'Pending Citizen Info',
          note: 'Please confirm flat number or nearest electric pole.',
          internalNote: 'Valve key damaged; awaiting contractor tool van at 2pm.'
        });
      expect(clarRes.statusCode).toBe(200);
      expect(clarRes.body.grievance.status).toBe('Pending Citizen Info');
      expect(clarRes.body.grievance.internalNotes.length).toBeGreaterThanOrEqual(1);

      // Citizen/public view MUST NOT expose internalNotes
      const publicGet = await request(app).get(`/api/grievances/${waterTicketId}`);
      expect(publicGet.statusCode).toBe(200);
      expect(publicGet.body.grievance.internalNotes).toBeUndefined();

      // Link duplicate to master before resolving master
      const linkRes = await request(app)
        .post(`/api/grievances/${duplicateWaterTicketId}/link-duplicate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ masterGrievanceId: waterTicketId });
      expect(linkRes.statusCode).toBe(200);
      expect(linkRes.body.duplicate.duplicateOf).toBe(waterTicketId);

      // Resolve master ticket with inline resolution IPFS proof upload -> cascades to linked duplicate!
      const resResolve = await request(app)
        .patch(`/api/grievances/${waterTicketId}/status`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({
          nextStatus: 'Resolved',
          note: 'Main valve gasket replaced and pressure restored.',
          resolutionFileContent: 'data:text/plain;base64,UmVzb2x1dGlvblByb29mUGhvdG8=',
          resolutionFileName: 'valve_repaired.txt'
        });
      expect(resResolve.statusCode).toBe(200);
      expect(resResolve.body.grievance.status).toBe('Resolved');
      expect(resResolve.body.grievance.resolutionIpfsCid).toBeTruthy();
      expect(resResolve.body.grievance.resolvedAt).toBeTruthy();

      const dupCheck = await request(app).get(`/api/grievances/${duplicateWaterTicketId}`);
      expect(dupCheck.statusCode).toBe(200);
      expect(dupCheck.body.grievance.status).toBe('Resolved');
    });

    test('Department transfer moves ticket & switches department authorization boundaries', async () => {
      const trfTicket = await request(app).post('/api/grievances').send({
        title: 'Road trench dug for water pipe not paved',
        category: 'Road Damage',
        department: 'Water Supply & Sanitation',
        description: 'Needs road resurfacing by Public Works',
        location: 'Ward 2 Cross',
        priority: 'Medium',
        citizenName: 'Meena R',
        citizenPhone: '+91 90000 55555'
      });
      const tid = trfTicket.body.grievance.id;

      const trfRes = await request(app)
        .post(`/api/grievances/${tid}/transfer`)
        .set('Authorization', `Bearer ${waterOfficerToken}`)
        .send({
          targetDepartment: 'Public Works & Infrastructure',
          reason: 'Pipeline sealed; hot-mix road restoration belongs to Public Works.'
        });
      expect(trfRes.statusCode).toBe(200);
      expect(trfRes.body.grievance.department).toBe('Public Works & Infrastructure');

      // Previous Water Supply officer now loses access (403)
      const waterDenied = await request(app)
        .get(`/api/grievances/${tid}`)
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(waterDenied.statusCode).toBe(403);

      // Target Public Works officer now gains access (200)
      const pwAllowed = await request(app)
        .get(`/api/grievances/${tid}`)
        .set('Authorization', `Bearer ${publicWorksOfficerToken}`);
      expect(pwAllowed.statusCode).toBe(200);
    });
  });

  describe('3. New Admin Governance Endpoints (Officer CRUD, Bulk Assign, Advisories, SLA, Analytics, Audit)', () => {
    test('Admin Officer CRUD: create, update status/dept, and verify audit log', async () => {
      const createRes = await request(app)
        .post('/api/admin/officers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Er. Kavita Deshmukh',
          roleTitle: 'Senior Revenue Officer',
          department: 'Revenue & Taxation',
          sector: 'Sector 2 (East Zone)',
          phone: '+91 98111 77889'
        });
      expect(createRes.statusCode).toBe(201);
      createdOfficerId = createRes.body.officer.id;

      const patchRes = await request(app)
        .patch(`/api/admin/officers/${createdOfficerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'On Leave', sector: 'Sector 3 (South Zone)' });
      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.body.officer.status).toBe('On Leave');
      expect(patchRes.body.officer.sector).toBe('Sector 3 (South Zone)');

      const listRes = await request(app)
        .get('/api/admin/officers')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.officers.some((o) => o.id === createdOfficerId)).toBe(true);
    });

    test('Admin Bulk Assign updates active queue & writes audit trail', async () => {
      const bulkRes = await request(app)
        .post('/api/grievances/bulk-assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grievanceIds: [publicWorksTicketId],
          officerName: 'Ananya Sen',
          note: 'Priority structural audit assignment'
        });
      expect(bulkRes.statusCode).toBe(200);
      expect(bulkRes.body.updatedCount).toBe(1);
    });

    test('Admin Civic Advisories, SLA Policy CRUD, Services Update, Analytics & Audit Logs work end-to-end', async () => {
      const advCreate = await request(app)
        .post('/api/advisories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Scheduled Water Valve Maintenance',
          message: 'Low pressure expected in Sector 4 between 14:00-17:00 IST.',
          department: 'Water Supply & Sanitation',
          severity: 'warning'
        });
      expect(advCreate.statusCode).toBe(201);
      createdAdvisoryId = advCreate.body.advisory.id;

      // Water Supply officer sees Water advisory; Public Works officer does not see Water-only advisory
      const waterAdv = await request(app)
        .get('/api/advisories')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(waterAdv.body.advisories.some((a) => a.id === createdAdvisoryId)).toBe(true);

      const pwAdv = await request(app)
        .get('/api/advisories')
        .set('Authorization', `Bearer ${publicWorksOfficerToken}`);
      expect(pwAdv.body.advisories.some((a) => a.id === createdAdvisoryId)).toBe(false);

      // SLA Policies PUT & Officer-scoped GET
      const slaPut = await request(app)
        .put('/api/admin/sla-policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ department: 'Water Supply & Sanitation', targetDays: 2, warningHours: 24 });
      expect(slaPut.statusCode).toBe(200);
      expect(slaPut.body.policy.targetDays).toBe(2);

      const officerSla = await request(app)
        .get('/api/admin/sla-policies')
        .set('Authorization', `Bearer ${waterOfficerToken}`);
      expect(officerSla.statusCode).toBe(200);
      expect(officerSla.body.policies.every((p) => p.department === 'Water Supply & Sanitation')).toBe(true);

      // Real-time analytics
      const analyticsRes = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(analyticsRes.statusCode).toBe(200);
      expect(analyticsRes.body.departmentBreakdown.length).toBeGreaterThanOrEqual(7);
      expect(typeof analyticsRes.body.overallMttrHours).toBe('number');
      expect(Array.isArray(analyticsRes.body.wardHotspots)).toBe(true);

      // Audit logs
      const auditRes = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(auditRes.statusCode).toBe(200);
      expect(auditRes.body.logs.some((l) => l.action === 'CREATE_OFFICER')).toBe(true);
      expect(auditRes.body.logs.some((l) => l.action === 'BULK_ASSIGN_GRIEVANCES')).toBe(true);
    });
  });
});

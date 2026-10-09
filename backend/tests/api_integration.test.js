// backend/tests/api_integration.test.js
// Comprehensive API Integration Test Suite for Phase 1 Endpoints
const request = require('supertest');
const express = require('express');

const authRoutes = require('../src/routes/authRoutes');
const grievanceRoutes = require('../src/routes/grievanceRoutes');
const applicationRoutes = require('../src/routes/applicationRoutes');
const serviceRoutes = require('../src/routes/serviceRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);

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

});

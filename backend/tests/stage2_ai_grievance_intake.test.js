// backend/tests/stage2_ai_grievance_intake.test.js
// Stage 2 Verification: Voice/Audio Slot Extraction, GPS Photo IPFS Upload, & Auto-Grievance Filing

const request = require('supertest');
const express = require('express');
const cors = require('cors');

const aiRoutes = require('../src/routes/aiRoutes');
const ipfsRoutes = require('../src/routes/ipfsRoutes');
const grievanceRoutes = require('../src/routes/grievanceRoutes');
const { extractGrievanceFromText } = require('../utils/aiGrievanceExtractor');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/api/ai', aiRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/grievances', grievanceRoutes);

describe('Stage 2 AI Voice & GPS Photo Auto-Grievance Intake', () => {
  test('Unit: classifies civic problem descriptions into canonical municipal departments & priority', () => {
    const water = extractGrievanceFromText({
      transcript: 'Burst drinking water pipeline flooding near Central Gate urgent please help',
      location: 'Yelahanka New Town, Bengaluru 560064'
    });
    expect(water.intent).toBe('AUTO_GRIEVANCE');
    expect(water.department).toBe('Water Supply & Sanitation');
    expect(water.category).toBe('Water & Drainage');
    expect(water.priority).toBe('Urgent');
    expect(water.landmarkHint.toLowerCase()).toContain('central gate');

    const road = extractGrievanceFromText({
      transcript: 'Huge pothole on main road breaking bikes for three days'
    });
    expect(road.department).toBe('Public Works & Infrastructure');
    expect(road.priority).toBe('High');

    const light = extractGrievanceFromText({
      transcript: 'Live wire sparking from streetlight pole near market shock danger'
    });
    expect(light.department).toBe('Electrical & Infrastructure');
    expect(light.priority).toBe('Urgent');

    const waste = extractGrievanceFromText({
      transcript: 'Uncollected garbage dump smelling foul behind primary school'
    });
    expect(waste.department).toBe('Health & Hygiene');
    expect(waste.priority).toBe('High');

    const tax = extractGrievanceFromText({
      transcript: 'Property tax assessment and e-khata mutation pending'
    });
    expect(tax.department).toBe('Revenue & Taxation');

    const trade = extractGrievanceFromText({
      transcript: 'Unlicensed commercial vendor shop blocking footpath in market'
    });
    expect(trade.department).toBe('Commercial & Trade Licensing');

    const park = extractGrievanceFromText({
      transcript: 'Fallen tree branch blocking park gate and construction debris'
    });
    expect(park.department).toBe('Town Planning & Environment');
  });

  test('Unit: extracts inline spoken Indian mobile number and confirmation/cancel intents', () => {
    const withPhone = extractGrievanceFromText({
      transcript: 'Water leak on 4th cross my phone is 9876543210'
    });
    expect(withPhone.citizenPhone).toBe('+91 98765 43210');

    const confirm = extractGrievanceFromText({
      transcript: 'Yes confirm and submit',
      existingDraft: { active: true, department: 'Water Supply & Sanitation' }
    });
    expect(confirm.intent).toBe('CONFIRM');

    const cancel = extractGrievanceFromText({
      transcript: 'Cancel discard complaint',
      existingDraft: { active: true }
    });
    expect(cancel.intent).toBe('CANCEL');
  });

  test('GET /api/ai/capabilities reports audio support & all 7 departments', async () => {
    const res = await request(app).get('/api/ai/capabilities');
    expect(res.statusCode).toBe(200);
    expect(res.body.audioUploadSupported).toBe(true);
    expect(res.body.deterministicFallback).toBe(true);
    expect(res.body.supportedLanguages).toBe(13);
    expect(res.body.supportedDepartments).toContain('Water Supply & Sanitation');
    expect(res.body.supportedDepartments).toContain('Electrical & Infrastructure');
  });

  test('POST /api/ai/extract-grievance validates empty input cleanly', async () => {
    const res = await request(app)
      .post('/api/ai/extract-grievance')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('NO_INPUT_PROVIDED');
  });

  test('POST /api/ai/extract-grievance extracts full draft from recorded audio clip + live speech transcript + GPS location', async () => {
    const fakeAudioBuffer = Buffer.from('WEBM_RECORDED_VOICE_NOTE_BYTES_FOR_TEST');

    const res = await request(app)
      .post('/api/ai/extract-grievance')
      .attach('audio', fakeAudioBuffer, { filename: 'voice-complaint.webm', contentType: 'audio/webm' })
      .field('transcript', 'Overflowing sewage drain near Metro Gate 2 urgent foul smell')
      .field('location', 'Indiranagar 100ft Road, Bengaluru 560038')
      .field('lang', 'en')
      .field('citizenName', 'Ananya Citizen')
      .field('citizenPhone', '+91 98765 11111');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.audioReceived).toBe(true);
    expect(res.body.audioBytes).toBe(fakeAudioBuffer.length);
    expect(res.body.needsTranscriptInput).toBe(false);
    expect(res.body.readyToSubmit).toBe(true);
    expect(res.body.missingFields).toEqual([]);
    expect(res.body.extracted.department).toBe('Water Supply & Sanitation');
    expect(res.body.extracted.priority).toBe('Urgent');
    expect(res.body.extracted.location).toBe('Indiranagar 100ft Road, Bengaluru 560038');
  });

  test('POST /api/ai/extract-grievance flags audio-only upload when cloud STT key is unset without hallucinating', async () => {
    const originalGemini = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const fakeAudioBuffer = Buffer.from('RAW_SILENT_AUDIO_BLOB_WITHOUT_TRANSCRIPT');
    const res = await request(app)
      .post('/api/ai/extract-grievance')
      .attach('audio', fakeAudioBuffer, { filename: 'voice-only.webm', contentType: 'audio/webm' })
      .field('location', 'Ward 12 Main Road, Bengaluru');

    if (originalGemini) process.env.GEMINI_API_KEY = originalGemini;

    expect(res.statusCode).toBe(200);
    expect(res.body.audioReceived).toBe(true);
    expect(res.body.needsTranscriptInput).toBe(true);
    expect(res.body.readyToSubmit).toBe(false);
    expect(res.body.missingFields).toContain('description');
  });

  test('End-to-End: IPFS photo upload + Voice extraction -> Auto-registers authoritative grievance ticket', async () => {
    // 1. Pin GPS photo evidence to IPFS
    const fakeJpg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const ipfsRes = await request(app)
      .post('/api/ipfs/upload')
      .attach('file', fakeJpg, { filename: 'gps-map-camera-pothole.jpg', contentType: 'image/jpeg' });
    expect(ipfsRes.statusCode).toBe(201);
    expect(ipfsRes.body.cid).toBeTruthy();

    // 2. Extract grievance fields from recorded audio + location
    const extractRes = await request(app)
      .post('/api/ai/extract-grievance')
      .send({
        transcript: 'Deep road pothole near Presidency Gate causing accidents',
        location: 'Dibbur, Yelahanka, Karnataka 560064',
        citizenName: 'Ravi Kumar',
        citizenPhone: '+91 98450 22334'
      });
    expect(extractRes.statusCode).toBe(200);
    expect(extractRes.body.readyToSubmit).toBe(true);

    const ext = extractRes.body.extracted;

    // 3. Submit grievance to ledger gateway
    const submitRes = await request(app)
      .post('/api/grievances')
      .send({
        title: ext.title,
        category: ext.category,
        department: ext.department,
        priority: ext.priority,
        description: ext.description,
        location: ext.location,
        sector: 'Sector 1 (North Zone)',
        landmark: 'GPS Map Camera (13.168309° N, 77.533026° E)',
        citizenName: ext.citizenName,
        citizenPhone: ext.citizenPhone,
        ipfsDocumentCid: ipfsRes.body.cid,
        intakeChannel: 'AI_VOICE_CHATBOT'
      });

    expect(submitRes.statusCode).toBe(201);
    expect(submitRes.body.id).toMatch(/^GRV-2026-/);
    expect(submitRes.body.fabricTxId).toBeTruthy();
    expect(submitRes.body.grievance).toBeTruthy();
    expect(submitRes.body.grievance.department).toBe('Public Works & Infrastructure');
    expect(submitRes.body.grievance.ipfsDocumentCid).toBe(ipfsRes.body.cid);
    expect(submitRes.body.grievance.intakeChannel).toBe('AI_VOICE_CHATBOT');
    expect(submitRes.body.grievance.sector).toBe('Sector 1 (North Zone)');

    // 4. Verify persisted ticket is queryable via GET /api/grievances/:id with intake metadata
    const getRes = await request(app).get(`/api/grievances/${submitRes.body.id}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.grievance).toBeTruthy();
    expect(getRes.body.grievance.id).toBe(submitRes.body.id);
    expect(getRes.body.grievance.intakeChannel).toBe('AI_VOICE_CHATBOT');
    expect(getRes.body.grievance.sector).toBe('Sector 1 (North Zone)');
  });
});

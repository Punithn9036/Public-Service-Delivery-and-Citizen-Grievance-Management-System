// backend/src/controllers/grievanceController.js
// Grievance Controller & State Machine Enforcement Engine with DB and Fabric integration

const GrievanceModel = require('../../models/grievance');
const FabricClient = require('../../fabric/client');
const { uploadToIPFS } = require('../../utils/ipfs');

// Initial Fallback In-Memory Grievance Ledger in case DB is warming up
let grievancesStore = [
  {
    id: 'GRV-2026-8910',
    title: 'Damaged Drainage Overflow on Main Market Road',
    category: 'Sanitation & Waste Management',
    department: 'Water Supply & Sanitation',
    description: 'Raw sewage and drainage water is overflowing near Shop #42 on Main Market Road.',
    location: 'Sector 4, Main Market Road, Ward 12',
    landmark: 'Opposite Central Pharmacy',
    priority: 'Urgent',
    status: 'In Progress',
    citizenName: 'Aarav Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'aarav.sharma@example.com',
    assignedOfficer: 'Er. Rajesh Varma (Senior Sanitation Engineer)',
    assignedOfficerContact: '+91 94433 11223',
    ipfsDocumentCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    fabricTxId: '0x8f7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a',
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Submitted', officerName: 'System Gateway', note: 'Grievance lodged online via JanSeva Citizen Portal.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Under Review', officerName: 'Control Room Officer', note: 'Validated and categorized under Water Supply & Sanitation.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Assigned', officerName: 'Er. Rajesh Varma', note: 'Assigned to Ward 12 Sanitation Team lead.', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { status: 'In Progress', officerName: 'Er. Rajesh Varma', note: 'Dredging truck dispatched to site.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
    ],
    feedback: null
  },
  {
    id: 'GRV-2026-8904',
    title: 'Non-Functional Street Lights along Green Park Boulevard',
    category: 'Electrical & Infrastructure',
    department: 'Public Works & Infrastructure',
    description: 'Over 8 consecutive streetlights have been completely dark for 5 days.',
    location: 'Green Park Boulevard, Block B, Ward 8',
    landmark: 'Near Community Park Gate 2',
    priority: 'High',
    status: 'Assigned',
    citizenName: 'Priya Sundaram',
    citizenPhone: '+91 98112 33445',
    citizenEmail: 'priya.sundaram@example.com',
    assignedOfficer: 'Vikram Singh (Assistant Electrical Inspector)',
    assignedOfficerContact: '+91 98700 55443',
    ipfsDocumentCid: 'QmPZ9GcCEgudBwbZMuMVLK72vedxjQkDDP1mXWo6uco',
    fabricTxId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Submitted', officerName: 'System Gateway', note: 'Grievance lodged online.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Under Review', officerName: 'Control Room Officer', note: 'Categorized under Municipal Electrical Grid.', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
      { status: 'Assigned', officerName: 'Vikram Singh', note: 'Field technician team dispatched for LED replacement.', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() }
    ],
    feedback: null
  }
];

// Valid State Machine Transitions Map
const VALID_TRANSITIONS = {
  'Submitted': ['Under Review'],
  'Under Review': ['Assigned', 'Rejected'],
  'Assigned': ['In Progress', 'Under Review'],
  'In Progress': ['Resolved', 'Under Review'],
  'Resolved': ['Under Review'], // Citizen Re-open action
  'Rejected': [] // Terminal state
};

// SLA Calculation Helper (hours based on priority)
const calculateSlaHours = (priority) => {
  switch (priority) {
    case 'Urgent': return 24;
    case 'High': return 48;
    case 'Medium': return 72;
    case 'Low': return 168; // 7 days
    default: return 72;
  }
};

/**
 * Get all grievances (with status, priority, department filtering)
 */
const getAllGrievances = async (req, res) => {
  try {
    const { status, priority, department, search, phone } = req.query;

    let results = [];
    try {
      results = await GrievanceModel.findAll({
        department: department && department !== 'All' ? department : null,
        status: status && status !== 'All' ? status : null,
        citizenPhone: phone || null
      });
      if (results.length === 0 && grievancesStore.length > 0) {
        results = [...grievancesStore];
      }
    } catch (e) {
      results = [...grievancesStore];
    }

    if (priority && priority !== 'All') {
      results = results.filter(g => g.priority.toLowerCase() === priority.toLowerCase());
    }

    if (department && department !== 'All') {
      results = results.filter(g => g.department.toLowerCase() === department.toLowerCase());
    }

    if (status && status !== 'All') {
      results = results.filter(g => g.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(g => 
        (g.id && g.id.toLowerCase().includes(q)) ||
        (g.title && g.title.toLowerCase().includes(q)) ||
        (g.category && g.category.toLowerCase().includes(q)) ||
        (g.location && g.location.toLowerCase().includes(q))
      );
    }

    return res.json({
      count: results.length,
      grievances: results
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Get single grievance details by Tracking ID
 */
const getGrievanceById = async (req, res) => {
  try {
    const { id } = req.params;
    let grievance;

    try {
      grievance = await GrievanceModel.findById(id);
    } catch (e) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Grievance ticket '${id}' was not found in the governance ledger.`
      });
    }

    return res.json({ grievance });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Create a new Citizen Grievance Ticket
 */
const createGrievance = async (req, res) => {
  try {
    const { title, category, department, description, location, landmark, priority, citizenName, citizenPhone, citizenEmail, ipfsDocumentCid, fileContent, fileName } = req.body;

    if (!title || !category || !department || !description || !location || !citizenName || !citizenPhone) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'title, category, department, description, location, citizenName, and citizenPhone are required.'
      });
    }

    let finalCid = ipfsDocumentCid || null;
    if (fileContent) {
      finalCid = await uploadToIPFS(fileContent, fileName || 'document.pdf');
    }

    const assignedPriority = priority && ['Low', 'Medium', 'High', 'Urgent'].includes(priority) ? priority : 'Medium';
    const slaHours = calculateSlaHours(assignedPriority);
    const newId = `GRV-2026-${Math.floor(8000 + Math.random() * 1900)}`;

    const fabricResult = await FabricClient.submitTransaction('CreateGrievance', [
      newId,
      department,
      assignedPriority,
      citizenPhone
    ]);

    const grievanceData = {
      id: newId,
      title,
      category,
      department,
      description,
      location,
      landmark: landmark || '',
      priority: assignedPriority,
      status: 'Submitted',
      citizenName,
      citizenPhone,
      citizenEmail: citizenEmail || '',
      assignedOfficer: 'Control Room Officer (Pending Dispatch)',
      assignedOfficerContact: '+91 1800-425-GOV',
      ipfsDocumentCid: finalCid,
      fabricTxId: fabricResult.txId,
      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString()
    };

    let createdGrievance;
    try {
      createdGrievance = await GrievanceModel.create(grievanceData);
    } catch (dbErr) {
      // Fallback
      createdGrievance = {
        ...grievanceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            status: 'Submitted',
            officerName: 'System Gateway',
            note: 'Grievance lodged online via JanSeva Citizen Portal.',
            fabricTxId: fabricResult.txId,
            timestamp: new Date().toISOString()
          }
        ],
        feedback: null
      };
      grievancesStore.unshift(createdGrievance);
    }

    return res.status(201).json({
      message: 'Grievance ticket created successfully.',
      id: newId,
      fabricTxId: fabricResult.txId,
      grievance: createdGrievance
    });

  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Update Grievance Status with State Machine Rule Validation
 */
const updateGrievanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { nextStatus, officerName, officerContact, note } = req.body;

    let grievance;
    try {
      grievance = await GrievanceModel.findById(id);
    } catch (e) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Grievance ticket '${id}' not found.` });
    }

    const currentStatus = grievance.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    // Enforce State Machine Rule
    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        error: 'INVALID_STATE_TRANSITION',
        message: `Invalid state transition from '${currentStatus}' to '${nextStatus}'. Allowed next transitions: [${allowedNext.join(', ')}].`
      });
    }

    const fabricResult = await FabricClient.submitTransaction('UpdateGrievanceStatus', [
      id,
      nextStatus,
      officerName || 'Nodal Officer',
      note || ''
    ]);

    let updatedGrievance;
    try {
      updatedGrievance = await GrievanceModel.updateStatus(id, {
        nextStatus,
        officerName: officerName || req.user?.fullName || 'Nodal Officer',
        officerContact,
        note: note || `Status updated to ${nextStatus}.`,
        fabricTxId: fabricResult.txId
      });
    } catch (dbErr) {
      grievance.status = nextStatus;
      if (officerName) grievance.assignedOfficer = officerName;
      grievance.fabricTxId = fabricResult.txId;
      grievance.updatedAt = new Date().toISOString();
      grievance.timeline.push({
        status: nextStatus,
        officerName: officerName || req.user?.fullName || 'Nodal Officer',
        note: note || `Status updated to ${nextStatus}.`,
        fabricTxId: fabricResult.txId,
        timestamp: new Date().toISOString()
      });
      updatedGrievance = grievance;
    }

    return res.json({
      message: `Grievance status updated to '${nextStatus}'.`,
      fabricTxId: fabricResult.txId,
      grievance: updatedGrievance
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Citizen Feedback Submission for Resolved Grievance
 */
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    let grievance;
    try {
      grievance = await GrievanceModel.findById(id);
    } catch (e) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Grievance ticket '${id}' not found.` });
    }

    if (grievance.status !== 'Resolved') {
      return res.status(400).json({
        error: 'FEEDBACK_NOT_ALLOWED',
        message: 'Feedback can only be submitted for Resolved grievances.'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Rating must be an integer between 1 and 5.' });
    }

    try {
      await GrievanceModel.submitFeedback(id, { rating: parseInt(rating, 10), comment });
    } catch (e) {
      grievance.feedback = {
        rating: parseInt(rating, 10),
        comment: comment || '',
        submittedAt: new Date().toISOString()
      };
    }

    return res.json({
      message: 'Citizen feedback recorded successfully.',
      feedback: { rating: parseInt(rating, 10), comment: comment || '', submittedAt: new Date().toISOString() }
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Citizen Re-open Ticket Action
 */
const reopenGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    let grievance;
    try {
      grievance = await GrievanceModel.findById(id);
    } catch (e) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      grievance = grievancesStore.find(g => g.id.toUpperCase() === id.toUpperCase());
    }

    if (!grievance) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Grievance ticket '${id}' not found.` });
    }

    if (grievance.status !== 'Resolved') {
      return res.status(400).json({
        error: 'REOPEN_NOT_ALLOWED',
        message: 'Only Resolved tickets can be re-opened for escalation.'
      });
    }

    const fabricResult = await FabricClient.submitTransaction('ReopenGrievance', [
      id,
      reason || 'Incomplete resolution'
    ]);

    let updated;
    try {
      updated = await GrievanceModel.updateStatus(id, {
        nextStatus: 'Under Review',
        officerName: 'Citizen Escalation Gateway',
        note: `Ticket Re-opened by citizen. Reason: ${reason || 'Incomplete field resolution.'}`,
        fabricTxId: fabricResult.txId
      });
    } catch (e) {
      grievance.status = 'Under Review';
      grievance.updatedAt = new Date().toISOString();
      grievance.timeline.push({
        status: 'Under Review',
        officerName: 'Citizen Escalation Gateway',
        note: `Ticket Re-opened by citizen. Reason: ${reason || 'Incomplete field resolution.'}`,
        fabricTxId: fabricResult.txId,
        timestamp: new Date().toISOString()
      });
      updated = grievance;
    }

    return res.json({
      message: 'Grievance ticket re-opened and escalated to Nodal Officer.',
      grievance: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getAllGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievanceStatus,
  submitFeedback,
  reopenGrievance
};

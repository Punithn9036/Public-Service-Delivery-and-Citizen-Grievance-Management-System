// backend/src/controllers/grievanceController.js
// Grievance Controller & State Machine Enforcement Engine with DB and Fabric integration

const GrievanceModel = require('../../models/grievance');
const FabricClient = require('../../fabric/client');
const { uploadToIPFS } = require('../../utils/ipfs');
const { sendNotification } = require('../../utils/notifications');
const { allocateNextOfficer, releaseOfficerFromTicket, getRosterStatus } = require('../../utils/officerDispatch');
const db = require('../db');
const { isSameDepartment } = require('../middleware/departmentAuth');
const { appendAuditLog, findOfficer } = require('../db/governanceStore');

const sanitizeGrievanceForRole = (grievance, reqUser) => {
  if (!grievance) return grievance;
  if (reqUser && (reqUser.role === 'ADMIN' || reqUser.role === 'OFFICER')) {
    return grievance;
  }
  const { internalNotes, ...citizenSafe } = grievance;
  return citizenSafe;
};

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
  'Submitted': ['Under Review', 'Escalated'],
  'Under Review': ['Assigned', 'Pending Citizen Info', 'Rejected', 'Escalated'],
  'Assigned': ['In Progress', 'Pending Citizen Info', 'Under Review', 'Escalated'],
  'In Progress': ['Resolved', 'Pending Citizen Info', 'Under Review', 'Escalated'],
  'Pending Citizen Info': ['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Rejected'],
  'Escalated': ['In Progress', 'Pending Citizen Info', 'Resolved', 'Under Review'],
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

    if (req.user && req.user.role === 'OFFICER') {
      results = results.filter((g) => isSameDepartment(req.user.department, g.department));
    }
    results = results.map((g) => sanitizeGrievanceForRole(g, req.user));

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

    if (req.user && req.user.role === 'OFFICER' && !isSameDepartment(req.user.department, grievance.department)) {
      return res.status(403).json({
        error: 'FORBIDDEN_DEPARTMENT',
        message: `Access denied: Officers in '${req.user.department}' cannot inspect grievances owned by '${grievance.department}'.`
      });
    }
    grievance = sanitizeGrievanceForRole(grievance, req.user);
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
      try {
        const ipfsRes = await uploadToIPFS(fileContent, fileName || 'evidence.jpg');
        finalCid = (ipfsRes && ipfsRes.cid) ? ipfsRes.cid : (typeof ipfsRes === 'string' ? ipfsRes : finalCid);
      } catch (e) {}
    }

    const assignedPriority = priority && ['Low', 'Medium', 'High', 'Urgent'].includes(priority) ? priority : 'Medium';
    const slaHours = calculateSlaHours(assignedPriority);
    const newId = `GRV-2026-${Math.floor(8000 + Math.random() * 1900)}`;

    // Automated Sector & Department Round-Robin Officer Allocation
    const sectorInput = req.body.sector || '';
    const assignedOfficerInfo = allocateNextOfficer(department, sectorInput || location, newId);

    const initialOfficer = assignedOfficerInfo ? assignedOfficerInfo.officerName : 'Control Room Officer (Pending Dispatch)';
    const initialOfficerContact = assignedOfficerInfo ? assignedOfficerInfo.officerContact : '+91 1800-425-GOV';
    const initialStatus = 'Submitted';

    const fabricResult = await FabricClient.submitTransaction('RecordGrievanceState', [
      newId,
      department,
      assignedPriority,
      initialStatus,
      initialOfficer,
      finalCid || '',
      `Grievance ticket lodged and auto-allocated to ${initialOfficer} (${assignedOfficerInfo?.sector || 'Zone Desk'}).`
    ]);

    const grievanceData = {
      id: newId,
      title,
      category,
      department,
      description,
      location,
      sector: assignedOfficerInfo?.sector || sectorInput || 'Sector 1 (North Zone)',
      landmark: landmark || '',
      priority: assignedPriority,
      status: initialStatus,
      intakeChannel: req.body.intakeChannel || 'WEB_PORTAL',
      citizenName,
      citizenPhone,
      citizenEmail: citizenEmail || '',
      assignedOfficer: initialOfficer,
      assignedOfficerContact: initialOfficerContact,
      ipfsDocumentCid: finalCid,
      fabricTxId: fabricResult.txId,
      fabricBlockNumber: fabricResult.blockNumber,
      fabricBlockHash: fabricResult.blockHash,
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
            fabricBlockNumber: fabricResult.blockNumber,
            fabricBlockHash: fabricResult.blockHash,
            timestamp: new Date().toISOString()
          }
        ],
        feedback: null
      };
      grievancesStore.unshift(createdGrievance);
    }

    // Statutory Citizen Notification Dispatch (SMS & WhatsApp via National DLT Gateway)
    try {
      await sendNotification({
        phone: citizenPhone,
        template: 'GRIEVANCE_LODGED',
        data: {
          id: newId,
          title,
          category,
          location,
          department,
          priority: assignedPriority,
          slaHours
        }
      });
    } catch (notifErr) {
      console.warn('[Notification Notice] Citizen alert dispatch warning:', notifErr.message);
    }

    return res.status(201).json({
      message: 'Grievance ticket created successfully.',
      id: newId,
      fabricTxId: fabricResult.txId,
      fabricBlockNumber: fabricResult.blockNumber,
      fabricBlockHash: fabricResult.blockHash,
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
    let { nextStatus, officerName, officerContact, note, internalNote, resolutionIpfsCid, resolutionFileContent, resolutionFileName, clarificationQuestion } = req.body;

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

    if (req.user && req.user.role === 'OFFICER' && !isSameDepartment(req.user.department, grievance.department)) {
      return res.status(403).json({
        error: 'FORBIDDEN_DEPARTMENT',
        message: `Access denied: Officers in '${req.user.department}' cannot update grievances owned by '${grievance.department}'.`
      });
    }
    const previousOfficer = grievance.assignedOfficer;
    if (req.user && req.user.role === 'OFFICER') {
      const isUnassigned = !previousOfficer || previousOfficer.includes('Pending Dispatch');
      if (!isUnassigned && officerName && officerName !== previousOfficer && officerName !== req.user.fullName) {
        officerName = previousOfficer;
      }
    }
    if (!note && clarificationQuestion) {
      note = clarificationQuestion;
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

    let finalResolutionCid = resolutionIpfsCid || grievance.resolutionIpfsCid || null;
    if (resolutionFileContent && !resolutionIpfsCid) {
      try {
        const proofRes = await uploadToIPFS(resolutionFileContent, resolutionFileName || 'resolution_proof.jpg');
        finalResolutionCid = proofRes.cid;
      } catch (e) {
        console.warn('Resolution IPFS proof upload failed:', e.message);
      }
    }

    const fabricResult = await FabricClient.submitTransaction('RecordGrievanceState', [
      id,
      grievance.department || 'General Administration',
      grievance.priority || 'Medium',
      nextStatus,
      officerName || req.user?.fullName || 'Nodal Officer',
      grievance.ipfsDocumentCid || '',
      note || `Status updated to ${nextStatus}.`
    ]);

    let updatedGrievance;
    try {
      updatedGrievance = await GrievanceModel.updateStatus(id, {
        nextStatus,
        officerName: officerName || req.user?.fullName || 'Nodal Officer',
        officerContact,
        note: note || `Status updated to ${nextStatus}.`,
        fabricTxId: fabricResult.txId,
        fabricBlockNumber: fabricResult.blockNumber,
        fabricBlockHash: fabricResult.blockHash
      });
    } catch (dbErr) {
      grievance.status = nextStatus;
      if (officerName) grievance.assignedOfficer = officerName;
      grievance.fabricTxId = fabricResult.txId;
      grievance.fabricBlockNumber = fabricResult.blockNumber;
      grievance.fabricBlockHash = fabricResult.blockHash;
      grievance.updatedAt = new Date().toISOString();
      grievance.timeline.push({
        status: nextStatus,
        officerName: officerName || req.user?.fullName || 'Nodal Officer',
        note: note || `Status updated to ${nextStatus}.`,
        fabricTxId: fabricResult.txId,
        fabricBlockNumber: fabricResult.blockNumber,
        fabricBlockHash: fabricResult.blockHash,
        timestamp: new Date().toISOString()
      });
      updatedGrievance = grievance;
    }

    // Round-Robin Queue: If status is Resolved or Rejected, release officer back to available queue
    if (nextStatus === 'Resolved' || nextStatus === 'Rejected') {
      try {
        releaseOfficerFromTicket(id);
      } catch (relErr) {
        console.warn('[Dispatch Warning] Could not release officer:', relErr.message);
      }
    }

    // Statutory Citizen Notification Dispatch (SMS & WhatsApp)
    try {
      if (finalResolutionCid) {
      updatedGrievance.resolutionIpfsCid = finalResolutionCid;
    }
    if (internalNote && String(internalNote).trim()) {
      if (!Array.isArray(updatedGrievance.internalNotes)) updatedGrievance.internalNotes = [];
      updatedGrievance.internalNotes.push({
        id: `NOTE-${Date.now()}`,
        author: req.user?.email || 'staff@gov.in',
        role: req.user?.role || 'OFFICER',
        note: String(internalNote).trim(),
        timestamp: new Date().toISOString()
      });
    }
    if (nextStatus === 'Resolved') {
      updatedGrievance.resolvedAt = updatedGrievance.resolvedAt || new Date().toISOString();
      if (Array.isArray(updatedGrievance.linkedDuplicates) && updatedGrievance.linkedDuplicates.length > 0) {
        for (const dupId of updatedGrievance.linkedDuplicates) {
          const dupTicket = await GrievanceModel.findById(dupId);
          if (dupTicket && dupTicket.status !== 'Resolved') {
            dupTicket.status = 'Resolved';
            dupTicket.resolvedAt = updatedGrievance.resolvedAt;
            if (finalResolutionCid) dupTicket.resolutionIpfsCid = finalResolutionCid;
            dupTicket.updatedAt = new Date().toISOString();
            if (!Array.isArray(dupTicket.timeline)) dupTicket.timeline = [];
            dupTicket.timeline.push({
              status: 'Resolved',
              officerName: updatedGrievance.assignedOfficer || 'System Cascade',
              note: `Auto-resolved alongside linked Master Ticket ${id}.`,
              timestamp: new Date().toISOString()
            });
            releaseOfficerFromTicket(dupId);
          }
        }
      }
    }
    if (req.user?.role === 'ADMIN') {
      appendAuditLog({
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: officerName && officerName !== previousOfficer ? 'ADMIN_GRIEVANCE_REASSIGNED' : 'ADMIN_GRIEVANCE_UPDATED',
        targetType: 'GRIEVANCE',
        targetId: id,
        details: `Transitioned ${currentStatus} -> ${nextStatus}${officerName ? ` (Officer: ${officerName})` : ''}`
      });
    }
    if (typeof db.saveStore === 'function') {
      db.saveStore();
    }

    const recipientPhone = updatedGrievance.citizenPhone || '+91 98765 43210';
      if (nextStatus === 'Assigned' || nextStatus === 'In Progress') {
        await sendNotification({
          phone: recipientPhone,
          template: 'OFFICER_ASSIGNED',
          data: {
            id,
            officerName: officerName || updatedGrievance.assignedOfficer || 'Field Officer',
            officerPhone: officerContact || updatedGrievance.assignedOfficerContact || '+91 94411 99887',
            department: updatedGrievance.department
          }
        });
      } else if (nextStatus === 'Resolved') {
        await sendNotification({
          phone: recipientPhone,
          template: 'GRIEVANCE_RESOLVED',
          data: {
            id,
            officerName: officerName || updatedGrievance.assignedOfficer || 'Nodal Officer',
            resolutionNote: note || 'Issue inspected and resolved'
          }
        });
      }
    } catch (notifErr) {
      console.warn('[Notification Notice] Status update notification warning:', notifErr.message);
    }

    return res.json({
      message: `Grievance status updated to '${nextStatus}'.`,
      fabricTxId: fabricResult.txId,
      fabricBlockNumber: fabricResult.blockNumber,
      fabricBlockHash: fabricResult.blockHash,
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

    const fabricResult = await FabricClient.submitTransaction('RecordGrievanceState', [
      id,
      grievance.department || 'General Administration',
      grievance.priority || 'Medium',
      'Under Review',
      'Citizen Escalation Gateway',
      grievance.ipfsDocumentCid || '',
      `Ticket Re-opened by citizen. Reason: ${reason || 'Incomplete resolution.'}`
    ]);

    let updated;
    try {
      updated = await GrievanceModel.updateStatus(id, {
        nextStatus: 'Under Review',
        officerName: 'Citizen Escalation Gateway',
        note: `Ticket Re-opened by citizen. Reason: ${reason || 'Incomplete field resolution.'}`,
        fabricTxId: fabricResult.txId,
        fabricBlockNumber: fabricResult.blockNumber,
        fabricBlockHash: fabricResult.blockHash
      });
    } catch (e) {
      grievance.status = 'Under Review';
      grievance.fabricTxId = fabricResult.txId;
      grievance.fabricBlockNumber = fabricResult.blockNumber;
      grievance.fabricBlockHash = fabricResult.blockHash;
      grievance.updatedAt = new Date().toISOString();
      grievance.timeline.push({
        status: 'Under Review',
        officerName: 'Citizen Escalation Gateway',
        note: `Ticket Re-opened by citizen. Reason: ${reason || 'Incomplete field resolution.'}`,
        fabricTxId: fabricResult.txId,
        fabricBlockNumber: fabricResult.blockNumber,
        fabricBlockHash: fabricResult.blockHash,
        timestamp: new Date().toISOString()
      });
      updated = grievance;
    }

    // Statutory Citizen Notification Dispatch (SMS & WhatsApp)
    try {
      await sendNotification({
        phone: updated.citizenPhone || '+91 98765 43210',
        template: 'GRIEVANCE_REOPENED',
        data: {
          id,
          reason
        }
      });
    } catch (notifErr) {
      console.warn('[Notification Notice] Reopen alert dispatch warning:', notifErr.message);
    }

    return res.json({
      message: 'Grievance ticket re-opened and escalated to Nodal Officer.',
      fabricTxId: fabricResult.txId,
      fabricBlockNumber: fabricResult.blockNumber,
      fabricBlockHash: fabricResult.blockHash,
      grievance: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Upvote / Community +1 Report Action
 */
const upvoteGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenName = req.body.citizenName || req.user?.fullName || 'Citizen';

    const updated = await GrievanceModel.upvote(id, citizenName);
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Grievance ticket '${id}' not found.` });
    }

    return res.json({
      message: `Community report upvoted. Priority is now ${updated.priority}.`,
      grievance: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Fetch Officer Roster & Queue Status across all sectors & departments
 */
const getOfficerRoster = async (req, res) => {
  try {
    if (req.user && req.user.role === 'OFFICER') {
    const cleanName = String(req.user.fullName || '').replace(/^er\.\s*/i, '').trim().toLowerCase();
    const matchedProfile = findOfficer({
      id: req.user.employeeId,
      email: req.user.email,
      name: req.user.fullName
    });
    const allGrievances = db.store?.grievances || [];
    const deptGrievances = allGrievances.filter((g) => isSameDepartment(req.user.department, g.department));
    const myAssigned = deptGrievances.filter((g) => {
      const assigned = String(g.assignedOfficer || '').toLowerCase();
      return (cleanName && assigned.includes(cleanName)) || (matchedProfile?.name && assigned.includes(matchedProfile.name.toLowerCase()));
    });
    const activeCount = myAssigned.filter((g) => !['Resolved', 'Rejected'].includes(g.status)).length;
    const resolvedCount = myAssigned.filter((g) => g.status === 'Resolved').length;

    const ownProfile = {
      ...(matchedProfile || {}),
      id: matchedProfile?.id || req.user.employeeId || req.user.id,
      name: matchedProfile?.name || req.user.fullName,
      roleTitle: matchedProfile?.roleTitle || 'Department Nodal Officer',
      department: req.user.department,
      email: req.user.email,
      sector: matchedProfile?.sector || 'Assigned Sector',
      status: matchedProfile?.status || 'Available',
      activeTickets: activeCount,
      resolvedTickets: resolvedCount,
      maxCapacity: matchedProfile?.maxCapacity || 5,
      disciplinaryStrikes: matchedProfile?.disciplinaryStrikes || 0,
      suspended: Boolean(matchedProfile?.suspended)
    };

    return res.json({
      scopedToSelf: true,
      totalOfficers: 1,
      sectors: [],
      departments: [req.user.department],
      officers: [ownProfile]
    });
  }

  const rawStatus = getRosterStatus();
  const status = req.user && req.user.role === 'ADMIN'
    ? rawStatus
    : {
        ...rawStatus,
        officers: (rawStatus.officers || []).map(({ phone, ...rest }) => rest)
      };
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const claimGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const grievance = await GrievanceModel.findById(id);
    if (!grievance) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Grievance '${id}' not found.` });
    }
    if (req.user?.role === 'OFFICER' && !isSameDepartment(req.user.department, grievance.department)) {
      return res.status(403).json({
        error: 'FORBIDDEN_DEPARTMENT',
        message: `Officers in '${req.user.department}' cannot claim tickets belonging to '${grievance.department}'.`
      });
    }
    if (['Resolved', 'Rejected'].includes(grievance.status)) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: `Cannot claim grievance '${id}' because it is already '${grievance.status}'.`
      });
    }

    const matched = findOfficer({ id: req.user?.employeeId, email: req.user?.email, name: req.user?.fullName });
    const claimantName = req.user?.role === 'ADMIN' && req.body?.officerName
      ? req.body.officerName
      : (matched?.name || req.user?.fullName || req.user?.email || 'Nodal Officer');
    const claimantContact = matched?.phone || req.body?.officerContact || grievance.assignedOfficerContact || '+91 1800-425-GOV';
    const nextStatus = ['Submitted', 'Under Review'].includes(grievance.status) ? 'Assigned' : grievance.status;
    const claimNote = req.body?.note || `Ticket claimed for active field resolution by ${claimantName}.`;

    const fabricResult = await FabricClient.submitTransaction('RecordGrievanceState', [
      id,
      grievance.department || 'General Administration',
      grievance.priority || 'Medium',
      nextStatus,
      claimantName,
      grievance.resolutionIpfsCid || grievance.ipfsDocumentCid || '',
      claimNote
    ]);

    const updated = await GrievanceModel.updateStatus(id, {
      nextStatus,
      officerName: claimantName,
      officerContact: claimantContact,
      note: claimNote,
      fabricTxId: fabricResult.txId,
      fabricBlockNumber: fabricResult.blockNumber,
      fabricBlockHash: fabricResult.blockHash
    });
    if (typeof db.saveStore === 'function') db.saveStore();

    return res.json({ success: true, message: `Grievance '${id}' claimed by ${claimantName}.`, grievance: updated });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const transferGrievanceDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetDepartment, reason } = req.body || {};
    if (!targetDepartment || !String(targetDepartment).trim()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'targetDepartment is required.' });
    }
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A transfer justification reason (min 5 characters) is required.' });
    }

    const grievance = await GrievanceModel.findById(id);
    if (!grievance) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Grievance '${id}' not found.` });
    }
    if (req.user?.role === 'OFFICER' && !isSameDepartment(req.user.department, grievance.department)) {
      return res.status(403).json({
        error: 'FORBIDDEN_DEPARTMENT',
        message: `Access denied: Officers in '${req.user.department}' cannot transfer grievances owned by '${grievance.department}'.`
      });
    }
    if (isSameDepartment(targetDepartment, grievance.department)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Grievance '${id}' is already mapped to '${grievance.department}'. Choose a different target department.`
      });
    }

    const previousDepartment = grievance.department;
    releaseOfficerFromTicket(id);
    const allocated = allocateNextOfficer(targetDepartment, grievance.sector || grievance.location || '', id);
    const nextOfficer = allocated ? allocated.officerName : `${targetDepartment} Nodal Desk (Pending Dispatch)`;
    const nextContact = allocated ? allocated.officerContact : '+91 1800-425-GOV';
    const transferNote = `Transferred from '${previousDepartment}' to '${targetDepartment}'. Reason: ${String(reason).trim()}`;

    grievance.department = targetDepartment;
    grievance.assignedOfficer = nextOfficer;
    grievance.assignedOfficerContact = nextContact;
    grievance.status = ['Resolved', 'Rejected'].includes(grievance.status) ? grievance.status : 'Under Review';
    grievance.updatedAt = new Date().toISOString();
    if (!Array.isArray(grievance.timeline)) grievance.timeline = [];
    grievance.timeline.push({
      status: grievance.status,
      officerName: req.user?.fullName || req.user?.email || 'Department Officer',
      note: transferNote,
      timestamp: new Date().toISOString()
    });
    if (!Array.isArray(grievance.internalNotes)) grievance.internalNotes = [];
    grievance.internalNotes.push({
      id: `TRF-${Date.now()}`,
      author: req.user?.email || 'staff@gov.in',
      role: req.user?.role || 'OFFICER',
      note: transferNote,
      timestamp: new Date().toISOString()
    });

    const fabricResult = await FabricClient.submitTransaction('RecordGrievanceState', [
      id,
      targetDepartment,
      grievance.priority || 'Medium',
      grievance.status,
      nextOfficer,
      grievance.ipfsDocumentCid || '',
      transferNote
    ]);
    grievance.fabricTxId = fabricResult.txId;
    grievance.fabricBlockNumber = fabricResult.blockNumber;
    grievance.fabricBlockHash = fabricResult.blockHash;

    if (typeof db.saveStore === 'function') db.saveStore();
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'GRIEVANCE_DEPARTMENT_TRANSFER',
      targetType: 'GRIEVANCE',
      targetId: id,
      details: transferNote
    });

    return res.json({ success: true, message: transferNote, grievance });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const bulkAssignGrievances = async (req, res) => {
  try {
    const { grievanceIds, officerName, officerContact, note } = req.body || {};
    if (!Array.isArray(grievanceIds) || grievanceIds.length === 0) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'grievanceIds non-empty array is required.' });
    }
    if (!officerName || !String(officerName).trim()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'officerName is required.' });
    }

    const updatedList = [];
    for (const gid of grievanceIds) {
      const g = await GrievanceModel.findById(gid);
      if (!g || ['Resolved', 'Rejected'].includes(g.status)) continue;
      try {
        releaseOfficerFromTicket(gid);
      } catch (relErr) {
        console.warn('[Dispatch Warning] Could not release officer:', relErr.message);
      }
      g.assignedOfficer = String(officerName).trim();
      if (officerContact) g.assignedOfficerContact = String(officerContact).trim();
      if (['Submitted', 'Under Review'].includes(g.status)) g.status = 'Assigned';
      g.updatedAt = new Date().toISOString();
      if (!Array.isArray(g.timeline)) g.timeline = [];
      g.timeline.push({
        status: g.status,
        officerName: String(officerName).trim(),
        note: note || `Bulk assigned to ${String(officerName).trim()} by Municipal Control Room.`,
        timestamp: new Date().toISOString()
      });
      updatedList.push(g);
    }

    if (typeof db.saveStore === 'function') db.saveStore();
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'BULK_ASSIGN_GRIEVANCES',
      targetType: 'GRIEVANCE_BATCH',
      targetId: grievanceIds.join(','),
      details: `Assigned ${updatedList.length} tickets to ${String(officerName).trim()}`
    });

    return res.json({
      success: true,
      updatedCount: updatedList.length,
      grievances: updatedList
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const linkDuplicateGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { masterGrievanceId, note } = req.body || {};
    if (!masterGrievanceId || masterGrievanceId === id) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A distinct masterGrievanceId is required.' });
    }

    const dup = await GrievanceModel.findById(id);
    const master = await GrievanceModel.findById(masterGrievanceId);
    if (!dup || !master) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Duplicate or Master grievance ticket not found.' });
    }

    dup.duplicateOf = masterGrievanceId;
    dup.updatedAt = new Date().toISOString();
    if (!Array.isArray(dup.timeline)) dup.timeline = [];
    dup.timeline.push({
      status: master.status === 'Resolved' ? 'Resolved' : dup.status,
      officerName: req.user?.fullName || 'Control Room Admin',
      note: note || `Linked as duplicate of Master Ticket ${masterGrievanceId}.`,
      timestamp: new Date().toISOString()
    });
    if (master.status === 'Resolved' && dup.status !== 'Resolved') {
      dup.status = 'Resolved';
      dup.resolvedAt = master.resolvedAt || new Date().toISOString();
      releaseOfficerFromTicket(id);
    }

    if (!Array.isArray(master.linkedDuplicates)) master.linkedDuplicates = [];
    if (!master.linkedDuplicates.includes(id)) {
      master.linkedDuplicates.push(id);
    }
    master.updatedAt = new Date().toISOString();

    if (typeof db.saveStore === 'function') db.saveStore();
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'LINK_DUPLICATE_GRIEVANCE',
      targetType: 'GRIEVANCE',
      targetId: id,
      details: `Linked duplicate ${id} -> Master ${masterGrievanceId}`
    });

    return res.json({
      success: true,
      message: `Ticket '${id}' linked as duplicate of '${masterGrievanceId}'.`,
      duplicate: dup,
      master
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
  reopenGrievance,
  upvoteGrievance,
  getOfficerRoster,
  claimGrievance,
  transferGrievanceDepartment,
  bulkAssignGrievances,
  linkDuplicateGrievance
};

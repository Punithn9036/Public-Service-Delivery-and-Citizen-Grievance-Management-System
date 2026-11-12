// backend/src/controllers/adminGovernanceController.js
// Admin-only municipal governance endpoints: Officer Lifecycle CRUD, Audit Logs,
// Civic Advisories, Dynamic SLA Policies, and Real-Time Analytics

const db = require('../db');
const { isSameDepartment } = require('../middleware/departmentAuth');
const { SECTORS, DEPARTMENTS } = require('../../utils/officerRoster');
const {
  getAuditLogs,
  appendAuditLog,
  getAdvisories,
  createAdvisory,
  updateAdvisory,
  getSlaPolicies,
  upsertSlaPolicy,
  listOfficers,
  createOfficer,
  updateOfficerRecord
} = require('../db/governanceStore');

// ---------------- Officer Lifecycle & Roster CRUD ----------------

const getAdminOfficers = async (req, res) => {
  try {
    const officers = listOfficers();
    const allGrievances = db.store?.grievances || [];
    const enriched = officers.map((off) => {
      const firstNamePart = String(off.name || '').replace(/^er\.\s*/i, '').trim().toLowerCase();
      const assigned = allGrievances.filter((g) => {
        const a = String(g.assignedOfficer || '').toLowerCase();
        return firstNamePart && a.includes(firstNamePart);
      });
      const resolvedCount = assigned.filter((g) => g.status === 'Resolved').length;
      const liveActive = assigned.filter((g) => !['Resolved', 'Rejected'].includes(g.status)).length;
      return {
        ...off,
        liveActiveTickets: liveActive,
        resolvedTickets: resolvedCount
      };
    });

    return res.json({
      totalOfficers: enriched.length,
      sectors: SECTORS,
      departments: DEPARTMENTS,
      officers: enriched
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const addAdminOfficer = async (req, res) => {
  try {
    const { name, roleTitle, sector, department, phone, badgeNumber, email } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Officer name is required.' });
    }
    const created = createOfficer({ name, roleTitle, sector, department, phone, badgeNumber, email });
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'CREATE_OFFICER',
      targetType: 'OFFICER',
      targetId: created.id,
      details: `Onboarded ${created.name} into ${created.department} (${created.sector})`
    });
    return res.status(201).json({ success: true, officer: created });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const patchAdminOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body || {};
    const updated = updateOfficerRecord(id, patch);
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Officer '${id}' not found in roster.` });
    }
    const actionLabel = patch.suspended === false && patch.disciplinaryStrikes === 0
      ? 'REINSTATE_OFFICER'
      : 'UPDATE_OFFICER';
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: actionLabel,
      targetType: 'OFFICER',
      targetId: id,
      details: `Updated ${updated.name}: dept=${updated.department}, sector=${updated.sector}, status=${updated.status}, suspended=${updated.suspended}`
    });
    return res.json({ success: true, officer: updated });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

// ---------------- Governance Audit Logs ----------------

const fetchAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(300, Math.max(10, parseInt(req.query.limit, 10) || 100));
    const logs = getAuditLogs(limit);
    return res.json({ count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

// ---------------- Civic Advisories ----------------

const listCivicAdvisories = async (req, res) => {
  try {
    if (req.user?.role === 'ADMIN') {
      const advisories = getAdvisories({ activeOnly: false });
      return res.json({ count: advisories.length, advisories });
    }
    if (req.user?.role === 'OFFICER') {
      const advisories = getAdvisories({ activeOnly: true, department: req.user.department });
      return res.json({ count: advisories.length, advisories });
    }
    const advisories = getAdvisories({ activeOnly: true });
    return res.json({ count: advisories.length, advisories });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const postCivicAdvisory = async (req, res) => {
  try {
    const { title, message, department, severity } = req.body || {};
    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Advisory title and message are required.' });
    }
    const created = createAdvisory({
      title,
      message,
      department: department || 'All Departments',
      severity,
      createdBy: req.user?.email
    });
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'CREATE_ADVISORY',
      targetType: 'ADVISORY',
      targetId: created.id,
      details: `Broadcast '${created.title}' (${created.severity}) to ${created.department}`
    });
    return res.status(201).json({ success: true, advisory: created });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const patchCivicAdvisory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateAdvisory(id, req.body || {});
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Advisory '${id}' not found.` });
    }
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'UPDATE_ADVISORY',
      targetType: 'ADVISORY',
      targetId: id,
      details: `Updated advisory '${updated.title}' (active=${updated.active})`
    });
    return res.json({ success: true, advisory: updated });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

// ---------------- Dynamic SLA Policies ----------------

const fetchSlaPolicies = async (req, res) => {
  try {
    let policies = getSlaPolicies();
    if (req.user?.role === 'OFFICER') {
      policies = policies.filter((p) => isSameDepartment(req.user.department, p.department));
    }
    return res.json({ count: policies.length, policies });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const saveSlaPolicy = async (req, res) => {
  try {
    const { department, targetDays, warningHours, autoEscalate } = req.body || {};
    if (!department || !String(department).trim()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'department is required.' });
    }
    const policy = upsertSlaPolicy({ department, targetDays, warningHours, autoEscalate });
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'UPDATE_SLA_POLICY',
      targetType: 'SLA_POLICY',
      targetId: policy.department,
      details: `SLA target=${policy.targetDays}d, warning=${policy.warningHours}h, autoEscalate=${policy.autoEscalate}`
    });
    return res.json({ success: true, policy });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

// ---------------- Authentic Control Room Analytics ----------------

const getControlRoomAnalytics = async (req, res) => {
  try {
    const grievances = db.store?.grievances || [];
    const applications = db.store?.service_applications || [];
    const officers = listOfficers();

    const nowMs = Date.now();
    const resolvedTickets = grievances.filter((g) => g.status === 'Resolved');
    const mttrSamplesHours = resolvedTickets
      .map((g) => {
        const start = new Date(g.createdAt).getTime();
        const end = new Date(g.resolvedAt || g.updatedAt || g.createdAt).getTime();
        return (!Number.isNaN(start) && !Number.isNaN(end) && end >= start)
          ? (end - start) / (1000 * 60 * 60)
          : null;
      })
      .filter((v) => v !== null);

    const overallMttrHours = mttrSamplesHours.length > 0
      ? Number((mttrSamplesHours.reduce((a, b) => a + b, 0) / mttrSamplesHours.length).toFixed(1))
      : 0;

    // Department-level authentic breakdown
    const allDepts = [...new Set([
      ...DEPARTMENTS,
      ...grievances.map((g) => g.department).filter(Boolean)
    ])];
    const departmentBreakdown = allDepts.map((dept) => {
      const deptItems = grievances.filter((g) => isSameDepartment(dept, g.department));
      const resolved = deptItems.filter((g) => g.status === 'Resolved');
      const escalated = deptItems.filter((g) => g.status === 'Escalated');
      const breached = deptItems.filter((g) => !['Resolved', 'Rejected'].includes(g.status) && g.slaDeadline && new Date(g.slaDeadline).getTime() < nowMs);
      const deptMttr = resolved
        .map((g) => {
          const s = new Date(g.createdAt).getTime();
          const e = new Date(g.resolvedAt || g.updatedAt || g.createdAt).getTime();
          return (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) ? (e - s) / (1000 * 60 * 60 * 24) : null;
        })
        .filter((v) => v !== null);
      return {
        department: dept,
        total: deptItems.length,
        resolved: resolved.length,
        escalated: escalated.length,
        slaBreached: breached.length,
        avgTatDays: deptMttr.length > 0 ? Number((deptMttr.reduce((a, b) => a + b, 0) / deptMttr.length).toFixed(2)) : 0,
        resolutionRate: deptItems.length > 0 ? Math.round((resolved.length / deptItems.length) * 100) : 0
      };
    });

    // Ward / Sector hotspots
    const wardMap = {};
    for (const g of grievances) {
      const key = g.sector || g.location || 'Unspecified Ward';
      wardMap[key] = (wardMap[key] || 0) + 1;
    }
    const wardHotspots = Object.entries(wardMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Channel breakdown
    const channels = { Web: 0, WhatsApp: 0, Other: 0 };
    for (const g of grievances) {
      const ch = String(g.sourceChannel || g.channel || '').toLowerCase();
      if (ch.includes('whatsapp') || String(g.description || '').includes('WhatsApp')) {
        channels.WhatsApp += 1;
      } else if (!ch || ch.includes('web') || ch.includes('portal')) {
        channels.Web += 1;
      } else {
        channels.Other += 1;
      }
    }

    // Reopened / low-CSAT appeal candidates
    const appealsQueue = grievances.filter((g) => {
      const hasLowCsat = g.feedback && Number(g.feedback.rating) <= 2;
      const wasReopened = Array.isArray(g.timeline) && g.timeline.some((t) => String(t.note || '').toLowerCase().includes('reopen'));
      return hasLowCsat || wasReopened;
    });

    // Officer throughput leaderboard (resolved count)
    const officerThroughput = officers
      .map((off) => {
        const clean = String(off.name || '').replace(/^er\.\s*/i, '').trim().toLowerCase();
        const mine = grievances.filter((g) => clean && String(g.assignedOfficer || '').toLowerCase().includes(clean));
        return {
          id: off.id,
          name: off.name,
          department: off.department,
          sector: off.sector,
          resolved: mine.filter((g) => g.status === 'Resolved').length,
          active: mine.filter((g) => !['Resolved', 'Rejected'].includes(g.status)).length
        };
      })
      .sort((a, b) => b.resolved - a.resolved || a.active - b.active)
      .slice(0, 10);

    return res.json({
      totalGrievances: grievances.length,
      totalApplications: applications.length,
      overallMttrHours,
      appealsCount: appealsQueue.length,
      channels,
      departmentBreakdown,
      wardHotspots,
      officerThroughput
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getAdminOfficers,
  addAdminOfficer,
  patchAdminOfficer,
  fetchAuditLogs,
  listCivicAdvisories,
  postCivicAdvisory,
  patchCivicAdvisory,
  fetchSlaPolicies,
  saveSlaPolicy,
  getControlRoomAnalytics
};

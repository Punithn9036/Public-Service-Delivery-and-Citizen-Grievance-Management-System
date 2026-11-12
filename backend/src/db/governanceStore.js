// backend/src/db/governanceStore.js
// File-backed governance persistence for Admin Audit Logs, Civic Advisories, SLA Policies, and Officer Roster CRUD

const fs = require('fs');
const path = require('path');
const { loadRoster, saveRoster } = require('../../utils/officerDispatch');
const { SECTORS, DEPARTMENTS } = require('../../utils/officerRoster');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const AUDIT_LOGS_PATH = path.join(DATA_DIR, 'admin_audit_logs.json');
const ADVISORIES_PATH = path.join(DATA_DIR, 'civic_advisories.json');
const SLA_POLICIES_PATH = path.join(DATA_DIR, 'sla_policies.json');

const DEFAULT_SLA_POLICIES = [
  { department: 'Water Supply & Sanitation', targetDays: 3, warningHours: 48, autoEscalate: true },
  { department: 'Public Works & Infrastructure', targetDays: 5, warningHours: 72, autoEscalate: true },
  { department: 'Health & Hygiene', targetDays: 2, warningHours: 24, autoEscalate: true },
  { department: 'Revenue & Taxation', targetDays: 7, warningHours: 120, autoEscalate: true },
  { department: 'Commercial & Trade Licensing', targetDays: 5, warningHours: 72, autoEscalate: true },
  { department: 'Electrical & Infrastructure', targetDays: 3, warningHours: 48, autoEscalate: true },
  { department: 'Town Planning & Environment', targetDays: 7, warningHours: 120, autoEscalate: true }
];

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readJsonFile = (filePath, fallbackValue) => {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2), 'utf8');
      return Array.isArray(fallbackValue) ? [...fallbackValue] : { ...fallbackValue };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.warn(`governanceStore read fallback for ${path.basename(filePath)}:`, err.message);
    return Array.isArray(fallbackValue) ? [...fallbackValue] : { ...fallbackValue };
  }
};

const writeJsonFile = (filePath, data) => {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// ---------------- Admin Governance Audit Logs ----------------

const getAuditLogs = (limit = 100) => {
  const logs = readJsonFile(AUDIT_LOGS_PATH, []);
  return logs.slice(0, limit);
};

const appendAuditLog = ({ actorEmail, actorRole, action, targetType, targetId, details }) => {
  const logs = readJsonFile(AUDIT_LOGS_PATH, []);
  const entry = {
    id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    actorEmail: actorEmail || 'system@gov.in',
    actorRole: actorRole || 'ADMIN',
    action,
    targetType: targetType || 'SYSTEM',
    targetId: targetId || null,
    details: details || ''
  };
  logs.unshift(entry);
  writeJsonFile(AUDIT_LOGS_PATH, logs.slice(0, 500));
  return entry;
};

// ---------------- Civic Advisories ----------------

const getAdvisories = ({ activeOnly = false, department = null } = {}) => {
  let advisories = readJsonFile(ADVISORIES_PATH, []);
  if (activeOnly) {
    advisories = advisories.filter((a) => a.active !== false);
  }
  if (department) {
    const normDept = String(department).trim().toLowerCase();
    advisories = advisories.filter(
      (a) => !a.department || a.department === 'All Departments' || String(a.department).trim().toLowerCase() === normDept
    );
  }
  return advisories;
};

const createAdvisory = ({ title, message, department = 'All Departments', severity = 'info', createdBy }) => {
  const advisories = readJsonFile(ADVISORIES_PATH, []);
  const entry = {
    id: `ADV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    title: String(title || '').trim(),
    message: String(message || '').trim(),
    department: department || 'All Departments',
    severity: ['info', 'warning', 'critical'].includes(severity) ? severity : 'info',
    active: true,
    createdBy: createdBy || 'admin.controlroom@gov.in',
    createdAt: new Date().toISOString()
  };
  advisories.unshift(entry);
  writeJsonFile(ADVISORIES_PATH, advisories.slice(0, 100));
  return entry;
};

const updateAdvisory = (id, patch = {}) => {
  const advisories = readJsonFile(ADVISORIES_PATH, []);
  const idx = advisories.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  advisories[idx] = {
    ...advisories[idx],
    ...patch,
    id: advisories[idx].id,
    updatedAt: new Date().toISOString()
  };
  writeJsonFile(ADVISORIES_PATH, advisories);
  return advisories[idx];
};

// ---------------- SLA Policies ----------------

const getSlaPolicies = () => {
  return readJsonFile(SLA_POLICIES_PATH, DEFAULT_SLA_POLICIES);
};

const upsertSlaPolicy = ({ department, targetDays, warningHours, autoEscalate }) => {
  const policies = getSlaPolicies();
  const norm = String(department || '').trim().toLowerCase();
  const idx = policies.findIndex((p) => String(p.department || '').trim().toLowerCase() === norm);
  const nextPolicy = {
    department: String(department || '').trim(),
    targetDays: Math.max(1, Number(targetDays) || 3),
    warningHours: Math.max(4, Number(warningHours) || 48),
    autoEscalate: autoEscalate !== false,
    updatedAt: new Date().toISOString()
  };
  if (idx === -1) {
    policies.push(nextPolicy);
  } else {
    policies[idx] = { ...policies[idx], ...nextPolicy };
  }
  writeJsonFile(SLA_POLICIES_PATH, policies);
  return nextPolicy;
};

// ---------------- Officer Roster CRUD ----------------

const listOfficers = () => loadRoster();

const findOfficer = ({ id, name, email } = {}) => {
  const roster = loadRoster();
  return roster.find((off) => {
    if (id && (off.id === id || off.employeeId === id || off.badgeNumber === id)) return true;
    if (email && off.email && off.email.toLowerCase() === String(email).toLowerCase()) return true;
    if (name && off.name && off.name.toLowerCase() === String(name).trim().toLowerCase()) return true;
    return false;
  }) || null;
};

const createOfficer = ({ name, roleTitle, sector, department, phone, badgeNumber, email }) => {
  const roster = loadRoster();
  const safeDept = department || DEPARTMENTS[0];
  const safeSector = sector || SECTORS[0];
  const generatedId = `OFF-${Date.now().toString().slice(-5)}-${Math.floor(10 + Math.random() * 90)}`;
  const entry = {
    id: generatedId,
    name: String(name || '').trim(),
    roleTitle: String(roleTitle || 'Field Nodal Officer').trim(),
    sector: safeSector,
    department: safeDept,
    phone: String(phone || '+91-98000-00000').trim(),
    email: email ? String(email).trim().toLowerCase() : undefined,
    badgeNumber: badgeNumber || `GOV-${Math.floor(1000 + Math.random() * 9000)}`,
    activeTickets: [],
    assignedCount: 0,
    lastAssignedAt: null,
    queuePriority: roster.length,
    maxCapacity: 5,
    status: 'AVAILABLE',
    disciplinaryStrikes: 0,
    suspended: false,
    joinedAt: new Date().toISOString()
  };
  roster.unshift(entry);
  saveRoster(roster);
  return entry;
};

const updateOfficerRecord = (id, patch = {}) => {
  const roster = loadRoster();
  const idx = roster.findIndex((o) => o.id === id || o.badgeNumber === id);
  if (idx === -1) return null;

  const current = roster[idx];
  const updated = {
    ...current,
    ...(patch.name !== undefined ? { name: String(patch.name).trim() } : {}),
    ...(patch.roleTitle !== undefined ? { roleTitle: String(patch.roleTitle).trim() } : {}),
    ...(patch.sector !== undefined ? { sector: patch.sector } : {}),
    ...(patch.department !== undefined ? { department: patch.department } : {}),
    ...(patch.phone !== undefined ? { phone: String(patch.phone).trim() } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.maxCapacity !== undefined ? { maxCapacity: Math.max(1, Number(patch.maxCapacity) || 5) } : {}),
    ...(patch.disciplinaryStrikes !== undefined ? { disciplinaryStrikes: Math.max(0, Number(patch.disciplinaryStrikes) || 0) } : {}),
    ...(patch.suspended !== undefined ? { suspended: Boolean(patch.suspended) } : {}),
    updatedAt: new Date().toISOString()
  };
  roster[idx] = updated;
  saveRoster(roster);
  return updated;
};

module.exports = {
  getAuditLogs,
  appendAuditLog,
  getAdvisories,
  createAdvisory,
  updateAdvisory,
  getSlaPolicies,
  upsertSlaPolicy,
  listOfficers,
  findOfficer,
  createOfficer,
  updateOfficerRecord
};

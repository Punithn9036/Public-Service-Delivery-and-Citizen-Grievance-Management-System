// backend/utils/officerDispatch.js
// Sector-based Round-Robin Officer Allocation & Queue Engine
const fs = require('fs');
const path = require('path');
const { INITIAL_OFFICERS, SECTORS, DEPARTMENTS } = require('./officerRoster');

const DATA_DIR = path.join(__dirname, '../data');
const ROSTER_FILE = path.join(DATA_DIR, 'officer_roster.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Initialize / Load Officer Roster from disk
 */
function loadRoster() {
  try {
    if (fs.existsSync(ROSTER_FILE)) {
      const raw = fs.readFileSync(ROSTER_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Officer Dispatch] Failed to read roster file, resetting to initial seed:', err.message);
  }

  // Seed default roster
  const initial = INITIAL_OFFICERS.map((off, index) => ({
    ...off,
    status: 'AVAILABLE', // 'AVAILABLE' | 'BUSY'
    activeTickets: [],
    assignedCount: 0,
    lastAssignedAt: null,
    queuePriority: index
  }));

  saveRoster(initial);
  return initial;
}

/**
 * Save Officer Roster to disk
 */
function saveRoster(roster) {
  try {
    fs.writeFileSync(ROSTER_FILE, JSON.stringify(roster, null, 2), 'utf8');
  } catch (err) {
    console.error('[Officer Dispatch] Failed to save roster file:', err.message);
  }
}

let officerRoster = loadRoster();

/**
 * Normalize sector string from user input or GPS location string
 */
function resolveSector(inputLocation = '', inputSector = '') {
  if (inputSector) {
    const directMatch = SECTORS.find(s => s.toLowerCase().includes(inputSector.toLowerCase()));
    if (directMatch) return directMatch;
  }

  const loc = (inputLocation || '').toLowerCase();
  for (const s of SECTORS) {
    const sectorNum = s.match(/Sector\s*(\d+)/i)?.[1];
    if (sectorNum && loc.includes(`sector ${sectorNum}`)) return s;
    if (sectorNum && loc.includes(`sec ${sectorNum}`)) return s;
    if (s.toLowerCase().includes('north') && loc.includes('north')) return s;
    if (s.toLowerCase().includes('south') && loc.includes('south')) return s;
    if (s.toLowerCase().includes('east') && loc.includes('east')) return s;
    if (s.toLowerCase().includes('west') && loc.includes('west')) return s;
    if (s.toLowerCase().includes('central') && loc.includes('central')) return s;
  }

  // Default to Sector 1 (North Zone)
  return SECTORS[0];
}

/**
 * Normalize department string
 */
function resolveDepartment(inputDept = '') {
  const deptStr = (inputDept || '').toLowerCase();
  const match = DEPARTMENTS.find(d => d.toLowerCase().includes(deptStr) || deptStr.includes(d.toLowerCase()));
  return match || DEPARTMENTS[0];
}

/**
 * Allocate next available officer in sequential order (FIFO round-robin)
 * @param {string} department 
 * @param {string} sector 
 * @param {string} ticketId 
 * @returns {Object} Allocated officer details
 */
function allocateNextOfficer(department, sector, ticketId) {
  const targetSector = resolveSector('', sector);
  const targetDept = resolveDepartment(department);

  // Filter officers in target sector and department
  let candidates = officerRoster.filter(o => 
    o.department === targetDept && o.sector === targetSector
  );

  // If no candidates in specific sector, fallback to same department across any sector
  if (candidates.length === 0) {
    candidates = officerRoster.filter(o => o.department === targetDept);
  }

  // If still empty, fallback to all officers
  if (candidates.length === 0) {
    candidates = officerRoster;
  }

  // Find available officers (ordered by queuePriority)
  const availableOfficers = candidates.filter(o => o.status === 'AVAILABLE');

  let chosenOfficer;

  if (availableOfficers.length > 0) {
    // 1. Pick the 1st person in order who is free
    chosenOfficer = availableOfficers[0];
  } else {
    // If all are currently busy, pick the one with least active tickets / oldest assignment
    chosenOfficer = [...candidates].sort((a, b) => 
      (a.activeTickets.length - b.activeTickets.length) || 
      (new Date(a.lastAssignedAt || 0) - new Date(b.lastAssignedAt || 0))
    )[0];
  }

  // Update chosen officer state
  chosenOfficer.status = 'BUSY';
  if (ticketId && !chosenOfficer.activeTickets.includes(ticketId)) {
    chosenOfficer.activeTickets.push(ticketId);
  }
  chosenOfficer.assignedCount += 1;
  chosenOfficer.lastAssignedAt = new Date().toISOString();

  // Rotate chosen officer to the end of the candidate queue priority
  const maxPriority = Math.max(...officerRoster.map(o => o.queuePriority || 0), 0);
  chosenOfficer.queuePriority = maxPriority + 1;

  saveRoster(officerRoster);

  return {
    officerId: chosenOfficer.id,
    officerName: `${chosenOfficer.name} (${chosenOfficer.designation})`,
    officerContact: chosenOfficer.phone,
    sector: chosenOfficer.sector,
    department: chosenOfficer.department,
    activeTicketsCount: chosenOfficer.activeTickets.length
  };
}

/**
 * Release an officer when a ticket is marked Resolved or Closed
 * The freed officer is added back to the available list in their sector!
 * @param {string} ticketId 
 * @returns {Object|null} Freed officer details
 */
function releaseOfficerFromTicket(ticketId) {
  if (!ticketId) return null;

  const officer = officerRoster.find(o => o.activeTickets.includes(ticketId));
  if (!officer) return null;

  // Remove ticket from active list
  officer.activeTickets = officer.activeTickets.filter(id => id !== ticketId);

  // If officer has no remaining active tickets, mark them AVAILABLE
  if (officer.activeTickets.length === 0) {
    officer.status = 'AVAILABLE';
  }

  // Place officer back into the queue with current priority
  const maxPriority = Math.max(...officerRoster.map(o => o.queuePriority || 0), 0);
  officer.queuePriority = maxPriority + 1;

  saveRoster(officerRoster);

  return {
    officerId: officer.id,
    officerName: officer.name,
    department: officer.department,
    sector: officer.sector,
    status: officer.status,
    activeTicketsCount: officer.activeTickets.length
  };
}

/**
 * Get current officer roster status grouped by sector and department
 */
function getRosterStatus(filterSector, filterDept) {
  let list = [...officerRoster];

  if (filterSector && filterSector !== 'All') {
    list = list.filter(o => o.sector === filterSector);
  }
  if (filterDept && filterDept !== 'All') {
    list = list.filter(o => o.department === filterDept);
  }

  // Sort by sector, department, and queuePriority
  list.sort((a, b) => {
    if (a.sector !== b.sector) return a.sector.localeCompare(b.sector);
    if (a.department !== b.department) return a.department.localeCompare(b.department);
    return (a.queuePriority || 0) - (b.queuePriority || 0);
  });

  return {
    totalOfficers: officerRoster.length,
    availableCount: officerRoster.filter(o => o.status === 'AVAILABLE').length,
    busyCount: officerRoster.filter(o => o.status === 'BUSY').length,
    sectors: SECTORS,
    departments: DEPARTMENTS,
    officers: list
  };
}

module.exports = {
  loadRoster,
  saveRoster,
  resolveSector,
  resolveDepartment,
  allocateNextOfficer,
  releaseOfficerFromTicket,
  getRosterStatus,
  SECTORS,
  DEPARTMENTS
};

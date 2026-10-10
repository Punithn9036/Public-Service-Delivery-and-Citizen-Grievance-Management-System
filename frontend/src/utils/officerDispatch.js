// frontend/src/utils/officerDispatch.js
// Sector-based Round-Robin Officer Allocation & Duty Queue Engine
import { INITIAL_OFFICERS, SECTORS, DEPARTMENTS } from '../data/officerRoster';

const STORAGE_KEY = 'janseva_officer_roster_v1';

/**
 * Load Officer Roster from localStorage with seed fallback
 */
export function getStoredRoster() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load officer roster from storage:", err);
  }

  // Seed default roster
  const seeded = INITIAL_OFFICERS.map((off, index) => ({
    ...off,
    status: 'AVAILABLE', // 'AVAILABLE' | 'BUSY'
    activeTickets: [],
    assignedCount: 0,
    lastAssignedAt: null,
    queuePriority: index
  }));

  saveStoredRoster(seeded);
  return seeded;
}

/**
 * Save Officer Roster to localStorage
 */
export function saveStoredRoster(roster) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
  } catch (err) {
    console.error("Failed to save officer roster:", err);
  }
}

/**
 * Resolve sector from address / text or direct sector selection
 */
export function resolveSector(inputLocation = '', inputSector = '') {
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

  return SECTORS[0]; // Default to Sector 1 (North Zone)
}

/**
 * Allocate next available officer in sequential order (FIFO round-robin)
 * @param {string} department 
 * @param {string} sector 
 * @param {string} ticketId 
 * @returns {Object} Allocated officer details
 */
export function allocateNextOfficer(department, sector, ticketId) {
  const roster = getStoredRoster();
  const targetSector = resolveSector('', sector);
  const targetDept = department || DEPARTMENTS[0];

  // Filter officers in target sector and department
  let candidates = roster.filter(o => 
    o.department === targetDept && o.sector === targetSector
  );

  // If none in specific sector, fallback to same department across sectors
  if (candidates.length === 0) {
    candidates = roster.filter(o => o.department === targetDept);
  }

  // Fallback to all officers if still empty
  if (candidates.length === 0) {
    candidates = roster;
  }

  // Find available officers (ordered by queuePriority)
  candidates.sort((a, b) => (a.queuePriority || 0) - (b.queuePriority || 0));
  const availableOfficers = candidates.filter(o => o.status === 'AVAILABLE');

  let chosenOfficer;

  if (availableOfficers.length > 0) {
    // 1. Pick the 1st person in order who is free
    chosenOfficer = availableOfficers[0];
  } else {
    // If all are currently busy, pick the one with least active workload
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
  chosenOfficer.assignedCount = (chosenOfficer.assignedCount || 0) + 1;
  chosenOfficer.lastAssignedAt = new Date().toISOString();

  // Rotate chosen officer's priority to the end of the line
  const maxPriority = Math.max(...roster.map(o => o.queuePriority || 0), 0);
  chosenOfficer.queuePriority = maxPriority + 1;

  saveStoredRoster(roster);

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
 * The freed officer is immediately re-added to the available queue!
 * @param {string} ticketId 
 * @returns {Object|null} Freed officer details
 */
export function releaseOfficerFromTicket(ticketId) {
  if (!ticketId) return null;

  const roster = getStoredRoster();
  const officer = roster.find(o => o.activeTickets && o.activeTickets.includes(ticketId));
  if (!officer) return null;

  // Remove ticket from active list
  officer.activeTickets = officer.activeTickets.filter(id => id !== ticketId);

  // If officer has no active tickets, mark them AVAILABLE
  if (officer.activeTickets.length === 0) {
    officer.status = 'AVAILABLE';
  }

  // Rotate officer to back of priority queue as freshly available
  const maxPriority = Math.max(...roster.map(o => o.queuePriority || 0), 0);
  officer.queuePriority = maxPriority + 1;

  saveStoredRoster(roster);

  return {
    officerId: officer.id,
    officerName: officer.name,
    department: officer.department,
    sector: officer.sector,
    status: officer.status,
    activeTicketsCount: officer.activeTickets.length
  };
}

export { SECTORS, DEPARTMENTS };

// frontend/src/utils/slaEscalationEngine.js
// Automated SLA Breach Detection, Multi-Tier Officer Escalation & 3-Strike Disciplinary Governance Engine

import { getStoredRoster, saveStoredRoster, SECTORS, DEPARTMENTS } from './officerDispatch';

export const SUPERVISING_ENGINEERS = {
  'Water Supply & Sanitation': {
    name: 'Er. Rajesh Varma',
    designation: 'Executive Sanitation Engineer (KMES)',
    phone: '+91 94433 11223',
    role: 'Supervising Executive Engineer'
  },
  'Public Works & Infrastructure': {
    name: 'Er. Suresh Babu',
    designation: 'PWD Road Division Chief (Executive Engineer)',
    phone: '+91 94482 22001',
    role: 'Supervising Executive Engineer'
  },
  'Electrical & Infrastructure': {
    name: 'Er. Vikram Singh',
    designation: 'Zonal Grid Operations Controller (AEE)',
    phone: '+91 98700 55441',
    role: 'Supervising Executive Engineer'
  },
  'Health & Hygiene': {
    name: 'Dr. Kavitha Reddi',
    designation: 'Chief Health & Sanitation Commissioner',
    phone: '+91 94411 99881',
    role: 'Nodal Municipal Commissioner'
  },
  'Town Planning & Environment': {
    name: 'Er. Bhaskar Rao',
    designation: 'Zonal Urban Planning Director',
    phone: '+91 94415 55001',
    role: 'Supervising Director'
  },
  'Revenue & Taxation': {
    name: 'Shri Ashok Mehta',
    designation: 'Chief Revenue Commissioner',
    phone: '+91 94416 66001',
    role: 'Supervising Commissioner'
  },
  'Commercial & Trade Licensing': {
    name: 'Dr. Kavitha Reddi',
    designation: 'Nodal Governance Commissioner',
    phone: '+91 94411 99887',
    role: 'Nodal Municipal Commissioner'
  }
};

export const NODAL_COMMISSIONER = {
  name: 'Smt. Kavitha Reddi',
  designation: 'Nodal Governance Commissioner (State Secretariat)',
  phone: '+91 94411 99887',
  role: 'Appellate Authority'
};

/**
 * Returns the higher supervisory authority for a department
 */
export function getSupervisoryAuthority(department) {
  return SUPERVISING_ENGINEERS[department] || {
    name: 'Er. Rajesh Varma',
    designation: 'Supervising Executive Engineer',
    phone: '+91 94433 11223',
    role: 'Supervising Executive Engineer'
  };
}

/**
 * Disciplinary Matrix Rule Calculator
 * Strike 1 -> Show Cause Notice (Explanation Required within 48h)
 * Strike 2 -> 1-Month Suspension (Workload Reassigned)
 * Strike 3 -> Termination Proceedings / Vigilance Inquiry
 */
export function evaluateDisciplinaryStatus(breachCount) {
  if (breachCount >= 3) {
    return {
      status: 'TERMINATION_PROCEEDINGS',
      badge: 'STRIKE 3: TERMINATION INQUIRY',
      color: '#991b1b',
      bg: 'rgba(153, 27, 27, 0.15)',
      description: 'Repeated Gross Non-Compliance: Referred to Civil Services Vigilance Tribunal for Termination / Dismissal.'
    };
  }
  if (breachCount === 2) {
    return {
      status: 'SUSPENDED',
      badge: 'STRIKE 2: SUSPENDED (1 MONTH)',
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.15)',
      description: 'Placed under 1-Month Administrative Suspension under Section 56 of Municipal Conduct Rules. All active duties relieved.'
    };
  }
  if (breachCount === 1) {
    return {
      status: 'EXPLANATION_REQUIRED',
      badge: 'STRIKE 1: SHOW CAUSE NOTICE',
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.15)',
      description: 'Formal Show Cause Notice issued. Official explanation must be submitted within 48 hours.'
    };
  }
  return {
    status: 'CLEAR',
    badge: 'GOOD STANDING',
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.15)',
    description: 'No active SLA lapses recorded. Performance compliance verified.'
  };
}

/**
 * Audit all grievances for SLA breaches and automatically apply statutory escalations
 */
export function auditAndEscalateGrievances(grievancesList = []) {
  if (!Array.isArray(grievancesList) || grievancesList.length === 0) {
    return { grievances: grievancesList, roster: getStoredRoster(), escalatedCount: 0, newEscalations: [] };
  }

  const now = Date.now();
  const roster = getStoredRoster();
  let hasGrievanceChanges = false;
  let hasRosterChanges = false;
  const newEscalations = [];

  const updatedGrievances = grievancesList.map(item => {
    // Check only uncompleted tickets with a valid SLA deadline
    if (!item.slaDeadline || item.status === 'Resolved' || item.status === 'Rejected') {
      return item;
    }

    const deadlineTime = new Date(item.slaDeadline).getTime();
    const isOverdue = now > deadlineTime;

    // Already escalated
    if (item.status === 'Escalated') {
      return item;
    }

    if (isOverdue) {
      hasGrievanceChanges = true;
      const overdueHours = Math.max(1, Math.round((now - deadlineTime) / (1000 * 60 * 60)));
      const supervisor = getSupervisoryAuthority(item.department);

      // Locate assigned officer in roster
      const currentOfficerName = item.assignedOfficer || '';
      let targetOfficer = roster.find(o => 
        (o.id && currentOfficerName.includes(o.id)) ||
        (o.name && currentOfficerName.toLowerCase().includes(o.name.toLowerCase()))
      );

      // Record disciplinary breach against assigned officer
      if (targetOfficer) {
        hasRosterChanges = true;
        targetOfficer.slaBreachesCount = (targetOfficer.slaBreachesCount || 0) + 1;
        targetOfficer.slaBreaches = targetOfficer.slaBreaches || [];
        targetOfficer.slaBreaches.push({
          ticketId: item.id,
          breachedAt: new Date().toISOString(),
          overdueHours,
          department: item.department,
          strikeNumber: targetOfficer.slaBreachesCount
        });

        // Evaluate 3-strike disciplinary status
        const evalResult = evaluateDisciplinaryStatus(targetOfficer.slaBreachesCount);
        targetOfficer.disciplinaryStatus = evalResult.status;
        targetOfficer.disciplinaryBadge = evalResult.badge;

        if (evalResult.status === 'SUSPENDED') {
          targetOfficer.status = 'SUSPENDED';
          targetOfficer.suspensionStart = new Date().toISOString();
          targetOfficer.suspensionEnd = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 Month
          // Remove this breached ticket from their active queue
          targetOfficer.activeTickets = (targetOfficer.activeTickets || []).filter(t => t !== item.id);
        } else if (evalResult.status === 'TERMINATION_PROCEEDINGS') {
          targetOfficer.status = 'DISMISSED_PENDING_INQUIRY';
          targetOfficer.activeTickets = [];
        }
      }

      // Construct escalated grievance object
      const escalatedTicket = {
        ...item,
        status: 'Escalated',
        priority: 'Urgent', // Automatic bump to Urgent
        escalatedAt: new Date().toISOString(),
        escalatedOverdueHours: overdueHours,
        originalAssignedOfficer: item.assignedOfficer,
        assignedOfficer: `${supervisor.name} (${supervisor.designation}) [Direct Directive: Smt. Kavitha Reddi, Municipal Commissioner]`,
        assignedOfficerContact: supervisor.phone,
        timeline: [
          ...(item.timeline || []),
          {
            status: 'Escalated',
            timestamp: new Date().toISOString(),
            officerName: 'Statutory SLA Enforcement System',
            note: `[AUTOMATIC STATUTORY ESCALATION] Ticket breached SLA deadline by ${overdueHours} hours. Re-allocated from field staff to Supervising ${supervisor.designation} (${supervisor.name}) and Municipal Commissioner. Formal Show-Cause Notice issued to defaulting staff under Civil Service Conduct Rules.`
          }
        ]
      };

      newEscalations.push(escalatedTicket);
      return escalatedTicket;
    }

    return item;
  });

  if (hasRosterChanges) {
    saveStoredRoster(roster);
  }

  return {
    grievances: updatedGrievances,
    roster,
    hasChanges: hasGrievanceChanges,
    escalatedCount: newEscalations.length,
    newEscalations
  };
}

/**
 * Officer submits explanation for Strike 1 Show Cause Notice
 */
export function submitOfficerExplanation(officerId, ticketId, explanationText) {
  const roster = getStoredRoster();
  const officer = roster.find(o => o.id === officerId || o.name === officerId);
  if (!officer) return { success: false, message: 'Officer not found in roster.' };

  officer.explanations = officer.explanations || [];
  officer.explanations.push({
    id: `EXP-${Date.now()}`,
    ticketId,
    explanationText,
    submittedAt: new Date().toISOString(),
    status: 'UNDER_REVIEW', // 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'
    reviewedBy: null,
    reviewedAt: null,
    adminRemarks: null
  });

  saveStoredRoster(roster);
  return { success: true, officer };
}

/**
 * Admin / Commissioner reviews and accepts or rejects officer's explanation
 */
export function reviewOfficerExplanation(officerId, explanationId, decision, adminRemarks = '') {
  const roster = getStoredRoster();
  const officer = roster.find(o => o.id === officerId);
  if (!officer) return { success: false, message: 'Officer not found.' };

  const exp = (officer.explanations || []).find(e => e.id === explanationId);
  if (!exp) return { success: false, message: 'Explanation record not found.' };

  exp.status = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
  exp.reviewedBy = 'Smt. Kavitha Reddi (Nodal Commissioner)';
  exp.reviewedAt = new Date().toISOString();
  exp.adminRemarks = adminRemarks;

  if (decision === 'ACCEPT') {
    // If explanation accepted, forgive strike 1 if currently explanation required
    if (officer.disciplinaryStatus === 'EXPLANATION_REQUIRED') {
      officer.slaBreachesCount = Math.max(0, (officer.slaBreachesCount || 1) - 1);
      const evalRes = evaluateDisciplinaryStatus(officer.slaBreachesCount);
      officer.disciplinaryStatus = evalRes.status;
      officer.disciplinaryBadge = evalRes.badge;
    }
  }

  saveStoredRoster(roster);
  return { success: true, officer, explanation: exp };
}

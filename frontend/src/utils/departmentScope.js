// frontend/src/utils/departmentScope.js
// Frontend department-normalization utility matching backend/src/middleware/departmentAuth.js

export const normalizeDepartment = (dept) => String(dept || '').trim().toLowerCase();

const DEPARTMENT_GROUPS = {
  'water supply & sanitation': 'water_supply',
  'public works & infrastructure': 'public_works',
  'health & hygiene': 'health',
  'public health & safety': 'health',
  'revenue & taxation': 'revenue',
  'revenue & vital statistics': 'revenue',
  'revenue & land records': 'revenue',
  'revenue & municipal land records': 'revenue',
  'commercial & trade licensing': 'commercial',
  'electrical & infrastructure': 'electrical',
  'energy & power distribution (discom)': 'electrical',
  'town planning & environment': 'town_planning',
  'transport & road safety': 'transport',
  'food, civil supplies & consumer affairs': 'civil_supplies',
  'social welfare & empowerment': 'social_welfare'
};

export const resolveDepartmentKey = (dept) => {
  const norm = normalizeDepartment(dept);
  if (!norm) return '';
  return DEPARTMENT_GROUPS[norm] || norm;
};

export const isSameDepartment = (officerDept, targetDept) => {
  const keyA = resolveDepartmentKey(officerDept);
  const keyB = resolveDepartmentKey(targetDept);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
};

export const isTicketAssignedToOfficer = (grievance, user) => {
  if (!grievance || !user) return false;
  const assigned = String(grievance.assignedOfficer || '').toLowerCase();
  if (!assigned || assigned.includes('pending dispatch')) return false;
  const fullName = String(user.fullName || '').replace(/^er\.\s*/i, '').trim().toLowerCase();
  const emailUser = String(user.email || '').split('@')[0].replace('.', ' ').toLowerCase();
  return (fullName && assigned.includes(fullName)) || (emailUser && assigned.includes(emailUser));
};

// backend/src/middleware/departmentAuth.js
// Department-scoping & optional JWT authentication helpers for strict RBAC boundaries

const { verifyToken } = require('./authMiddleware');

/**
 * Normalizes a department string for comparison.
 */
const normalizeDepartment = (dept) => String(dept || '').trim().toLowerCase();

/**
 * Maps sub-divisions of the same statutory municipal wing while keeping distinct wings isolated.
 * E.g., Water Supply officers never match Revenue, Birth Certificate, or Public Works records.
 */
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

const resolveDepartmentKey = (dept) => {
  const norm = normalizeDepartment(dept);
  if (!norm) return '';
  return DEPARTMENT_GROUPS[norm] || norm;
};

/**
 * Returns true if the officer's department matches the target record's department.
 */
const isSameDepartment = (officerDept, targetDept) => {
  const keyA = resolveDepartmentKey(officerDept);
  const keyB = resolveDepartmentKey(targetDept);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
};

/**
 * Attaches req.user when a valid Bearer JWT is provided, without rejecting anonymous public requests.
 */
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers && req.headers.authorization;
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    return next();
  }

  let finished = false;
  const finishOnce = () => {
    if (!finished) {
      finished = true;
      next();
    }
  };

  // Delegate token verification to verifyToken so secret and claim format remain single-source
  const mockRes = {
    status: () => ({ json: finishOnce }),
    json: finishOnce
  };

  verifyToken(req, mockRes, finishOnce);
};

/**
 * Blocks OFFICER users from Admin-only infrastructure/global command routes,
 * while preserving Citizen/public route compatibility when unauthenticated unless verifyToken precedes it.
 */
const forbidOfficer = (req, res, next) => {
  if (req.user && req.user.role === 'OFFICER') {
    return res.status(403).json({
      error: 'FORBIDDEN_ROLE',
      message: 'Department officers are not permitted to access municipal control-room administration endpoints.'
    });
  }
  return next();
};

module.exports = {
  normalizeDepartment,
  resolveDepartmentKey,
  isSameDepartment,
  optionalVerifyToken,
  forbidOfficer
};

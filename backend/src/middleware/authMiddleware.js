const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'janseva_dev_jwt_secret_key_2026_super_secure';

/**
 * Middleware to verify JWT token from Authorization header (Bearer <token>)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access denied. Missing or invalid Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, userId, email, role, department }
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token signature is invalid or expired. Please login again.'
    });
  }
};

/**
 * Higher-order Role-Based Access Control (RBAC) middleware
 * @param  {...string} allowedRoles Allowed user roles (e.g. 'ADMIN', 'OFFICER')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication required prior to access.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN_ROLE',
        message: `Role '${req.user.role}' is not authorized to access this governance resource. Required: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};

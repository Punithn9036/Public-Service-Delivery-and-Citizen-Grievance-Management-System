const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'janseva_dev_jwt_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Mock in-memory store synchronized with DB seed records
const userStore = [
  {
    id: 1,
    userId: 'USR-CIT-001',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    role: 'CITIZEN',
    department: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 'USR-OFF-012',
    fullName: 'Er. Rajesh Varma',
    email: 'rajesh.varma@gov.in',
    phone: '+91 94433 11223',
    passwordHash: bcrypt.hashSync('Officer123!', 10),
    role: 'OFFICER',
    department: 'Water Supply & Sanitation',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    userId: 'USR-ADM-001',
    fullName: 'Smt. Kavitha Reddi',
    email: 'admin.controlroom@gov.in',
    phone: '+91 94411 99887',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    role: 'ADMIN',
    department: 'Municipal Governance',
    createdAt: new Date().toISOString()
  }
];

/**
 * Register a new citizen or officer account
 */
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, department } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'fullName, email, phone, and password are required.'
      });
    }

    const existingUser = userStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        error: 'USER_EXISTS',
        message: 'A user account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const assignedRole = role && ['CITIZEN', 'OFFICER', 'ADMIN', 'SUPERVISOR'].includes(role.toUpperCase()) 
      ? role.toUpperCase() 
      : 'CITIZEN';

    const newUserId = `USR-${assignedRole.slice(0, 3)}-${Math.floor(100 + Math.random() * 899)}`;
    const newUser = {
      id: userStore.length + 1,
      userId: newUserId,
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: assignedRole,
      department: assignedRole === 'CITIZEN' ? null : (department || 'General Administration'),
      createdAt: new Date().toISOString()
    };

    userStore.push(newUser);

    const token = jwt.sign(
      {
        id: newUser.id,
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        userId: newUser.userId,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        department: newUser.department,
        createdAt: newUser.createdAt
      }
    });

  } catch (err) {
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: err.message
    });
  }
};

/**
 * Authenticate existing user & issue JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required.'
      });
    }

    const user = userStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        userId: user.userId,
        email: user.email,
        role: user.role,
        department: user.department
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: err.message
    });
  }
};

/**
 * Return current authenticated user details
 */
const getProfile = async (req, res) => {
  const user = userStore.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User profile not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt
    }
  });
};

module.exports = {
  register,
  login,
  getProfile
};

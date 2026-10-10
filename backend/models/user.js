// backend/models/user.js
// Universal database model for user accounts
const db = require('../src/db');

module.exports = {
  // Insert a new user and return the created record
  async create({ userId, employeeId = null, email, passwordHash, role = 'CITIZEN', fullName, phone, department = null, designation = null }) {
    return await db.createUser({ userId, employeeId, email, passwordHash, role, fullName, phone, department, designation });
  },

  // Find a user by email
  async findByEmail(email) {
    return await db.findUserByEmail(email);
  },

  // Find a user by phone
  async findByPhone(phone) {
    return await db.findUserByPhone(phone);
  },

  // Find a user by employeeId
  async findByEmployeeId(employeeId) {
    return await db.findUserByEmployeeId(employeeId);
  },

  // Find a user by any identifier (email, phone, employeeId, userId)
  async findByIdentifier(identifier) {
    return await db.findUserByIdentifier(identifier);
  },

  // Update user phone number
  async updatePhone(idOrUserId, phone) {
    return await db.updateUserPhone(idOrUserId, phone);
  },

  // Find a user by ID
  async findById(id) {
    return await db.findUserById(id);
  },

  // Find a user by userId string (e.g. USR-CIT-001)
  async findByUserId(userId) {
    return await db.findUserByUserId(userId);
  },

  // Get all users
  async findAll() {
    return await db.getUsers();
  },

  // ==================== GOVERNMENT EMPLOYEES ====================
  async findGovernmentEmployeeById(employeeId) {
    return await db.findGovernmentEmployeeById(employeeId);
  },

  async getGovernmentEmployees() {
    return await db.getGovernmentEmployees();
  },

  async markEmployeeAsRegistered(employeeId, userId) {
    return await db.markEmployeeAsRegistered(employeeId, userId);
  }
};

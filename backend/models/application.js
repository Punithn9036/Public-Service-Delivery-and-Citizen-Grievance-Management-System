// backend/models/application.js
// Universal database model for Service Applications
const db = require('../src/db');

module.exports = {
  async create(data) {
    return await db.createServiceApplication(data);
  },

  async findById(id) {
    return await db.findApplicationById(id);
  },

  async findAll(filters = {}) {
    return await db.getServiceApplications(filters);
  },

  async updateStatus(id, updateData) {
    return await db.updateApplicationStatus(id, updateData);
  }
};

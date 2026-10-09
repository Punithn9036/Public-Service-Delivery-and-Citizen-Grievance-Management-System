// backend/models/service.js
// Universal database model for Public Services Catalog
const db = require('../src/db');

module.exports = {
  async findAll() {
    return await db.getPublicServices();
  },

  async findById(id) {
    return await db.findServiceById(id);
  }
};

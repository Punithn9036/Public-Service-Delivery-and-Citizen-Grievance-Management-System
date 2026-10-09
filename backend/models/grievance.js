// backend/models/grievance.js
// Universal database model for Grievances, Timelines, and Feedback
const db = require('../src/db');

module.exports = {
  // Create a new grievance and initial timeline entry
  async create(data) {
    return await db.createGrievance(data);
  },

  // Find a grievance by ID
  async findById(id) {
    return await db.findGrievanceById(id);
  },

  // Query grievances with optional filters
  async findAll(filters = {}) {
    return await db.getGrievances(filters);
  },

  // Update grievance status and append timeline
  async updateStatus(id, updateData) {
    return await db.updateGrievanceStatus(id, updateData);
  },

  // Upvote community report
  async upvote(id, citizenName) {
    return await db.upvoteGrievance(id, citizenName);
  },

  // Submit feedback
  async submitFeedback(id, feedbackData) {
    return await db.submitGrievanceFeedback(id, feedbackData);
  }
};

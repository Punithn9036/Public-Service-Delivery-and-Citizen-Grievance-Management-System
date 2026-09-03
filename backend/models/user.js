// backend/models/user.js
// PostgreSQL model for user accounts (no ORM, plain pg pool)

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  // Insert a new user and return the created record
  async create({ email, passwordHash, role = 'CITIZEN', fullName, phone, department = null }) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [email, passwordHash, role, fullName, phone, department]
    );
    return res.rows[0];
  },

  // Find a user by email
  async findByEmail(email) {
    const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return res.rows[0];
  },

  // Find a user by ID
  async findById(id) {
    const res = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return res.rows[0];
  }
};

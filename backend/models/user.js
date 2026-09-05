// backend/models/user.js
// PostgreSQL model for user accounts
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://janseva_admin:janseva_password@localhost:5432/janseva_db'
});

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    department: row.department,
    createdAt: row.created_at
  };
}

module.exports = {
  // Insert a new user and return the created record
  async create({ userId, email, passwordHash, role = 'CITIZEN', fullName, phone, department = null }) {
    const generatedUserId = userId || `USR-${role.slice(0, 3)}-${Math.floor(100 + Math.random() * 899)}`;
    const res = await pool.query(
      `INSERT INTO users (user_id, email, password_hash, role, full_name, phone, department) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [generatedUserId, email.toLowerCase(), passwordHash, role, fullName, phone, department]
    );
    return formatUser(res.rows[0]);
  },

  // Find a user by email
  async findByEmail(email) {
    const res = await pool.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
    return formatUser(res.rows[0]);
  },

  // Find a user by ID
  async findById(id) {
    const res = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return formatUser(res.rows[0]);
  },

  // Find a user by userId string (e.g. USR-CIT-001)
  async findByUserId(userId) {
    const res = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
    return formatUser(res.rows[0]);
  }
};

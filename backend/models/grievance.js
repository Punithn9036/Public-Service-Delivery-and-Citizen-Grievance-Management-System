// backend/models/grievance.js
// PostgreSQL model for Grievances, Timelines, and Feedback
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://janseva_admin:janseva_password@localhost:5432/janseva_db'
});

function formatGrievance(row, timeline = [], feedback = null) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    department: row.department,
    description: row.description,
    location: row.location,
    landmark: row.landmark,
    priority: row.priority,
    status: row.status,
    citizenName: row.citizen_name,
    citizenPhone: row.citizen_phone,
    citizenEmail: row.citizen_email,
    assignedOfficer: row.assigned_officer,
    assignedOfficerContact: row.assigned_officer_contact,
    ipfsDocumentCid: row.ipfs_document_cid,
    fabricTxId: row.fabric_tx_id,
    slaDeadline: row.sla_deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline: timeline.map(t => ({
      id: t.id,
      status: t.status,
      officerName: t.officer_name,
      note: t.note,
      fabricTxId: t.fabric_tx_id,
      timestamp: t.timestamp
    })),
    feedback: feedback ? {
      rating: feedback.rating,
      comment: feedback.comment,
      submittedAt: feedback.created_at
    } : null
  };
}

module.exports = {
  // Create a new grievance and initial timeline entry
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertGrievanceQuery = `
        INSERT INTO grievances (
          id, title, category, department, description, location, landmark,
          priority, status, citizen_name, citizen_phone, citizen_email,
          assigned_officer, assigned_officer_contact, ipfs_document_cid,
          fabric_tx_id, sla_deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const values = [
        data.id,
        data.title,
        data.category,
        data.department,
        data.description,
        data.location,
        data.landmark || null,
        data.priority || 'Medium',
        data.status || 'Submitted',
        data.citizenName,
        data.citizenPhone,
        data.citizenEmail || null,
        data.assignedOfficer || null,
        data.assignedOfficerContact || null,
        data.ipfsDocumentCid || null,
        data.fabricTxId || null,
        data.slaDeadline
      ];

      const res = await client.query(insertGrievanceQuery, values);
      const grievanceRow = res.rows[0];

      // Insert initial timeline entry
      const insertTimelineQuery = `
        INSERT INTO grievance_timeline (grievance_id, status, officer_name, note, fabric_tx_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const timelineRes = await client.query(insertTimelineQuery, [
        data.id,
        data.status || 'Submitted',
        'System Automated Dispatcher',
        'Grievance ticket lodged by citizen and recorded on immutable ledger.',
        data.fabricTxId || null
      ]);

      await client.query('COMMIT');
      return formatGrievance(grievanceRow, timelineRes.rows, null);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Get all grievances with filters
  async findAll({ department, status, citizenPhone } = {}) {
    let query = 'SELECT * FROM grievances WHERE 1=1';
    const params = [];

    if (department) {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (citizenPhone) {
      params.push(citizenPhone);
      query += ` AND citizen_phone = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const res = await pool.query(query, params);
    
    // Fetch timelines and feedback
    const grievances = await Promise.all(res.rows.map(async row => {
      const timelineRes = await pool.query(
        'SELECT * FROM grievance_timeline WHERE grievance_id = $1 ORDER BY timestamp ASC',
        [row.id]
      );
      const feedbackRes = await pool.query(
        'SELECT * FROM grievance_feedback WHERE grievance_id = $1',
        [row.id]
      );
      return formatGrievance(row, timelineRes.rows, feedbackRes.rows[0] || null);
    }));

    return grievances;
  },

  // Find single grievance by ID
  async findById(id) {
    const res = await pool.query('SELECT * FROM grievances WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;

    const timelineRes = await pool.query(
      'SELECT * FROM grievance_timeline WHERE grievance_id = $1 ORDER BY timestamp ASC',
      [id]
    );
    const feedbackRes = await pool.query(
      'SELECT * FROM grievance_feedback WHERE grievance_id = $1',
      [id]
    );

    return formatGrievance(res.rows[0], timelineRes.rows, feedbackRes.rows[0] || null);
  },

  // Update grievance status and append timeline
  async updateStatus(id, { nextStatus, officerName, officerContact, note, fabricTxId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateQuery = `
        UPDATE grievances
        SET status = $1,
            assigned_officer = COALESCE($2, assigned_officer),
            assigned_officer_contact = COALESCE($3, assigned_officer_contact),
            fabric_tx_id = COALESCE($4, fabric_tx_id)
        WHERE id = $5
        RETURNING *
      `;
      const res = await client.query(updateQuery, [nextStatus, officerName, officerContact, fabricTxId, id]);
      if (res.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const insertTimeline = `
        INSERT INTO grievance_timeline (grievance_id, status, officer_name, note, fabric_tx_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      await client.query(insertTimeline, [
        id,
        nextStatus,
        officerName || 'Duty Officer',
        note || `Status transitioned to ${nextStatus}`,
        fabricTxId || null
      ]);

      await client.query('COMMIT');

      const timelineRes = await pool.query(
        'SELECT * FROM grievance_timeline WHERE grievance_id = $1 ORDER BY timestamp ASC',
        [id]
      );
      const feedbackRes = await pool.query(
        'SELECT * FROM grievance_feedback WHERE grievance_id = $1',
        [id]
      );

      return formatGrievance(res.rows[0], timelineRes.rows, feedbackRes.rows[0] || null);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Submit citizen feedback
  async submitFeedback(id, { rating, comment }) {
    const res = await pool.query(
      `INSERT INTO grievance_feedback (grievance_id, rating, comment)
       VALUES ($1, $2, $3)
       ON CONFLICT (grievance_id) DO UPDATE SET rating = $2, comment = $3, created_at = NOW()
       RETURNING *`,
      [id, rating, comment]
    );
    return res.rows[0];
  }
};

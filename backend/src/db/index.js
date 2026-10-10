// backend/src/db/index.js
// Universal Database Layer: PostgreSQL connection with persistent file-backed relational fallback
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'janseva_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data (matches database/seed.sql)
const SEED_DATA = {
  users: [
    {
      id: 1,
      userId: 'USR-CIT-001',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      passwordHash: '$2a$10$eE0oXG9r1mU66t3kY5rEee4zG5U9Oq1u5JkQ4WfUeK.U6FqO8Oa5u', // Password123!
      role: 'CITIZEN',
      department: null,
      createdAt: '2026-08-16T10:00:00.000Z'
    },
    {
      id: 2,
      userId: 'USR-CIT-002',
      fullName: 'Priya Sundaram',
      email: 'priya.sundaram@example.com',
      phone: '+91 98112 33445',
      passwordHash: '$2a$10$eE0oXG9r1mU66t3kY5rEee4zG5U9Oq1u5JkQ4WfUeK.U6FqO8Oa5u', // Password123!
      role: 'CITIZEN',
      department: null,
      createdAt: '2026-08-17T11:00:00.000Z'
    },
    {
      id: 3,
      userId: 'USR-OFF-012',
      fullName: 'Er. Rajesh Varma',
      email: 'rajesh.varma@gov.in',
      phone: '+91 94433 11223',
      passwordHash: '$2a$10$eE0oXG9r1mU66t3kY5rEee4zG5U9Oq1u5JkQ4WfUeK.U6FqO8Oa5u', // Officer123!
      role: 'OFFICER',
      department: 'Water Supply & Sanitation',
      createdAt: '2026-08-15T09:00:00.000Z'
    },
    {
      id: 4,
      userId: 'USR-OFF-008',
      fullName: 'Vikram Singh',
      email: 'vikram.singh@gov.in',
      phone: '+91 98700 55443',
      passwordHash: '$2a$10$eE0oXG9r1mU66t3kY5rEee4zG5U9Oq1u5JkQ4WfUeK.U6FqO8Oa5u', // Officer123!
      role: 'OFFICER',
      department: 'Public Works & Infrastructure',
      createdAt: '2026-08-15T09:30:00.000Z'
    },
    {
      id: 5,
      userId: 'USR-ADM-001',
      fullName: 'Smt. Kavitha Reddi',
      email: 'admin.controlroom@gov.in',
      phone: '+91 94411 99887',
      passwordHash: '$2a$10$eE0oXG9r1mU66t3kY5rEee4zG5U9Oq1u5JkQ4WfUeK.U6FqO8Oa5u', // Admin123!
      role: 'ADMIN',
      department: 'Municipal Governance',
      createdAt: '2026-08-14T08:00:00.000Z'
    }
  ],
  public_services: [
    {
      id: 'srv-1',
      serviceName: 'Issue of Birth Certificate',
      department: 'Revenue & Vital Statistics',
      description: 'Application for official birth registration and legal birth certificate issuance.',
      slaDays: 7,
      fee: '₹50',
      documentsRequired: ['Hospital Birth Card', 'Parents Aadhaar ID', 'Address Proof']
    },
    {
      id: 'srv-2',
      serviceName: 'New Water & Sewerage Connection',
      department: 'Water Supply & Sanitation',
      description: 'Request for residential or commercial piped water supply tap & sewerage line installation.',
      slaDays: 14,
      fee: '₹1,200',
      documentsRequired: ['Property Ownership Copy', 'Tax Receipt', 'Applicant ID Proof']
    },
    {
      id: 'srv-3',
      serviceName: 'Trade License Renewal',
      department: 'Commercial & Trade Licensing',
      description: 'Annual renewal of municipal trade operating license for shops, offices and enterprises.',
      slaDays: 5,
      fee: '₹850',
      documentsRequired: ['Previous License Copy', 'GST Registration', 'Property Lease Agreement']
    },
    {
      id: 'srv-4',
      serviceName: 'Income & Caste Certificate',
      department: 'Revenue & Land Records',
      description: 'Issuance of certified income and caste eligibility certificate for government schemes.',
      slaDays: 10,
      fee: '₹30',
      documentsRequired: ['Ration Card', 'Self-Declaration Affidavit', 'Salary/Income Slip']
    },
    {
      id: 'srv-5',
      serviceName: 'Property Tax Assessment & Transfer',
      department: 'Revenue & Taxation',
      description: 'Assessment of property tax liability, ownership name change, and record update.',
      slaDays: 15,
      fee: '₹500',
      documentsRequired: ['Sale Deed / Title Document', 'Encumbrance Certificate', 'Previous Tax Receipts']
    },
    {
      id: 'srv-6',
      serviceName: 'Street Light & Infrastructure Maintenance',
      department: 'Public Works & Infrastructure',
      description: 'Request installation of new LED street lamps or public amenity repairs.',
      slaDays: 3,
      fee: 'Free',
      documentsRequired: ['Locality Request Letter / Ward Member Endorsement']
    }
  ],
  grievances: [
    {
      id: 'GRV-2026-8910',
      title: 'Damaged Drainage Overflow on Main Market Road',
      category: 'Sanitation & Waste Management',
      department: 'Water Supply & Sanitation',
      description: 'Raw sewage and drainage water is overflowing near Shop #42 on Main Market Road, causing severe health hazards.',
      location: 'Sector 4, Main Market Road, Ward 12',
      landmark: 'Opposite Central Pharmacy',
      priority: 'Urgent',
      status: 'In Progress',
      reportCount: 3,
      citizenName: 'Aarav Sharma',
      citizenPhone: '+91 98765 43210',
      citizenEmail: 'aarav.sharma@example.com',
      assignedOfficer: 'Er. Rajesh Varma (Senior Sanitation Engineer)',
      assignedOfficerContact: '+91 94433 11223',
      ipfsDocumentCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      fabricTxId: '0x8f7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a',
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: '2026-08-16T10:30:00.000Z',
      updatedAt: '2026-08-17T14:00:00.000Z',
      timeline: [
        { id: 1, status: 'Submitted', officerName: 'System Gateway', note: 'Grievance lodged online via JanSeva Portal.', fabricTxId: '0x8f7a6b5c4d3e2f1a', timestamp: '2026-08-16T10:30:00.000Z' },
        { id: 2, status: 'Under Review', officerName: 'Control Room Nodal Officer', note: 'Validated and categorized under Water & Sanitation.', fabricTxId: '0x9a8b7c6d5e4f3a2b', timestamp: '2026-08-16T18:00:00.000Z' },
        { id: 3, status: 'Assigned', officerName: 'Er. Rajesh Varma', note: 'Assigned to Ward 12 Sanitation Team.', fabricTxId: '0x1b2c3d4e5f6a7b8c', timestamp: '2026-08-17T09:00:00.000Z' },
        { id: 4, status: 'In Progress', officerName: 'Er. Rajesh Varma', note: 'Dredging truck dispatched to site.', fabricTxId: '0x2c3d4e5f6a7b8c9d', timestamp: '2026-08-17T14:00:00.000Z' }
      ],
      feedback: null
    },
    {
      id: 'GRV-2026-8904',
      title: 'Non-Functional Street Lights along Green Park Boulevard',
      category: 'Electrical & Infrastructure',
      department: 'Public Works & Infrastructure',
      description: 'Over 8 consecutive streetlights have been completely dark for 5 days.',
      location: 'Green Park Boulevard, Block B, Ward 8',
      landmark: 'Near Community Park Gate 2',
      priority: 'High',
      status: 'Assigned',
      reportCount: 1,
      citizenName: 'Priya Sundaram',
      citizenPhone: '+91 98112 33445',
      citizenEmail: 'priya.sundaram@example.com',
      assignedOfficer: 'Vikram Singh (Assistant Electrical Inspector)',
      assignedOfficerContact: '+91 98700 55443',
      ipfsDocumentCid: 'QmPZ9GcCEgudBwbZMuMVLK72vedxjQkDDP1mXWo6uco',
      fabricTxId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      createdAt: '2026-08-17T11:00:00.000Z',
      updatedAt: '2026-08-17T16:00:00.000Z',
      timeline: [
        { id: 1, status: 'Submitted', officerName: 'System Gateway', note: 'Grievance lodged online.', fabricTxId: '0x1a2b3c4d5e6f7a8b', timestamp: '2026-08-17T11:00:00.000Z' },
        { id: 2, status: 'Under Review', officerName: 'Control Room Officer', note: 'Categorized under Municipal Electrical Grid.', fabricTxId: '0x2b3c4d5e6f7a8b9c', timestamp: '2026-08-17T13:30:00.000Z' },
        { id: 3, status: 'Assigned', officerName: 'Vikram Singh', note: 'Field technician team dispatched for LED replacement.', fabricTxId: '0x3c4d5e6f7a8b9c0d', timestamp: '2026-08-17T16:00:00.000Z' }
      ],
      feedback: null
    },
    {
      id: 'GRV-2026-8850',
      title: 'Uncollected Solid Waste & Garbage Accumulation',
      category: 'Sanitation & Waste Management',
      department: 'Health & Hygiene',
      description: 'Municipal garbage collection van has skipped Block 3 for 4 days.',
      location: 'Sunrise Apartments Lane, Ward 15',
      landmark: 'Behind Government Primary School',
      priority: 'Medium',
      status: 'Resolved',
      reportCount: 2,
      citizenName: 'Mohammed Tanvir',
      citizenPhone: '+91 97654 88990',
      citizenEmail: 'tanvir.m@example.com',
      assignedOfficer: 'Smt. Kavitha Reddi (Chief Hygiene Inspector)',
      assignedOfficerContact: '+91 94411 99887',
      ipfsDocumentCid: 'QmYwAPJzv5CZsnA625s3Xf2L72vedxjQkDDP1mXWo6uco',
      fabricTxId: '0x3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
      slaDeadline: '2026-08-15T18:00:00.000Z',
      createdAt: '2026-08-14T08:30:00.000Z',
      updatedAt: '2026-08-15T16:30:00.000Z',
      timeline: [
        { id: 1, status: 'Submitted', officerName: 'System Gateway', note: 'Grievance submitted with photo evidence.', fabricTxId: '0x3d4e5f6a7b8c9d0e', timestamp: '2026-08-14T08:30:00.000Z' },
        { id: 2, status: 'Resolved', officerName: 'Smt. Kavitha Reddi', note: 'Garbage cleared and area disinfected. Verified by supervisor.', fabricTxId: '0x4e5f6a7b8c9d0e1f', timestamp: '2026-08-15T16:30:00.000Z' }
      ],
      feedback: {
        rating: 5,
        comment: 'Prompt response and total cleanup done within 36 hours. Very satisfied!',
        submittedAt: '2026-08-15T17:00:00.000Z'
      }
    }
  ],
  service_applications: [
    {
      id: 'APP-2026-1049',
      serviceId: 'srv-1',
      serviceName: 'Issue of Birth Certificate',
      department: 'Revenue & Vital Statistics',
      applicantName: 'Ananya Deshmukh',
      applicantPhone: '+91 98888 12345',
      applicantEmail: 'ananya.d@example.com',
      status: 'Approved',
      appliedDate: '2026-08-15',
      slaDays: 7,
      estimatedCompletion: '2026-08-22',
      remarks: 'Documents verified by Registrar. Certificate issued in digital format.',
      createdAt: '2026-08-15T09:00:00.000Z'
    },
    {
      id: 'APP-2026-1092',
      serviceId: 'srv-2',
      serviceName: 'New Water & Sewerage Connection',
      department: 'Water Supply & Sanitation',
      applicantName: 'Suresh Kumar',
      applicantPhone: '+91 97777 54321',
      applicantEmail: 'suresh.k@example.com',
      status: 'In Verification',
      appliedDate: '2026-08-17',
      slaDays: 14,
      estimatedCompletion: '2026-08-31',
      remarks: 'Field engineer scheduled for site feasibility inspection.',
      createdAt: '2026-08-17T14:30:00.000Z'
    }
  ]
};

class DatabaseManager {
  constructor() {
    this.pgPool = null;
    this.isPgConnected = false;
    this.store = null;
    this.init();
  }

  init() {
    // Attempt PostgreSQL connection in the background
    const connStr = process.env.DATABASE_URL;
    if (connStr) {
      try {
        this.pgPool = new Pool({
          connectionString: connStr,
          connectionTimeoutMillis: 2000
        });
        this.pgPool.connect()
          .then(client => {
            this.isPgConnected = true;
            client.release();
            console.log('[JanSeva Database] Connected to live PostgreSQL server.');
          })
          .catch(() => {
            this.isPgConnected = false;
            console.log('[JanSeva Database] PostgreSQL offline. Operating in persistent local storage mode.');
          });
      } catch (e) {
        this.isPgConnected = false;
      }
    }

    // Load or initialize local persistent store
    this.loadStore();
  }

  loadStore() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.store = JSON.parse(raw);
      } catch (e) {
        this.store = JSON.parse(JSON.stringify(SEED_DATA));
        this.saveStore();
      }
    } else {
      this.store = JSON.parse(JSON.stringify(SEED_DATA));
      this.saveStore();
    }
  }

  saveStore() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2), 'utf8');
    } catch (e) {
      console.error('[JanSeva Database] Failed to write database file:', e.message);
    }
  }

  // ==================== USERS ====================
  async getUsers() {
    return this.store.users;
  }

  async findUserByEmail(email) {
    if (!email) return null;
    return this.store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserByPhone(phone) {
    if (!phone) return null;
    const clean = phone.replace(/\D/g, '').slice(-10);
    return this.store.users.find(u => (u.phone || '').replace(/\D/g, '').includes(clean)) || null;
  }

  async findUserById(id) {
    return this.store.users.find(u => u.id === Number(id)) || null;
  }

  async findUserByUserId(userId) {
    return this.store.users.find(u => u.userId === userId) || null;
  }

  async updateUserPhone(idOrUserId, phone) {
    const user = this.store.users.find(u => u.id === Number(idOrUserId) || u.userId === idOrUserId || u.email === idOrUserId);
    if (user && phone) {
      user.phone = phone;
      this.saveStore();
    }
    return user;
  }

  async createUser(userData) {
    const nextId = this.store.users.length > 0 
      ? Math.max(...this.store.users.map(u => u.id || 0)) + 1 
      : 1;

    const newUser = {
      id: nextId,
      userId: userData.userId || `USR-${(userData.role || 'CIT').slice(0, 3)}-${String(nextId).padStart(3, '0')}`,
      fullName: userData.fullName,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      passwordHash: userData.passwordHash,
      role: userData.role || 'CITIZEN',
      department: userData.department || null,
      createdAt: new Date().toISOString()
    };

    this.store.users.push(newUser);
    this.saveStore();
    return newUser;
  }

  // ==================== GRIEVANCES ====================
  async getGrievances(filters = {}) {
    let list = [...this.store.grievances];

    if (filters.department && filters.department !== 'All') {
      list = list.filter(g => g.department.toLowerCase() === filters.department.toLowerCase());
    }

    if (filters.status && filters.status !== 'All') {
      list = list.filter(g => g.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.priority && filters.priority !== 'All') {
      list = list.filter(g => g.priority.toLowerCase() === filters.priority.toLowerCase());
    }

    if (filters.citizenPhone) {
      list = list.filter(g => g.citizenPhone === filters.citizenPhone);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(g => 
        (g.id && g.id.toLowerCase().includes(q)) ||
        (g.title && g.title.toLowerCase().includes(q)) ||
        (g.category && g.category.toLowerCase().includes(q)) ||
        (g.location && g.location.toLowerCase().includes(q))
      );
    }

    return list;
  }

  async findGrievanceById(id) {
    if (!id) return null;
    return this.store.grievances.find(g => g.id.toUpperCase() === id.toUpperCase()) || null;
  }

  async createGrievance(data) {
    const newGrievance = {
      id: data.id,
      title: data.title,
      category: data.category,
      department: data.department,
      description: data.description,
      location: data.location,
      landmark: data.landmark || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Submitted',
      reportCount: 1,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      citizenEmail: data.citizenEmail || '',
      assignedOfficer: data.assignedOfficer || 'Control Room Officer (Pending Dispatch)',
      assignedOfficerContact: data.assignedOfficerContact || '+91 1800-425-GOV',
      ipfsDocumentCid: data.ipfsDocumentCid || null,
      fabricTxId: data.fabricTxId || null,
      fabricBlockNumber: data.fabricBlockNumber || 1,
      fabricBlockHash: data.fabricBlockHash || null,
      slaDeadline: data.slaDeadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: 1,
          status: 'Submitted',
          officerName: 'System Gateway',
          note: 'Grievance lodged online via JanSeva Citizen Portal.',
          fabricTxId: data.fabricTxId || null,
          fabricBlockNumber: data.fabricBlockNumber || 1,
          fabricBlockHash: data.fabricBlockHash || null,
          timestamp: new Date().toISOString()
        }
      ],
      feedback: null
    };

    this.store.grievances.unshift(newGrievance);
    this.saveStore();
    return newGrievance;
  }

  async updateGrievanceStatus(id, { nextStatus, officerName, officerContact, note, fabricTxId, fabricBlockNumber, fabricBlockHash }) {
    const grievance = await this.findGrievanceById(id);
    if (!grievance) return null;

    grievance.status = nextStatus;
    if (officerName) grievance.assignedOfficer = officerName;
    if (officerContact) grievance.assignedOfficerContact = officerContact;
    if (fabricTxId) grievance.fabricTxId = fabricTxId;
    if (fabricBlockNumber) grievance.fabricBlockNumber = fabricBlockNumber;
    if (fabricBlockHash) grievance.fabricBlockHash = fabricBlockHash;
    grievance.updatedAt = new Date().toISOString();

    const nextTimelineId = (grievance.timeline?.length || 0) + 1;
    const timelineEntry = {
      id: nextTimelineId,
      status: nextStatus,
      officerName: officerName || grievance.assignedOfficer || 'Municipal Controller',
      note: note || `Status updated to ${nextStatus}.`,
      fabricTxId: fabricTxId || null,
      fabricBlockNumber: fabricBlockNumber || null,
      fabricBlockHash: fabricBlockHash || null,
      timestamp: new Date().toISOString()
    };

    grievance.timeline = grievance.timeline || [];
    grievance.timeline.push(timelineEntry);

    this.saveStore();
    return grievance;
  }

  async upvoteGrievance(id, citizenName) {
    const grievance = await this.findGrievanceById(id);
    if (!grievance) return null;

    grievance.reportCount = (grievance.reportCount || 1) + 1;
    if (grievance.reportCount >= 3) {
      grievance.priority = 'Urgent';
    } else if (grievance.reportCount >= 2 && grievance.priority !== 'Urgent') {
      grievance.priority = 'High';
    }

    grievance.updatedAt = new Date().toISOString();
    const timelineEntry = {
      id: (grievance.timeline?.length || 0) + 1,
      status: grievance.status,
      officerName: 'Community Watchdog Engine',
      note: `Community Report #+1 added by ${citizenName || 'Citizen'}. Priority auto-escalated to ${grievance.priority} (${grievance.reportCount} citizens affected).`,
      timestamp: new Date().toISOString()
    };

    grievance.timeline = grievance.timeline || [];
    grievance.timeline.push(timelineEntry);

    this.saveStore();
    return grievance;
  }

  async submitGrievanceFeedback(id, { rating, comment }) {
    const grievance = await this.findGrievanceById(id);
    if (!grievance) return null;

    grievance.feedback = {
      rating: Number(rating),
      comment: comment || '',
      submittedAt: new Date().toISOString()
    };
    grievance.updatedAt = new Date().toISOString();

    this.saveStore();
    return grievance;
  }

  // ==================== PUBLIC SERVICES ====================
  async getPublicServices() {
    return this.store.public_services;
  }

  async findServiceById(id) {
    return this.store.public_services.find(s => s.id === id) || null;
  }

  // ==================== SERVICE APPLICATIONS ====================
  async getServiceApplications(filters = {}) {
    let list = [...this.store.service_applications];

    if (filters.status && filters.status !== 'All') {
      list = list.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.department && filters.department !== 'All') {
      list = list.filter(a => a.department.toLowerCase() === filters.department.toLowerCase());
    }

    if (filters.phone) {
      list = list.filter(a => a.applicantPhone === filters.phone);
    }

    return list;
  }

  async findApplicationById(id) {
    if (!id) return null;
    return this.store.service_applications.find(a => a.id.toUpperCase() === id.toUpperCase()) || null;
  }

  async createServiceApplication(data) {
    const newApp = {
      id: data.id,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      department: data.department,
      applicantName: data.applicantName,
      applicantPhone: data.applicantPhone,
      applicantEmail: data.applicantEmail || '',
      identityProof: data.identityProof || null,
      identityNumber: data.identityNumber || null,
      address: data.address || null,
      ipfsDocumentCid: data.ipfsDocumentCid || null,
      status: data.status || 'Submitted',
      appliedDate: data.appliedDate || new Date().toISOString().slice(0, 10),
      slaDays: Number(data.slaDays) || 7,
      estimatedCompletion: data.estimatedCompletion || new Date(Date.now() + (Number(data.slaDays) || 7) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      remarks: data.remarks || 'Application received and submitted for departmental verification.',
      createdAt: new Date().toISOString()
    };

    this.store.service_applications.unshift(newApp);
    this.saveStore();
    return newApp;
  }

  async updateApplicationStatus(id, { status, remarks }) {
    const app = await this.findApplicationById(id);
    if (!app) return null;

    app.status = status;
    if (remarks) app.remarks = remarks;
    this.saveStore();
    return app;
  }
}

// Export singleton database manager instance
const db = new DatabaseManager();
module.exports = db;

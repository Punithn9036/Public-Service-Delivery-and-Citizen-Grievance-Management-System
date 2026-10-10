// backend/utils/officerRoster.js
// Sector-based Municipal Officer Directory & Round-Robin Duty Roster

const SECTORS = [
  'Sector 1 (North Zone)',
  'Sector 2 (South Zone)',
  'Sector 3 (East Zone)',
  'Sector 4 (West Zone)',
  'Sector 5 (Central Zone)'
];

const DEPARTMENTS = [
  'Public Works & Infrastructure',
  'Water Supply & Sanitation',
  'Electrical & Infrastructure',
  'Health & Hygiene',
  'Town Planning & Environment',
  'Revenue & Taxation',
  'Commercial & Trade Licensing'
];

/**
 * Initial Roster of Multi-Officer Cadre per Sector & Department
 * Each sector has designated officers for each municipal department.
 */
const INITIAL_OFFICERS = [
  // --- SECTOR 1 (NORTH ZONE) ---
  // Public Works (Roads) - Sector 1
  { id: 'OFF-S1-PWD-01', name: 'Er. Ramesh Kulkarni', department: 'Public Works & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 94481 11001', designation: 'Senior Highway Inspector' },
  { id: 'OFF-S1-PWD-02', name: 'Er. Alok Nath', department: 'Public Works & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 94481 11002', designation: 'Assistant PWD Engineer' },
  { id: 'OFF-S1-PWD-03', name: 'Er. Meenakshi Rao', department: 'Public Works & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 94481 11003', designation: 'Zonal Road Supervisor' },
  { id: 'OFF-S1-PWD-04', name: 'Er. Devendra Singh', department: 'Public Works & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 94481 11004', designation: 'Field Pavement Inspector' },

  // Water Supply - Sector 1
  { id: 'OFF-S1-WTR-01', name: 'Er. Rajesh Varma', department: 'Water Supply & Sanitation', sector: 'Sector 1 (North Zone)', phone: '+91 94433 11223', designation: 'Executive Sanitation Engineer' },
  { id: 'OFF-S1-WTR-02', name: 'Er. Sneha Hegde', department: 'Water Supply & Sanitation', sector: 'Sector 1 (North Zone)', phone: '+91 94433 11224', designation: 'Pipeline Maintenance Officer' },
  { id: 'OFF-S1-WTR-03', name: 'Er. Anand Belagavi', department: 'Water Supply & Sanitation', sector: 'Sector 1 (North Zone)', phone: '+91 94433 11225', designation: 'Sewerage Network Inspector' },

  // Electrical - Sector 1
  { id: 'OFF-S1-ELE-01', name: 'Er. Vikram Singh', department: 'Electrical & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 98700 55441', designation: 'Grid Operations Officer' },
  { id: 'OFF-S1-ELE-02', name: 'Er. Karthik Iyer', department: 'Electrical & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 98700 55442', designation: 'Streetlight Field Inspector' },
  { id: 'OFF-S1-ELE-03', name: 'Er. Sunita Verma', department: 'Electrical & Infrastructure', sector: 'Sector 1 (North Zone)', phone: '+91 98700 55443', designation: 'Substation Technician Lead' },

  // Health & Hygiene - Sector 1
  { id: 'OFF-S1-HLT-01', name: 'Dr. Kavitha Reddi', department: 'Health & Hygiene', sector: 'Sector 1 (North Zone)', phone: '+91 94411 99881', designation: 'Chief Sanitary Inspector' },
  { id: 'OFF-S1-HLT-02', name: 'Dr. Naveen Gowda', department: 'Health & Hygiene', sector: 'Sector 1 (North Zone)', phone: '+91 94411 99882', designation: 'Vector Control Supervisor' },
  { id: 'OFF-S1-HLT-03', name: 'Smt. Shailaja Patil', department: 'Health & Hygiene', sector: 'Sector 1 (North Zone)', phone: '+91 94411 99883', designation: 'Waste Management Nodal Officer' },

  // --- SECTOR 2 (SOUTH ZONE) ---
  // Public Works (Roads) - Sector 2
  { id: 'OFF-S2-PWD-01', name: 'Er. Suresh Babu', department: 'Public Works & Infrastructure', sector: 'Sector 2 (South Zone)', phone: '+91 94482 22001', designation: 'PWD Road Division Chief' },
  { id: 'OFF-S2-PWD-02', name: 'Er. Deepa Nair', department: 'Public Works & Infrastructure', sector: 'Sector 2 (South Zone)', phone: '+91 94482 22002', designation: 'Asphalt Quality Inspector' },
  { id: 'OFF-S2-PWD-03', name: 'Er. Harish Chandra', department: 'Public Works & Infrastructure', sector: 'Sector 2 (South Zone)', phone: '+91 94482 22003', designation: 'Bridge & Culvert Supervisor' },

  // Water Supply - Sector 2
  { id: 'OFF-S2-WTR-01', name: 'Er. Manoj Deshpande', department: 'Water Supply & Sanitation', sector: 'Sector 2 (South Zone)', phone: '+91 94432 22001', designation: 'Zonal Water Chief' },
  { id: 'OFF-S2-WTR-02', name: 'Er. Geeta Murthy', department: 'Water Supply & Sanitation', sector: 'Sector 2 (South Zone)', phone: '+91 94432 22002', designation: 'Drainage Restoration Engineer' },
  { id: 'OFF-S2-WTR-03', name: 'Er. Venkatesh Prasad', department: 'Water Supply & Sanitation', sector: 'Sector 2 (South Zone)', phone: '+91 94432 22003', designation: 'Pump House Superintendent' },

  // Electrical - Sector 2
  { id: 'OFF-S2-ELE-01', name: 'Er. Prakash Joshi', department: 'Electrical & Infrastructure', sector: 'Sector 2 (South Zone)', phone: '+91 98702 22001', designation: 'Electrical Grid Supervisor' },
  { id: 'OFF-S2-ELE-02', name: 'Er. Rohini Sen', department: 'Electrical & Infrastructure', sector: 'Sector 2 (South Zone)', phone: '+91 98702 22002', designation: 'Public Lighting Technician' },

  // Health - Sector 2
  { id: 'OFF-S2-HLT-01', name: 'Dr. Raghu Raman', department: 'Health & Hygiene', sector: 'Sector 2 (South Zone)', phone: '+91 94412 22001', designation: 'Senior Health Officer' },
  { id: 'OFF-S2-HLT-02', name: 'Smt. Fatima Bi', department: 'Health & Hygiene', sector: 'Sector 2 (South Zone)', phone: '+91 94412 22002', designation: 'Sanitation Enforcement Lead' },

  // --- SECTOR 3 (EAST ZONE) ---
  // Public Works (Roads) - Sector 3
  { id: 'OFF-S3-PWD-01', name: 'Er. Jagdish Bhatt', department: 'Public Works & Infrastructure', sector: 'Sector 3 (East Zone)', phone: '+91 94483 33001', designation: 'East Sector Highway Lead' },
  { id: 'OFF-S3-PWD-02', name: 'Er. Tanvi Sharma', department: 'Public Works & Infrastructure', sector: 'Sector 3 (East Zone)', phone: '+91 94483 33002', designation: 'Stormwater Drain Engineer' },
  { id: 'OFF-S3-PWD-03', name: 'Er. Mukesh Yadav', department: 'Public Works & Infrastructure', sector: 'Sector 3 (East Zone)', phone: '+91 94483 33003', designation: 'Road Safety Officer' },

  // Water Supply - Sector 3
  { id: 'OFF-S3-WTR-01', name: 'Er. Pradeep Kumar', department: 'Water Supply & Sanitation', sector: 'Sector 3 (East Zone)', phone: '+91 94433 33001', designation: 'Potable Water Distribution Lead' },
  { id: 'OFF-S3-WTR-02', name: 'Er. Shalini Roy', department: 'Water Supply & Sanitation', sector: 'Sector 3 (East Zone)', phone: '+91 94433 33002', designation: 'Underground Sewerage Engineer' },

  // Electrical - Sector 3
  { id: 'OFF-S3-ELE-01', name: 'Er. Amitav Ganguly', department: 'Electrical & Infrastructure', sector: 'Sector 3 (East Zone)', phone: '+91 98703 33001', designation: 'High-Tension Line Inspector' },
  { id: 'OFF-S3-ELE-02', name: 'Er. Vidya Sagar', department: 'Electrical & Infrastructure', sector: 'Sector 3 (East Zone)', phone: '+91 98703 33002', designation: 'Civic Lighting Officer' },

  // --- SECTOR 4 (WEST ZONE) ---
  // Public Works (Roads) - Sector 4
  { id: 'OFF-S4-PWD-01', name: 'Er. Arvind Kejriwal', department: 'Public Works & Infrastructure', sector: 'Sector 4 (West Zone)', phone: '+91 94484 44001', designation: 'West Sector Infrastructure Chief' },
  { id: 'OFF-S4-PWD-02', name: 'Er. Bhavana Reddy', department: 'Public Works & Infrastructure', sector: 'Sector 4 (West Zone)', phone: '+91 94484 44002', designation: 'Pothole Rapid Action Lead' },
  { id: 'OFF-S4-PWD-03', name: 'Er. Chetan Swamy', department: 'Public Works & Infrastructure', sector: 'Sector 4 (West Zone)', phone: '+91 94484 44003', designation: 'Civil Works Inspector' },

  // Water Supply - Sector 4
  { id: 'OFF-S4-WTR-01', name: 'Er. Hemant Kulkarni', department: 'Water Supply & Sanitation', sector: 'Sector 4 (West Zone)', phone: '+91 94434 44001', designation: 'Water Contamination Specialist' },
  { id: 'OFF-S4-WTR-02', name: 'Er. Radha Krishna', department: 'Water Supply & Sanitation', sector: 'Sector 4 (West Zone)', phone: '+91 94434 44002', designation: 'Sewage Pumping Station Lead' },

  // Electrical - Sector 4
  { id: 'OFF-S4-ELE-01', name: 'Er. Mohan Lal', department: 'Electrical & Infrastructure', sector: 'Sector 4 (West Zone)', phone: '+91 98704 44001', designation: 'Streetlight Automation Lead' },
  { id: 'OFF-S4-ELE-02', name: 'Er. Anjali Menon', department: 'Electrical & Infrastructure', sector: 'Sector 4 (West Zone)', phone: '+91 98704 44002', designation: 'Power Distribution Officer' },

  // --- SECTOR 5 (CENTRAL ZONE) ---
  // Public Works (Roads) - Sector 5
  { id: 'OFF-S5-PWD-01', name: 'Er. Girish Karnad', department: 'Public Works & Infrastructure', sector: 'Sector 5 (Central Zone)', phone: '+91 94485 55001', designation: 'Central Metro Corridor Engineer' },
  { id: 'OFF-S5-PWD-02', name: 'Er. Pallavi Dixit', department: 'Public Works & Infrastructure', sector: 'Sector 5 (Central Zone)', phone: '+91 94485 55002', designation: 'Heritage Zone PWD Overseer' },
  { id: 'OFF-S5-PWD-03', name: 'Er. Sanjay Dutt', department: 'Public Works & Infrastructure', sector: 'Sector 5 (Central Zone)', phone: '+91 94485 55003', designation: 'Traffic Junction Civil Lead' },

  // Water Supply - Sector 5
  { id: 'OFF-S5-WTR-01', name: 'Er. Vinayak Shastri', department: 'Water Supply & Sanitation', sector: 'Sector 5 (Central Zone)', phone: '+91 94435 55001', designation: 'Central Municipal Water Controller' },
  { id: 'OFF-S5-WTR-02', name: 'Er. Usha Narayanan', department: 'Water Supply & Sanitation', sector: 'Sector 5 (Central Zone)', phone: '+91 94435 55002', designation: 'Sanitary Quality Assessor' },

  // Electrical - Sector 5
  { id: 'OFF-S5-ELE-01', name: 'Er. Zameer Ahmed', department: 'Electrical & Infrastructure', sector: 'Sector 5 (Central Zone)', phone: '+91 98705 55001', designation: 'Central Smart City Grid Engineer' },
  { id: 'OFF-S5-ELE-02', name: 'Er. Divya Prakash', department: 'Electrical & Infrastructure', sector: 'Sector 5 (Central Zone)', phone: '+91 98705 55002', designation: 'LED Master Grid Inspector' },

  // Town Planning - Sector 5
  { id: 'OFF-S5-TP-01', name: 'Er. Bhaskar Rao', department: 'Town Planning & Environment', sector: 'Sector 5 (Central Zone)', phone: '+91 94415 55001', designation: 'Zonal Urban Planner' },
  { id: 'OFF-S5-TP-02', name: 'Er. Nalini Mohan', department: 'Town Planning & Environment', sector: 'Sector 5 (Central Zone)', phone: '+91 94415 55002', designation: 'Encroachment Verification Lead' },

  // Revenue & Taxation - Sector 5
  { id: 'OFF-S5-REV-01', name: 'Shri Ashok Mehta', department: 'Revenue & Taxation', sector: 'Sector 5 (Central Zone)', phone: '+91 94416 66001', designation: 'Revenue Assessor' },
  { id: 'OFF-S5-REV-02', name: 'Smt. Roopa Kulkarni', department: 'Revenue & Taxation', sector: 'Sector 5 (Central Zone)', phone: '+91 94416 66002', designation: 'Tax Assessment Officer' }
];

module.exports = {
  SECTORS,
  DEPARTMENTS,
  INITIAL_OFFICERS
};

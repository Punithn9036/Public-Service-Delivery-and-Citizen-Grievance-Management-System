-- Seed Data Script for Public Service Delivery and Citizen Grievance Management System (JanSeva / DIGIT CMS)

-- 1. Users
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, department)
VALUES
  ('USR-CIT-001', 'Aarav Sharma', 'aarav.sharma@example.com', '+91 98765 43210', '$2b$10$wT8...hash', 'CITIZEN', NULL),
  ('USR-CIT-002', 'Priya Sundaram', 'priya.sundaram@example.com', '+91 98112 33445', '$2b$10$wT8...hash', 'CITIZEN', NULL),
  ('USR-OFF-012', 'Er. Rajesh Varma', 'rajesh.varma@gov.in', '+91 94433 11223', '$2b$10$wT8...hash', 'OFFICER', 'Water Supply & Sanitation'),
  ('USR-OFF-008', 'Vikram Singh', 'vikram.singh@gov.in', '+91 98700 55443', '$2b$10$wT8...hash', 'OFFICER', 'Public Works & Infrastructure'),
  ('USR-ADM-001', 'Smt. Kavitha Reddi', 'admin.controlroom@gov.in', '+91 94411 99887', '$2b$10$wT8...hash', 'ADMIN', 'Municipal Governance')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Public Services Catalog
INSERT INTO public_services (id, service_name, department, description, sla_days, fee, documents_required)
VALUES
  ('srv-1', 'Issue of Birth Certificate', 'Revenue & Vital Statistics', 'Application for official birth registration and legal birth certificate issuance.', 7, '₹50', ARRAY['Hospital Birth Card', 'Parents Aadhaar ID', 'Address Proof']),
  ('srv-2', 'New Water & Sewerage Connection', 'Water Supply & Sanitation', 'Request for residential or commercial piped water supply tap & sewerage line installation.', 14, '₹1,200', ARRAY['Property Ownership Copy', 'Tax Receipt', 'Applicant ID Proof']),
  ('srv-3', 'Trade License Renewal', 'Commercial & Trade Licensing', 'Annual renewal of municipal trade operating license for shops, offices and enterprises.', 5, '₹850', ARRAY['Previous License Copy', 'GST Registration', 'Property Lease Agreement']),
  ('srv-4', 'Income & Caste Certificate', 'Revenue & Land Records', 'Issuance of certified income and caste eligibility certificate for government schemes.', 10, '₹30', ARRAY['Ration Card', 'Self-Declaration Affidavit', 'Salary/Income Slip']),
  ('srv-5', 'Property Tax Assessment & Transfer', 'Revenue & Taxation', 'Assessment of property tax liability, ownership name change, and record update.', 15, '₹500', ARRAY['Sale Deed / Title Document', 'Encumbrance Certificate', 'Previous Tax Receipts']),
  ('srv-6', 'Street Light & Infrastructure Maintenance', 'Public Works & Infrastructure', 'Request installation of new LED street lamps or public amenity repairs.', 3, 'Free', ARRAY['Locality Request Letter / Ward Member Endorsement'])
ON CONFLICT (id) DO NOTHING;

-- 3. Grievances
INSERT INTO grievances (id, title, category, department, description, location, landmark, priority, status, citizen_name, citizen_phone, citizen_email, assigned_officer, assigned_officer_contact, ipfs_document_cid, fabric_tx_id, sla_deadline)
VALUES
  ('GRV-2026-8910', 'Damaged Drainage Overflow on Main Market Road', 'Sanitation & Waste Management', 'Water Supply & Sanitation', 'Raw sewage and drainage water is overflowing near Shop #42 on Main Market Road, causing severe health hazards.', 'Sector 4, Main Market Road, Ward 12', 'Opposite Central Pharmacy', 'Urgent', 'In Progress', 'Aarav Sharma', '+91 98765 43210', 'aarav.sharma@example.com', 'Er. Rajesh Varma (Senior Sanitation Engineer)', '+91 94433 11223', 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco', '0x8f7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a', NOW() + INTERVAL '1 day'),
  ('GRV-2026-8904', 'Non-Functional Street Lights along Green Park Boulevard', 'Electrical & Infrastructure', 'Public Works & Infrastructure', 'Over 8 consecutive streetlights have been completely dark for 5 days.', 'Green Park Boulevard, Block B, Ward 8', 'Near Community Park Gate 2', 'High', 'Assigned', 'Priya Sundaram', '+91 98112 33445', 'priya.sundaram@example.com', 'Vikram Singh (Assistant Electrical Inspector)', '+91 98700 55443', 'QmPZ9GcCEgudBwbZMuMVLK72vedxjQkDDP1mXWo6uco', '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', NOW() + INTERVAL '2 days'),
  ('GRV-2026-8850', 'Uncollected Solid Waste & Garbage Accumulation', 'Sanitation & Waste Management', 'Health & Hygiene', 'Municipal garbage collection van has skipped Block 3 for 4 days.', 'Sunrise Apartments Lane, Ward 15', 'Behind Government Primary School', 'Medium', 'Resolved', 'Mohammed Tanvir', '+91 97654 88990', 'tanvir.m@example.com', 'Smt. Kavitha Reddi (Chief Hygiene Inspector)', '+91 94411 99887', 'QmYwAPJzv5CZsnA625s3Xf2L72vedxjQkDDP1mXWo6uco', '0x3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 4. Grievance Timeline Audit Records
INSERT INTO grievance_timeline (grievance_id, status, officer_name, note, fabric_tx_id, timestamp)
VALUES
  ('GRV-2026-8910', 'Submitted', 'System Gateway', 'Grievance lodged online via JanSeva Portal.', '0x8f7a6b5c4d3e2f1a', NOW() - INTERVAL '2 days'),
  ('GRV-2026-8910', 'Under Review', 'Control Room Nodal Officer', 'Validated and categorized under Water & Sanitation.', '0x9a8b7c6d5e4f3a2b', NOW() - INTERVAL '1 day'),
  ('GRV-2026-8910', 'Assigned', 'Er. Rajesh Varma', 'Assigned to Ward 12 Sanitation Team.', '0x1b2c3d4e5f6a7b8c', NOW() - INTERVAL '12 hours'),
  ('GRV-2026-8910', 'In Progress', 'Er. Rajesh Varma', 'Dredging truck dispatched to site.', '0x2c3d4e5f6a7b8c9d', NOW() - INTERVAL '2 hours'),
  ('GRV-2026-8850', 'Submitted', 'System Gateway', 'Grievance submitted with photo evidence.', '0x3d4e5f6a7b8c9d0e', NOW() - INTERVAL '3 days'),
  ('GRV-2026-8850', 'Resolved', 'Smt. Kavitha Reddi', 'Garbage cleared and area disinfected. Verified by supervisor.', '0x4e5f6a7b8c9d0e1f', NOW() - INTERVAL '1 day');

-- 5. Feedback
INSERT INTO grievance_feedback (grievance_id, rating, comment)
VALUES
  ('GRV-2026-8850', 5, 'Prompt response and total cleanup done within 36 hours. Very satisfied!')
ON CONFLICT (grievance_id) DO NOTHING;

-- 6. Service Applications
INSERT INTO service_applications (id, service_id, service_name, department, applicant_name, applicant_phone, applicant_email, status, applied_date, sla_days, estimated_completion, remarks)
VALUES
  ('APP-2026-1049', 'srv-1', 'Issue of Birth Certificate', 'Revenue & Vital Statistics', 'Ananya Deshmukh', '+91 98888 12345', 'ananya.d@example.com', 'Approved', '2026-08-15', 7, '2026-08-22', 'Documents verified by Registrar. Certificate issued in digital format.'),
  ('APP-2026-1092', 'srv-2', 'New Water & Sewerage Connection', 'Water Supply & Sanitation', 'Suresh Kumar', '+91 97777 54321', 'suresh.k@example.com', 'In Verification', '2026-08-17', 14, '2026-08-31', 'Field engineer scheduled for site feasibility inspection.')
ON CONFLICT (id) DO NOTHING;

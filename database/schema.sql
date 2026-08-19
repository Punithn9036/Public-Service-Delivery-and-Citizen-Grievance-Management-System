-- PostgreSQL Database Schema for Public Service Delivery and Citizen Grievance Management System (JanSeva / DIGIT CMS)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN', 'OFFICER', 'ADMIN', 'SUPERVISOR')),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_services (
    id VARCHAR(50) PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    sla_days INT NOT NULL,
    fee VARCHAR(50) NOT NULL,
    documents_required TEXT[]
);

CREATE TABLE IF NOT EXISTS grievances (
    id VARCHAR(50) PRIMARY KEY, -- e.g. GRV-2026-8910
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    landmark VARCHAR(150),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
    citizen_name VARCHAR(100) NOT NULL,
    citizen_phone VARCHAR(20) NOT NULL,
    citizen_email VARCHAR(100),
    assigned_officer VARCHAR(150),
    assigned_officer_contact VARCHAR(20),
    ipfs_document_cid VARCHAR(100), -- Binary document hash in IPFS
    fabric_tx_id VARCHAR(100),       -- Immutable ledger transaction hash
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grievance_timeline (
    id SERIAL PRIMARY KEY,
    grievance_id VARCHAR(50) REFERENCES grievances(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    officer_name VARCHAR(150),
    note TEXT NOT NULL,
    fabric_tx_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grievance_feedback (
    id SERIAL PRIMARY KEY,
    grievance_id VARCHAR(50) UNIQUE REFERENCES grievances(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

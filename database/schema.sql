-- PostgreSQL Database DDL Schema for Public Service Delivery & Citizen Grievance Management System (JanSeva / DIGIT CMS)

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN', 'OFFICER', 'ADMIN', 'SUPERVISOR')),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Public Services Table
CREATE TABLE IF NOT EXISTS public_services (
    id VARCHAR(50) PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    sla_days INTEGER NOT NULL,
    fee VARCHAR(50) NOT NULL,
    documents_required TEXT[]
);

-- 3. Grievances Table
CREATE TABLE IF NOT EXISTS grievances (
    id VARCHAR(50) PRIMARY KEY,
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
    ipfs_document_cid VARCHAR(100),
    fabric_tx_id VARCHAR(100),
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Grievance Timeline Audit Log Table
CREATE TABLE IF NOT EXISTS grievance_timeline (
    id SERIAL PRIMARY KEY,
    grievance_id VARCHAR(50) NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    officer_name VARCHAR(150),
    note TEXT NOT NULL,
    fabric_tx_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Grievance Feedback Table
CREATE TABLE IF NOT EXISTS grievance_feedback (
    id SERIAL PRIMARY KEY,
    grievance_id VARCHAR(50) UNIQUE NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Service Applications Table
CREATE TABLE IF NOT EXISTS service_applications (
    id VARCHAR(50) PRIMARY KEY,
    service_id VARCHAR(50) NOT NULL REFERENCES public_services(id),
    service_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_email VARCHAR(100),
    status VARCHAR(30) NOT NULL CHECK (status IN ('Submitted', 'In Verification', 'Approved', 'Rejected')),
    applied_date DATE NOT NULL,
    sla_days INTEGER NOT NULL,
    estimated_completion DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance optimization
CREATE INDEX IF NOT EXISTS idx_grievances_department ON grievances(department);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievances_citizen_phone ON grievances(citizen_phone);
CREATE INDEX IF NOT EXISTS idx_timeline_grievance_id ON grievance_timeline(grievance_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_grievances_updated_at ON grievances;
CREATE TRIGGER update_grievances_updated_at
BEFORE UPDATE ON grievances
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

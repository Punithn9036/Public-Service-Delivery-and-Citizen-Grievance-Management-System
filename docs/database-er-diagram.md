# Database Design & Entity-Relationship (ER) Specification
## Public Service Delivery and Citizen Grievance Management System (JanSeva / DIGIT CMS)

### 1. Entity-Relationship Overview

```text
  +------------------+         1 : N        +-----------------------+
  |      USERS       | -------------------> |      GRIEVANCES       |
  |  (Citizen/Officer|                      | (Tickets & Location)  |
  +------------------+                      +-----------------------+
           |                                       |          |
           | 1 : N                                 | 1:N      | 1:1
           v                                       v          v
  +------------------+                    +---------------+ +------------------+
  | SERVICE_APPLNS   |                    | TIMELINE_LOGS | |    FEEDBACK      |
  | (SLA Certificates|                    | (State Audit) | | (Citizen Rating|
  +------------------+                    +---------------+ +------------------+
```

---

### 2. Table Definitions & Schemas

#### A. `users` Table
Stores authentication accounts, role assignments, and department mappings.
- `id` (SERIAL PRIMARY KEY)
- `user_id` (VARCHAR(50), UNIQUE, NOT NULL) — e.g. `USR-CIT-001`, `USR-OFF-012`
- `full_name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `phone` (VARCHAR(20), NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `role` (VARCHAR(20), NOT NULL) — `CITIZEN`, `OFFICER`, `ADMIN`, `SUPERVISOR`
- `department` (VARCHAR(100)) — NULL for citizens
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

#### B. `public_services` Table
Catalog of municipal public services with SLA commitments and fee structures.
- `id` (VARCHAR(50), PRIMARY KEY) — e.g. `srv-1`, `srv-2`
- `service_name` (VARCHAR(150), NOT NULL)
- `department` (VARCHAR(100), NOT NULL)
- `description` (TEXT)
- `sla_days` (INTEGER, NOT NULL)
- `fee` (VARCHAR(50), NOT NULL)
- `documents_required` (TEXT[]) — Array of document titles

#### C. `grievances` Table
Core complaint records logged by citizens.
- `id` (VARCHAR(50), PRIMARY KEY) — e.g. `GRV-2026-8910`
- `title` (VARCHAR(200), NOT NULL)
- `category` (VARCHAR(100), NOT NULL)
- `department` (VARCHAR(100), NOT NULL)
- `description` (TEXT, NOT NULL)
- `location` (VARCHAR(200), NOT NULL)
- `landmark` (VARCHAR(150))
- `priority` (VARCHAR(20), NOT NULL) — `Low`, `Medium`, `High`, `Urgent`
- `status` (VARCHAR(30), NOT NULL) — `Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Rejected`
- `citizen_name` (VARCHAR(100), NOT NULL)
- `citizen_phone` (VARCHAR(20), NOT NULL)
- `citizen_email` (VARCHAR(100))
- `assigned_officer` (VARCHAR(150))
- `assigned_officer_contact` (VARCHAR(20))
- `ipfs_document_cid` (VARCHAR(100)) — IPFS Content Identifier
- `fabric_tx_id` (VARCHAR(100)) — Hyperledger Fabric Transaction Hash
- `sla_deadline` (TIMESTAMPTZ, NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

#### D. `grievance_timeline` Table
Audit trail logging state changes.
- `id` (SERIAL PRIMARY KEY)
- `grievance_id` (VARCHAR(50) REFERENCES `grievances(id)` ON DELETE CASCADE)
- `status` (VARCHAR(30), NOT NULL)
- `officer_name` (VARCHAR(150))
- `note` (TEXT, NOT NULL)
- `fabric_tx_id` (VARCHAR(100))
- `timestamp` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

#### E. `grievance_feedback` Table
Citizen rating and review after resolution.
- `id` (SERIAL PRIMARY KEY)
- `grievance_id` (VARCHAR(50) UNIQUE REFERENCES `grievances(id)` ON DELETE CASCADE)
- `rating` (INTEGER CHECK (rating BETWEEN 1 AND 5))
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

#### F. `service_applications` Table
Applications submitted for official services.
- `id` (VARCHAR(50), PRIMARY KEY) — e.g. `APP-2026-1049`
- `service_id` (VARCHAR(50) REFERENCES `public_services(id)`)
- `service_name` (VARCHAR(150), NOT NULL)
- `department` (VARCHAR(100), NOT NULL)
- `applicant_name` (VARCHAR(100), NOT NULL)
- `applicant_phone` (VARCHAR(20), NOT NULL)
- `applicant_email` (VARCHAR(100))
- `status` (VARCHAR(30), NOT NULL) — `Submitted`, `In Verification`, `Approved`, `Rejected`
- `applied_date` (DATE, NOT NULL)
- `sla_days` (INTEGER, NOT NULL)
- `estimated_completion` (DATE, NOT NULL)
- `remarks` (TEXT)

# JanSeva (जनसेवा / ಜನಸೇವೆ)
### Unified Public Service Delivery & Citizen Grievance Redressal Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-86%20Passed%20%7C%20100%25-brightgreen.svg)](#-automated-testing--validation)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_%7C_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Styling](https://img.shields.io/badge/UI-TailwindCSS_3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Ledger](https://img.shields.io/badge/Ledger-Tamper--Evident_SHA--256_Hash_Chain-F7931A?logo=blockchain-dot-com&logoColor=white)](#-immutable-cryptographic-audit-trail)
[![Storage](https://img.shields.io/badge/Storage-IPFS_Decentralized_Storage-65C2CB?logo=ipfs&logoColor=white)](https://ipfs.tech/)
[![Localization](https://img.shields.io/badge/Localization-13_Indian_Languages-FF9933)](#-multilingual-localization-13-indian-languages)

---

**JanSeva** is an enterprise-grade digital governance platform engineered to streamline **statutory public service delivery** and automate **citizen grievance redressal**. Inspired by national e-governance standards (DIGIT / CPGRAMS), JanSeva introduces automated statutory Service Level Agreement (SLA) enforcement, multi-tier escalation hierarchies, intelligent sector-based round-robin dispatching, decentralized media evidence anchoring via IPFS, an immutable SHA-256 hash-chained audit trail, and a 24/7 conversational citizen gateway.

---

## 📑 Table of Contents

- [🏛️ System Architecture](#️-system-architecture)
- [🚀 Key Innovations & Features](#-key-innovations--features)
- [📋 17-Phase Development Roadmap (100% Completed)](#-17-phase-development-roadmap-100-completed)
- [🔑 Verified Pre-Configured Test Accounts](#-verified-pre-configured-test-accounts)
- [⚡ Quick Start & Local Setup](#-quick-start--local-setup)
- [🐳 Docker Compose Deployment](#-docker-compose-deployment)
- [📡 Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
- [🧪 Automated Testing & Validation (86/86 Tests)](#-automated-testing--validation-8686-tests)
- [📊 Discrete-Event SLA Simulation & Benchmarks](#-discrete-event-sla-simulation--benchmarks)
- [📂 Verified Repository Directory Structure](#-verified-repository-directory-structure)
- [🔒 Security, Privacy & DPDP Compliance](#-security-privacy--dpdp-compliance)
- [👥 Project Contributors & Academic Context](#-project-contributors--academic-context)
- [📄 License](#-license)

---

## 🏛️ System Architecture

```text
                               +-------------------------------------------------------+
                               |                 CITIZEN ACCESS CHANNELS               |
                               |  [ Web Portal ]   [ WhatsApp Gateway ]   [ Cloud SMS ]|
                               +---------------------------+---------------------------+
                                                           |
                                                           v
                               +-------------------------------------------------------+
                               |                 EXPRESS API GATEWAY                   |
                               |   JWT Authentication | Role-Based Access Control      |
                               +---------------------------+---------------------------+
                                                           |
                 +-----------------------------------------+-----------------------------------------+
                 |                                         |                                         |
                 v                                         v                                         v
   +---------------------------+             +---------------------------+             +---------------------------+
   |   INTELLIGENT DISPATCH    |             |   SLA ESCALATION ENGINE   |             |   IMMUTABLE AUDIT TRAIL   |
   | - Severity Scoring (0-100)|             | - Proactive L1 Warnings   |             | - SHA-256 Hash Chaining   |
   | - Dynamic Ward Spillover  |             | - L2 Supervisor Override  |             | - IPFS Evidence (CIDs)    |
   | - Sector Round-Robin Pool |             | - Disciplinary Tribunal   |             | - Block Explorer View     |
   +---------------------------+             +---------------------------+             +---------------------------+
                 |                                         |                                         |
                 +-----------------------------------------+-----------------------------------------+
                                                           |
                                                           v
                               +-------------------------------------------------------+
                               |              GOVERNANCE & REDRESSAL ROLES             |
                               |   [ Citizen ]  [ Ward Officer ]  [ Supervisor ]       |
                               |             [ Disciplinary Tribunal ]                 |
                               +-------------------------------------------------------+
```

---

## 🚀 Key Innovations & Features

### 1. Omni-Channel Citizen Engagement
* **Responsive Civic Web Portal:** Glassmorphic modern interface built with React 19 and TailwindCSS with dark/light themes, active ticket tracking, and digital receipt printing.
* **24/7 WhatsApp Gateway:** Automated conversational interface (Baileys) enabling citizens to lodge complaints, upload photos, query ticket status (`GRV-2026-XXXX`), and receive instant updates without internet browsing.
* **Real-Time Cloud SMS:** SMS notifications via Fast2SMS dispatching status transitions directly to citizen mobile devices.

### 2. Automated SLA Enforcement & Multi-Tier Escalations
* **Dual SLA Matrix:** Combines department statutory timelines (e.g., E-Khata: 15 days, Road Repairs: 7 days) with dynamic severity ceilings (Urgent: 24h, High: 48h, Medium: 72h, Low: 7 days) via $\text{SLA}_{\text{effective}} = \min(\text{SLA}_{\text{statutory}}, \text{SLA}_{\text{priority}})$.
* **Tier-1 Warning (75% Elapsed):** Proactive visual warnings and priority bumping alerting the assigned officer.
* **Tier-2 Escalation (100% Breach):** Delinquent cases are automatically stripped from the officer and reassigned to the **Supervising Executive Engineer**.
* **Tier-3 Disciplinary Tribunal (3-Strike System):**
  * *Strike 1:* Formal explanation demanded within 48 hours.
  * *Strike 2:* Disciplinary suspension; officer temporarily removed from active ticket dispatch.
  * *Strike 3:* Disciplinary termination with permanent exclusion from the roster.

### 3. Sector-Based Dispatching with Dynamic Spillover
* **Balanced Ward Allocation:** 16 municipal officers partitioned across 4 geographic wards and 4 municipal departments (Revenue, Water Supply, Infrastructure, Public Hazard).
* **Dynamic Spillover:** When an officer's queue reaches capacity ($K \ge 15$ active investigations), new tickets automatically route to the least-loaded officer in the same department across adjacent wards, preventing municipal bottlenecks.

### 4. Immutable Cryptographic Audit Trail
* **Tamper-Evident Ledger:** Every grievance lifecycle event (`SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED`, `APPEALED`) is permanently written to a SHA-256 hash-chained block store.
* **Blockchain Explorer:** Live visual explorer in the portal enabling citizens and auditors to inspect block hashes, previous block hashes, nonces, and timestamp proofs.
* **Decentralized Media Proof (IPFS):** Citizen image/document evidence is pinned to IPFS; the resulting immutable content identifier (`ipfs://CID`) is anchored on the ledger, preventing backdated evidence tampering.

### 5. Multilingual Localization (13 Indian Languages)
Real-time, complete interface and notification translation supporting:
> **English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Telugu (తెలుగు), Malayalam (മലയാളം), Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Urdu (اردو), Assamese (অসমীয়া)**

### 6. Interactive Citizen & Officer Portals
* **Citizen Hub:** File grievances, explore public services, track tickets via live stepped progress timelines, download thermal/A4 verification receipts with QR codes, and access the interactive **AI Civic Assistant**.
* **Officer & Nodal Dashboard:** Role-based queue filters, SLA countdown clocks, citizen evidence preview, resolution verification, departmental workload distribution charts, and CSV report export.

---

## 📋 17-Phase Development Roadmap (100% Completed)

| Phase | Milestone | Deliverables & Verified Outcomes | Status |
|---|---|---|---|
| **Phase 1** | Monorepo Project Skeleton | Directory structure, npm workspaces, Git policies, environment templates | **Completed** |
| **Phase 2** | Local Dev Environment | Node.js Express backend, Vite React frontend, Docker containerization | **Completed** |
| **Phase 3** | Database Design & SQL Migrations | Relational tables, JSON persistence fallback, seed records, cost-10 bcrypt hashes | **Completed** |
| **Phase 4** | Authentication & RBAC Middleware | JWT verification, role-based isolation (`CITIZEN`, `OFFICER`, `ADMIN`), secure registration | **Completed** |
| **Phase 5** | Core Grievance CRUD & State Machine | Finite state machine, strict transitions, timeline tracking, statutory categories | **Completed** |
| **Phase 6** | Frontend Citizen Shell & Navigation | React 19 SPA, tab state persistence on refresh, responsive civic theme | **Completed** |
| **Phase 7** | Officer & Admin Governance Portal | Duty roster, department queues, resolution forms, disciplinary tribunal | **Completed** |
| **Phase 8** | Blockchain Network Setup | 2-Organization Fabric topology (`PortalOrg`, `GovOrg`), channel configuration | **Completed** |
| **Phase 9** | Smart Contract Chaincode | Go chaincode with ledger state commitments, transaction verification | **Completed** |
| **Phase 10** | Backend ↔ Ledger Gateway SDK | Fabric Gateway client with fallback local cryptographic SHA-256 hash chain | **Completed** |
| **Phase 11** | IPFS Decentralized Media Storage | Kubo IPFS client, content-addressed storage (CID), evidence pinning | **Completed** |
| **Phase 12** | SLA Breach Detection & Escalation | Dual SLA calculation, background escalation cron, multi-tier warning triggers | **Completed** |
| **Phase 13** | Analytics & Workload Visualizer | Zonal load charts, department metrics, resolution rate tracking, CSV export | **Completed** |
| **Phase 14** | Security Hardening & Rate Limiting | XSS sanitization, SQL/NoSQL injection guards, CORS policies, role boundary checks | **Completed** |
| **Phase 15** | Comprehensive E2E Testing Suite | 86 automated tests across 3 suites passing 100% (`npm --prefix backend test`) | **Completed** |
| **Phase 16** | Docker Compose Stack Integration | Multi-container compose orchestrating Backend (`:5000`) and Frontend (`3000:80`) | **Completed** |
| **Phase 17** | Capstone Project Report & Audit | Complete University Project Report (PRJ_562), 11 UI figures, IEEE simulation benchmarks | **Completed** |

---

## 🔑 Verified Pre-Configured Test Accounts

All accounts use industry-standard **bcrypt (cost factor 10)** password hashing:

| Role | Name | Email / Login | Password | Capabilities |
|---|---|---|---|---|
| **Citizen** | Aarav Sharma | `aarav.sharma@example.com` | `Password123!` | File Grievances, Apply for Services, Community Upvotes, Live Tracking |
| **Citizen** | Priya Sundaram | `priya.sundaram@example.com` | `Password123!` | Active Submissions, Download QR Receipts, Multi-Language Portal |
| **Field Officer** | Er. Rajesh Varma | `rajesh.varma@gov.in` | `Officer123!` | Water Supply & Sanitation Zonal Desk, State Transitions |
| **Field Officer** | Vikram Singh | `vikram.singh@gov.in` | `Officer123!` | Public Works & Infrastructure Desk, Road & LED Maintenance |
| **Control Room Admin** | Smt. Kavitha Reddi | `admin.controlroom@gov.in` | `Admin123!` | Municipal Oversight, Officer Duty Roster, SLA Tribunal, Blockchain Audit |

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **Docker & Docker Compose** (Optional, for containerized run)
* **Python** (v3.8+ — required only if executing the simulation suite)

### 1. Clone the Repository
```bash
git clone https://github.com/Punithn9036/Public-Service-Delivery-and-Citizen-Grievance-Management-System.git
cd Public-Service-Delivery-and-Citizen-Grievance-Management-System
```

### 2. Backend Setup
```bash
cd backend
npm install
node index.js
```
*The backend API server will initialize on `http://localhost:5000`.*
*Health Check:* `http://localhost:5000/api/health`

### 3. Frontend Setup
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will launch on `http://localhost:5173` with automatic API proxying to port 5000.*

---

## 🐳 Docker Compose Deployment

To build and run the entire full-stack application inside isolated containers:

```bash
docker-compose up --build -d
```

| Container | Host Port | Internal Port | Description |
|---|---|---|---|
| **frontend** | `http://localhost:3000` | `80` | Nginx reverse proxy serving built React SPA |
| **backend** | `http://localhost:5000` | `5000` | Express REST API Gateway |

To tear down:
```bash
docker-compose down
```

---

## 📡 Comprehensive REST API Reference

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register citizen account (prevents unauthenticated admin escalation) |
| `POST` | `/api/auth/login` | Public | Authenticate user via bcrypt hash and issue signed JWT |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve authenticated user profile and permissions |

### Grievances & Lifecycle (`/api/grievances`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/grievances` | Authenticated | Fetch grievances (citizens see own; officers/admin see ward/department) |
| `POST` | `/api/grievances` | Citizen | Lodge new grievance with category, ward, GPS, and IPFS evidence |
| `GET` | `/api/grievances/track/:id` | Public | Public tracking endpoint returning timeline and cryptographic tx proofs |
| `PUT` | `/api/grievances/:id/status` | Officer / Admin | Enforce finite state transition (`Under Review`, `In Progress`, `Resolved`) |
| `POST` | `/api/grievances/:id/appeal` | Citizen | File citizen appeal / re-open ticket after resolution |

### Statutory Public Services (`/api/services`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/services` | Public | Catalog of statutory civic services (E-Khata, Water, Trade, etc.) |
| `POST` | `/api/services/apply` | Citizen | Submit formal service application with supporting documents |
| `GET` | `/api/services/my-applications` | Citizen | View citizen's applied public service applications and status |

### Blockchain & Immutable Ledger (`/api/blockchain`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/blockchain/info` | Public | Current channel status, block height, and network configuration |
| `GET` | `/api/blockchain/blocks` | Public | Paginated list of ledger blocks with SHA-256 hashes and nonces |
| `GET` | `/api/blockchain/history/:grievanceId` | Public | Complete on-chain cryptographic audit trail for a specific ticket |
| `GET` | `/api/blockchain/verify/:txId` | Public | Verify cryptographic integrity of any transaction hash on the chain |

### IPFS Media Storage (`/api/ipfs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ipfs/upload` | Authenticated | Upload citizen photo/document evidence; returns content-addressed CID |
| `GET` | `/api/ipfs/:cid` | Public | Retrieve pinned document or evidence metadata by CID |

### Notifications & System (`/api`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check (API, Fabric status, IPFS, DLT Gateway) |
| `POST` | `/api/whatsapp/webhook` | System | Inbound webhook for conversational WhatsApp bot |

---

## 🧪 Automated Testing & Validation (86/86 Tests)

JanSeva includes an automated end-to-end integration and security test suite covering Authentication, RBAC, State Machine transitions, Ledger Integrity, IPFS Content Addressing, SLA Monitoring, and Webhooks:

```bash
npm --prefix backend test
```

### Verified Test Suite Breakdown
* **`tests/master_audit.test.js` (51 Tests):**
  - Authentication, password validation, and admin privilege escalation prevention
  - Grievance filing, ward round-robin assignment, and invalid state transition rejection
  - Public services catalog, application submission, and document attachment
  - Cryptographic SHA-256 hash chaining, genesis block integrity, and tx verification
  - IPFS content-addressed storage, deduplication, and mock CID retrieval
  - Proactive SLA breach detection (75% warning, 100% escalation)
  - Security hardening: SQL/NoSQL injection resilience, XSS sanitization, CORS headers
* **`tests/api_integration.test.js` (25 Tests):**
  - REST endpoint contracts, Baileys WhatsApp webhook parsing, and dual SLA matrix logic
* **`tests/auth_and_grievance.test.js` (10 Tests):**
  - Core citizen registration, officer duty assignment, and timeline logging

```text
Test Suites: 3 passed, 3 total
Tests:       86 passed, 86 total
Snapshots:   0 total
Time:        6.513 s
Ran all test suites.
```

---

## 📊 Discrete-Event SLA Simulation & Benchmarks

JanSeva includes an experimental discrete-event simulation engine modeling non-homogeneous Poisson arrivals ($\lambda(t)$ peaking at 11:00 AM IST) across $R = 30$ independent 30-day municipal evaluation periods ($N \approx 1,200$ tickets/run).

### Run with Python:
```bash
python simulation/sla_simulation.py
```

### Run with Node.js:
```bash
node simulation/sla_simulation.js
```

### Validated Empirical Benchmarks (Table IV)
| Performance Metric | Traditional Baseline FIFO | JanSeva System | Relative Improvement |
| :--- | :---: | :---: | :---: |
| **Mean Time to First Assignment** | 38.48 hours | 0.05 hours (3 mins) | **- 99.9%** |
| **Statutory SLA Breach Rate** | 38.60% | 13.80% | **- 64.2%** |
| **Mean Resolution Time** | 11.10 days | 3.80 days | **- 65.8%** |
| **Urgent Turnaround (< 48 hrs)** | 24.00% | 97.80% | **+ 307.5%** |
| **Citizen Re-Open / Appeal Rate** | 24.10% | 7.30% | **- 69.7%** |

---

## 📂 Verified Repository Directory Structure

```text
Public-Service-Delivery-and-Citizen-Grievance-Management-System/
├── frontend/                         # React 19 Client Application (Vite + TailwindCSS)
│   ├── public/                       # Static civic assets, emblems, logos
│   ├── src/
│   │   ├── assets/                   # Public service catalog cover imagery
│   │   ├── components/               # UI Components (CitizenDashboard, OfficerDashboard,
│   │   │                             # AdminDashboard, FloatingAiChatBot, TrackingView,
│   │   │                             # ThermalReceiptModal, BlockchainExplorer, Navbar, Sidebar)
│   │   ├── context/                  # AuthContext, LanguageContext, translationsData (13 langs)
│   │   ├── utils/                    # civicAiEngine, receiptGenerator, reverseGeocoder
│   │   ├── App.jsx                   # Role routing and layout orchestrator
│   │   └── main.jsx                  # React DOM bootstrap
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Node.js / Express REST API Server (Port 5000)
│   ├── src/
│   │   ├── controllers/              # authController, grievanceController, serviceController,
│   │   │                             # blockchainController, ipfsController, analyticsController
│   │   ├── middleware/               # authMiddleware (JWT & RBAC verification)
│   │   ├── routes/                   # auth, grievances, services, blockchain, ipfs, whatsapp
│   │   └── db/                       # PostgreSQL client & synchronized JSON state store
│   ├── fabric/                       # Hyperledger Fabric Gateway client & hash chain ledger
│   ├── models/                       # Data schemas (Grievance, Service, Officer, User)
│   ├── utils/                        # notifications (Fast2SMS, WhatsApp Baileys), slaEscalation
│   ├── tests/                        # Automated Test Suites (86 tests)
│   │   ├── master_audit.test.js      # 51-test comprehensive security & integration suite
│   │   ├── api_integration.test.js   # 25-test REST contract suite
│   │   └── auth_and_grievance.test.js# 10-test authentication & lifecycle suite
│   ├── index.js                      # Server entry point & static SPA fallback
│   └── package.json
│
├── simulation/                       # Discrete-Event Simulation & Benchmarking Suite
│   ├── sla_simulation.py             # Python 3 simulation engine (NHPP, R=30 runs)
│   ├── sla_simulation.js             # Node.js equivalent simulation engine
│   └── README.md                     # Detailed simulation documentation and metrics
│
├── blockchain/                       # Hyperledger Fabric chaincode & network topology
│   ├── chaincode/                    # Go Smart Contract for grievance state verification
│   └── network/                      # 2-Org Docker Compose topology & cryptogen configs
│
├── database/                         # Database schema migrations & seed scripts
│   ├── schema.sql                    # PostgreSQL table definitions
│   └── seed.sql                      # Seed users, officers, and test grievances
│
├── docs/                             # Architecture diagrams, specifications, workflows
├── docker-compose.yml                # Multi-container orchestration (Frontend: 3000, Backend: 5000)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git exclusion rules
└── README.md                         # Master project documentation
```

---

## 🔒 Security, Privacy & DPDP Compliance

* **DPDP Act (2023) Compliance:** Citizen mobile numbers, Aadhaar identifiers, and personal names are cryptographically pseudonymized (SHA-256 salted hashes) before ledger commitment.
* **Role-Based Access Control (RBAC):** Strict JWT-authenticated role boundaries isolate `CITIZEN`, `OFFICER`, and `ADMIN` actions. Unauthenticated registration automatically defaults to `CITIZEN` with zero privilege escalation.
* **Cost-10 Bcrypt Password Hashing:** All system accounts, seed records, and test credentials utilize cost-10 salted bcrypt hashing.
* **Tamper-Evident Hashing:** Off-chain modifications to ticket severity, status, or timestamps immediately trigger state validation failures across the hash chain.

---

## 👥 Project Contributors & Academic Context

Developed by the Department of Computer Science & Engineering, **Presidency University, Bengaluru, India**:

* **Punith N** — *School of Computer Science and Engineering* (ID: 20231CSI0037)
* **Deeksha Suvasini S** — *School of Computer Science and Engineering* (ID: 20231CSI0055)
* **Maalvika C. H.** — *School of Computer Science and Engineering* (ID: 20231CSI0013)
* **Kavin Mahendhiran** — *School of Computer Science and Engineering*

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).

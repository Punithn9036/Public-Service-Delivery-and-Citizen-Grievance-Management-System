# JanSeva (जनसेवा / ಜನಸೇವೆ)
### Unified Public Service Delivery & Citizen Grievance Redressal Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-86%20Passed%20%7C%20100%25-brightgreen.svg)](#-automated-testing--validation)
[![React](https://img.shields.io/badge/Frontend-React_19_%7C_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS_3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Blockchain](https://img.shields.io/badge/Ledger-Tamper--Evident_SHA--256_Hash_Chain-F7931A?logo=blockchain-dot-com&logoColor=white)](#)
[![IPFS](https://img.shields.io/badge/Storage-IPFS_Decentralized_Storage-65C2CB?logo=ipfs&logoColor=white)](https://ipfs.tech/)
[![Languages](https://img.shields.io/badge/Localization-13_Indian_Languages-FF9933)](#multilingual-support)

---

**JanSeva** is an enterprise-grade, full-stack digital governance platform engineered to streamline **statutory public service delivery** and automate **citizen grievance redressal**. Inspired by India's national e-governance standards (DIGIT / CPGRAMS), JanSeva introduces automated statutory Service Level Agreement (SLA) enforcement, multi-tier escalation hierarchies, intelligent sector-based round-robin dispatching, decentralized media evidence anchoring via IPFS, and a 24/7 WhatsApp citizen gateway.

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
   | - Sector Round-Robin Pool |             | - Disciplinary Tribunal   |             | - Explorer Visualization  |
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
* **Modern Web Portal:** Responsive, glassmorphic UI built in React & Tailwind with dark/light civic themes, citizen onboarding, live tracking, and digital receipt printing.
* **24/7 WhatsApp Gateway:** Automated conversational gateway powered by Baileys, enabling citizens to lodge complaints, upload image proof, check resolution status (`GRV-2026-XXXX`), and receive instant updates without internet browsing.
* **Real-Time Cloud SMS Alerts:** Automated SMS notifications via Fast2SMS dispatching status transitions directly to citizen mobile numbers.

### 2. Automated SLA Enforcement & Multi-Tier Escalations
* **Dual SLA Matrix:** Combines department statutory timelines (e.g., E-Khata: 15 days, Road Repairs: 7 days) with dynamic severity ceilings (Urgent: 24h, High: 48h, Medium: 72h, Low: 7 days) using $\text{SLA}_{\text{effective}} = \min(\text{SLA}_{\text{statutory}}, \text{SLA}_{\text{priority}})$.
* **Tier-1 Warning (75% SLA Elapsed):** Automated visual warnings and priority bumping alerting the assigned officer.
* **Tier-2 Escalation (100% SLA Breach):** Delinquent cases are automatically stripped from the officer and reassigned to the **Supervising Executive Engineer** with administrative alerts.
* **Tier-3 Disciplinary Tribunal (3-Strike System):**
  * *Strike 1:* Formal explanation demanded within 48 hours.
  * *Strike 2:* Disciplinary suspension; officer is removed from the active ticket dispatch pool.
  * *Strike 3:* Disciplinary termination with permanent exclusion.

### 3. Sector-Based Dispatching with Dynamic Spillover
* **Balanced Ward Allocation:** 16 municipal officers partitioned across 4 geographic wards and 4 municipal departments (Revenue, Water Supply, Infrastructure, Public Hazard).
* **Dynamic Spillover:** When an officer's queue reaches capacity ($K \ge 15$ active investigations), new tickets dynamically route to the least-loaded officer in the same department across adjacent wards, preventing localized municipal bottlenecks.

### 4. Cryptographic Audit Trail & Decentralized IPFS Storage
* **Tamper-Evident Ledger:** Every grievance lifecycle event (`SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED`, `APPEALED`) is permanently written to a SHA-256 hash-chained block store.
* **Blockchain Explorer:** Live visual explorer in the portal enabling citizens and auditors to inspect block hashes, previous block hashes, nonces, and timestamp proofs.
* **Decentralized Media Proof (IPFS):** Citizen image/document evidence is pinned to IPFS; the resulting immutable content identifier (`ipfs://CID`) is anchored on the ledger, preventing backdated photo tampering.

### 5. Multilingual Localization (13 Indian Languages)
Real-time, complete interface and notification translation supporting:
> **English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Telugu (తెలుగు), Malayalam (മലയാളം), Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Urdu (اردو), Assamese (অসমীয়া)**

### 6. Interactive Citizen & Officer Portals
* **Citizen Hub:** File grievances, explore public services, track tickets via live stepped progress timelines, download thermal/A4 verification receipts with QR codes, and access the interactive **AI Civic Assistant**.
* **Officer & Nodal Dashboard:** Role-based queue filters, SLA countdown clocks, citizen evidence preview, resolution verification, departmental workload distribution charts, and CSV report export.

---

## 📂 Repository Directory Structure

```text
Public-Service-Delivery-and-Citizen-Grievance-Management-System/
├── frontend/                     # React 18 Client Application
│   ├── public/                   # Static civic assets, emblems, logos
│   ├── src/
│   │   ├── components/           # Reusable UI widgets (Navbar, Stepper, Receipts)
│   │   ├── views/                # Role views (Citizen, Officer, Admin, Explorer)
│   │   ├── services/             # API client, localization, GPS reverse geocoder
│   │   ├── App.jsx               # Main React router and layout orchestrator
│   │   └── main.jsx              # React DOM bootstrap
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js / Express REST API Server
│   ├── routes/                   # Grievance, Services, Auth, and Ledger endpoints
│   ├── services/                 # Fast2SMS, WhatsApp Baileys, IPFS, SLA cron jobs
│   ├── data/                     # Persistent JSON state and ledger store
│   ├── index.js                  # Main server entrypoint (Port 5000)
│   └── package.json
│
├── simulation/                   # Discrete-Event Simulation & Benchmarking Suite
│   ├── sla_simulation.py         # Python 3 simulation engine (NHPP, R=30 runs)
│   ├── sla_simulation.js         # Node.js equivalent simulation engine
│   └── README.md                 # Detailed simulation documentation and metrics
│
├── blockchain/                   # Hyperledger Fabric chaincode & network configs
├── docs/                         # Architecture diagrams, specifications, workflows
├── .gitignore                    # Secrets, node_modules, and cache exclusion
└── README.md                     # Master project documentation
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **Docker & Docker Compose** (Optional, for full containerized deployment)
* **Python** (v3.8+ — required only if executing the simulation suite)

### 1. Clone the Repository
```bash
git clone https://github.com/Punithn9036/Public-Service-Delivery-and-Citizen-Grievance-Management-System.git
cd Public-Service-Delivery-and-Citizen-Grievance-Management-System
```

### 2. Option A: Local Development Setup

#### Backend Setup
```bash
cd backend
npm install
node index.js
```
*The backend API server will initialize on `http://localhost:5000`.*

#### Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will launch on `http://localhost:5173`.*

### 2. Option B: Docker Compose Full Stack
```bash
docker-compose up --build -d
```
*Access Frontend at `http://localhost:3000` and Backend API at `http://localhost:5000`.*

---

### 🔑 Pre-Configured Demo Accounts
| Role | Name | Email / Login | Password | Capabilities |
|---|---|---|---|---|
| **Citizen** | Aarav Sharma | `aarav.sharma@example.com` | `Password123!` | File Grievances, Apply for Services, Community Upvoting, Feedback |
| **Citizen** | Priya Sundaram | `priya.sundaram@example.com` | `Password123!` | Track Active Submissions, Download QR Receipts, Multi-Language Portal |
| **Field Officer** | Er. Rajesh Varma | `rajesh.varma@gov.in` | `Officer123!` | Water Supply & Sanitation Zonal Desk, State Transitions |
| **Field Officer** | Vikram Singh | `vikram.singh@gov.in` | `Officer123!` | Public Works & Infrastructure Desk, LED & Road Repairs |
| **Control Room Admin** | Smt. Kavitha Reddi | `admin.controlroom@gov.in` | `Admin123!` | Municipal Oversight, Officer Duty Roster, SLA Tribunal, Blockchain Audit |

---

## 🧪 Automated Testing & Validation

JanSeva includes an automated end-to-end integration and security test suite covering Authentication, RBAC, State Machine transitions, Hyperledger Fabric ledger integrity, IPFS content addressing, SLA monitoring, and Webhooks:

```bash
# Run comprehensive 86-test backend test suite
npm --prefix backend test
```

### Verified Test Coverage
* **`tests/master_audit.test.js`** — 51 tests: Auth/RBAC, Grievance Lifecycle, Public Services, Hyperledger Fabric, IPFS, SLA Monitoring, Notifications, Security Injection & XSS.
* **`tests/api_integration.test.js`** — 25 tests: REST endpoints, WhatsApp webhook, dual SLA verification.
* **`tests/auth_and_grievance.test.js`** — 10 tests: Core citizen registration, officer duty assignment, and timeline logging.

```text
Test Suites: 3 passed, 3 total
Tests:       86 passed, 86 total
Snapshots:   0 total
Time:        6.513 s
```

---

## 🧪 Running the SLA Simulation Suite

JanSeva includes an experimental discrete-event simulation suite modeling non-homogeneous Poisson arrivals ($\lambda(t)$ peaking at 11:00 AM IST) across $R = 30$ independent 30-day municipal evaluation periods ($N \approx 1,200$ tickets/run).

### Run with Python:
```bash
py simulation/sla_simulation.py
# or
python3 simulation/sla_simulation.py
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

## 🔒 Security, Privacy & Compliance

* **DPDP Act (2023) Compliance:** Citizen mobile numbers, Aadhaar identifiers, and personal names are cryptographically pseudonymized (SHA-256 salted hashes) before ledger commitment.
* **Role-Based Access Control (RBAC):** Strict JWT-authenticated role boundaries isolate Citizen, Field Officer, Supervising Engineer, and Disciplinary Tribunal actions.
* **Tamper-Evident Hashing:** Off-chain modifications to ticket severity, status, or timestamps immediately trigger state validation failures across the hash chain.

---

## 👥 Project Contributors

Developed by the Department of Computer Science & Engineering, **Presidency University, Bengaluru, India**:

* **Punith N** — *School of Computer Science and Engineering* (ID: 20231CSI0037)
* **Deeksha Suvasini S** — *School of Computer Science and Engineering* (ID: 20231CSI0055)
* **Maalvika C. H.** — *School of Computer Science and Engineering* (ID: 20231CSI0013)
* **Kavin Mahendhiran** — *School of Computer Science and Engineering*

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).

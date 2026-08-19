# Public Service Delivery & Citizen Grievance Management System (JanSeva / DIGIT CMS Inspired)

> An enterprise, full-stack, blockchain-backed public service delivery and citizen grievance redressal platform. Features real-time grievance tracking, SLA enforcement, decentralized media storage (IPFS), and a 2-Organization Hyperledger Fabric tamper-evident audit trail.

---

## 📁 Repository Directory Structure

```text
public-service-grievance-system/
├── frontend/             # React SPA (Vite, Lucide Icons, Glassmorphic UI, Citizen/Officer Portals)
├── backend/              # Node.js / Express REST API Gateway, Auth & Fabric Gateway SDK
├── blockchain/           # Hyperledger Fabric 2-Org Infrastructure
│   ├── chaincode/        # Go Smart Contract for Grievance State Transitions
│   ├── network/          # 2-Org Network Topology (PortalOrg & GovOrg)
│   └── scripts/          # Chaincode deployment and invocation scripts
├── database/             # PostgreSQL schemas, migrations, and seed scripts
├── docs/                 # System architecture specifications, API docs & user guides
├── docker/               # Dockerfiles for frontend and backend microservices
├── .env.example          # Environment variables template
├── .gitignore            # Git exclusion policies for secrets & build artifacts
├── README.md             # Project documentation
└── docker-compose.yml    # Multi-container orchestration (Postgres, IPFS, Backend, Frontend)
```

---

## 🏛️ Key System Features

- **Citizen Portal:** Lodge complaints, apply for public services with SLA guarantees, track live resolution stepper timeline (`GRV-2026-XXXX`), and rate officer performance.
- **Officer & Nodal Admin Dashboard:** Department workload breakdown, ticket routing, field officer assignment, and CSV report export.
- **Hyperledger Fabric Audit Trail (2-Org):** Immutable ledger recording every grievance status change (`Submitted ➔ Under Review ➔ Assigned ➔ In Progress ➔ Resolved`).
- **IPFS Media Attachment:** Media proof uploaded to IPFS; returned CIDs stored on-chain.
- **Knowledge Base & AI Guide:** Searchable FAQs and AI Assistant for citizen policy queries.

---

## 🚀 Quick Start (Local Setup)

### 1. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend API
```bash
cd backend
npm install
npm run dev
```

### 3. Docker Compose Full Stack
```bash
docker-compose up --build -d
```

---

## 📋 17-Phase Development Roadmap

| Phase | Milestone | Status |
|---|---|---|
| **Phase 1** | Monorepo Project Skeleton & Repository Setup | **Completed** |
| **Phase 2** | Local Dev Environment (Node, Docker, Postgres) | Pending |
| **Phase 3** | Database Design & SQL Schema Migrations | Pending |
| **Phase 4** | Backend Authentication & RBAC Middleware | Pending |
| **Phase 5** | Core Grievance CRUD & State Machine REST API | Pending |
| **Phase 6** | Frontend Citizen Shell & Navigation | Pending |
| **Phase 7** | Officer & Admin Governance Portal UI | Pending |
| **Phase 8** | Fabric Network Setup (2-Org PortalOrg / GovOrg) | Pending |
| **Phase 9** | Go Chaincode Implementation | Pending |
| **Phase 10** | Backend ↔ Fabric Gateway SDK Integration | Pending |
| **Phase 11** | IPFS Kubo Document Storage Integration | Pending |
| **Phase 12** | SLA Breach Detection & Escalation Engine | Pending |
| **Phase 13** | Analytics & Department Workload Visualizer | Pending |
| **Phase 14** | Security Hardening & Rate Limiting | Pending |
| **Phase 15** | E2E Testing Suite | Pending |
| **Phase 16** | Docker Compose Stack Integration | Pending |
| **Phase 17** | Final Project Report & Architecture Deliverables | Pending |

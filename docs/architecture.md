# System Architecture & Design Specification
## Public Service Delivery and Citizen Grievance Management System (DIGIT CMS / eGov Inspired)

### 1. Architectural Overview
This enterprise system combines high-throughput relational data processing with tamper-evident blockchain audit trails and decentralized media storage.

```
+-----------------------------------------------------------------------------------+
|                                  CITIZEN / OFFICER                                |
|                                   React SPA / UI                                  |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS / REST API
                                          v
+-----------------------------------------------------------------------------------+
|                                NODE.JS EXPRESS BACKEND                            |
|  - Role-Based Access Control (RBAC with JWT)                                      |
|  - Grievance State Machine Enforcement                                           |
|  - SLA & Escalation Engine                                                        |
+-----------------------------------------------------------------------------------+
     |                                   |                                     |
     v                                   v                                     v
+------------------+           +-------------------+               +-----------------------+
|  POSTGRESQL DB   |           |    IPFS (KUBO)    |               |  HYPERLEDGER FABRIC   |
| App Data, Users, |           | Attachment Proofs |               | 2-Org Ledger Audit    |
| Ticket Metadata  |           | File CIDs         |               | (PortalOrg & GovOrg)  |
+------------------+           +-------------------+               +-----------------------+
```

### 2. Core Architectural Principles
1. **Separation of Concerns:** Relational state in PostgreSQL for fast queries; PII kept off-chain; cryptographic hashes and state-transition logs written to Hyperledger Fabric.
2. **Simplified 2-Org Fabric Topology:** `PortalOrg` (citizen facing REST gateway) and `GovOrg` (department officers & administrative controllers) enforce dual-endorsement policies on grievance state transitions.
3. **Decentralized Media Storage:** Citizen photo evidence uploaded to IPFS node; returned Content Identifier (CID) stored in Postgres & anchored on-chain.
4. **SLA Breach Monitoring:** Automatic countdown enforcement based on grievance priority (Urgent 24h, High 48h, Medium 72h).

### 3. 17-Phase Development Roadmap
- **Phase 1:** Monorepo Project Skeleton & Repository Setup
- **Phase 2:** Local Dev Environment (Node, Docker, Postgres)
- **Phase 3:** Database Schema & Migration Setup
- **Phase 4:** Backend Auth & RBAC (JWT)
- **Phase 5:** Grievance State Machine REST APIs
- **Phase 6:** Frontend Citizen Shell (React / Vite)
- **Phase 7:** Officer & Admin Governance Portal
- **Phase 8:** Hyperledger Fabric 2-Org Network Setup
- **Phase 9:** Go Chaincode Smart Contract
- **Phase 10:** Backend ↔ Fabric Gateway SDK Integration
- **Phase 11:** IPFS Attachment Integration
- **Phase 12:** SLA Breach & Escalation Module
- **Phase 13:** Analytics & Visual Workload Breakdown
- **Phase 14:** Security Hardening & Input Sanitization
- **Phase 15:** Comprehensive End-to-End Testing
- **Phase 16:** Docker Compose Stack Integration
- **Phase 17:** Final Documentation & Report Deliverables

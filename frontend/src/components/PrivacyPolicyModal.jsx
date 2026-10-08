import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function PrivacyPolicyModal({ onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '720px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-700)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Citizen Data Privacy Policy</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Public Services and Grievance Management System Data Protection Standards</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Policy Body */}
        <div style={{ padding: '24px', overflowY: 'auto', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
          
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>1. Purpose and Scope</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              This Privacy Policy governs the collection, storage, and processing of citizen data submitted through the JanSeva Public Service Delivery and Citizen Grievance Portal. The portal operates under municipal administration and e-governance guidelines to ensure transparency, security, and accountability.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>2. Information We Collect</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)' }}>
              <li><strong>Contact Information:</strong> Full name, verified mobile phone number, and email address for status communication.</li>
              <li><strong>Grievance Details:</strong> Complaint category, description, physical street location, municipal ward, and uploaded photo evidence.</li>
              <li><strong>Geographic Data:</strong> GPS coordinates extracted from uploaded incident photographs or provided via device geolocation for field team routing.</li>
              <li><strong>Application Documents:</strong> Official identification proofs and identity documents required for certificate processing.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>3. Storage and Blockchain Audit Trail</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              To ensure non-repudiation and prevent unauthorized file alteration, grievance lifecycle events (submission, assignment, resolution) are recorded on a permissioned Hyperledger Fabric blockchain ledger. Associated photo evidence is stored on decentralized IPFS (InterPlanetary File System) storage nodes using cryptographic content identifiers (CIDs).
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>4. Access Control and Data Security</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Citizen personal data is protected via Role-Based Access Control (RBAC). Only designated field officers, zonal supervisors, and authorized municipal administrators assigned to the specific ward have access to complainant identity records. Passwords and credentials are encrypted using industry-standard bcrypt hashing.
            </p>
          </section>

          <section style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>5. Citizen Rights and Inquiries</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Citizens retain the right to inspect their filed ticket status, download official resolution receipts, and request data rectification through the nodal grievance officer. For privacy queries, citizens may contact the administrative helpline at 1800-425-GOV.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Acknowledge and Close
          </button>
        </div>

      </div>
    </div>
  );
}

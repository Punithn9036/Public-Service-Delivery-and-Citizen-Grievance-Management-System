import React from 'react';
import { FileText, X } from 'lucide-react';

export default function TermsOfServiceModal({ onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '720px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(26, 86, 219, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a56db'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Terms of Governance and Service Charter</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rules of Procedure, SLA Guarantees, and Citizen Obligations</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Terms Body */}
        <div style={{ padding: '24px', overflowY: 'auto', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
          
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>1. Acceptance of Terms</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              By logging into and utilizing the JanSeva portal to lodge complaints or apply for municipal welfare services, you agree to comply with all operational guidelines established under the Municipal Service Delivery Regulations.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>2. Citizen Obligations and Lawful Use</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)' }}>
              <li>All information, location data, and evidence photographs submitted must be truthful and accurate to the best of your knowledge.</li>
              <li>Filing intentionally fabricated, defamatory, or malicious complaints is strictly prohibited and subject to administrative penalties.</li>
              <li>Users must maintain the confidentiality of their portal login credentials and report unauthorized account access immediately.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>3. Service Level Agreement (SLA) Commitments</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Each grievance category and public service certificate operates under a defined statutory Service Level Agreement (SLA). The administration commits to resolving urgent safety hazards within 24 to 48 hours and general public service applications within designated statutory timelines (3 to 14 days). Unresolved issues are subject to automated escalation to the Nodal Grievance Officer.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>4. Resolution Verification and Re-Opening Protocol</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Upon resolution of a grievance by a field officer, citizens have a 7-day review window to inspect field remediation. If the reported issue remains unresolved, citizens hold the statutory right to re-open the ticket for higher supervisory review.
            </p>
          </section>

          <section style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>5. Legal Disclaimer</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              The portal is provided as an administrative facilitation platform. While the administration strives for uninterrupted 24x7 service availability, maintenance windows and unforeseen infrastructure disruptions may occasionally occur.
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

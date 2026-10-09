import React, { useState } from 'react';
import { FileText, CheckCircle2, Send, Clock, ShieldCheck, User, Phone, Mail, Upload, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ipfsAPI } from '../api/apiClient';

export default function ServiceApplicationModal({ service, onClose, onSubmitApplication }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    applicantName: user?.fullName || '',
    applicantEmail: user?.email || '',
    applicantPhone: user?.phone || '',
    identityProof: 'Aadhaar Card',
    identityNumber: '',
    address: '',
    declarationAgreed: false
  });

  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState('');
  const [docCid, setDocCid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.applicantPhone || !formData.declarationAgreed) {
      alert("Please fill in required fields and agree to the declaration.");
      return;
    }

    setIsSubmitting(true);
    let finalCid = null;

    if (docFile) {
      try {
        const ipfsRes = await ipfsAPI.uploadFile(docFile, docFileName || 'identity_document.pdf');
        if (ipfsRes && ipfsRes.cid) {
          finalCid = ipfsRes.cid;
        }
      } catch (err) {
        console.warn("IPFS upload warning:", err);
      }
    }

    setDocCid(finalCid);

    const newAppId = `APP-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const newApp = {
      id: newAppId,
      serviceId: service.id,
      serviceName: service.name,
      department: service.department,
      applicantName: formData.applicantName,
      applicantEmail: formData.applicantEmail,
      applicantPhone: formData.applicantPhone,
      identityProof: formData.identityProof,
      identityNumber: formData.identityNumber,
      address: formData.address,
      ipfsDocumentCid: finalCid,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
      slaDays: service.slaDays,
      estimatedCompletion: new Date(Date.now() + service.slaDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      remarks: 'Application submitted. Document verification under process.'
    };

    setIsSubmitting(false);
    onSubmitApplication(newApp);
    setSubmittedId(newAppId);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '650px' }}>
        
        <div className="modal-header">
          <div className="modal-title-box">
            <FileText size={22} className="text-emerald" />
            <div>
              <h2>Apply for Public Service</h2>
              <p>{service.name} ({service.department})</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {submittedId ? (
          <div className="modal-body success-state text-center" style={{ padding: '40px 20px' }}>
            <div className="success-icon-wrapper" style={{ margin: '0 auto 16px', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <h2>Application Submitted Successfully!</h2>
            <p className="success-sub">Application Reference Tracking Code:</p>
            <div className="id-highlight-box">{submittedId}</div>
            {docCid && (
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: '8px',
                margin: '15px 0',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="small-text text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={14} className="text-blue" /> IPFS Verification CID:
                </span>
                <a
                  href={`http://localhost:5000/api/ipfs/${docCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  title="View pinned identity document via IPFS Gateway"
                >
                  <span>{docCid.slice(0, 16)}...{docCid.slice(-6)}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
            <p className="muted-text" style={{ margin: '15px 0 20px' }}>
              Guaranteed SLA Delivery: <strong>{service.slaDays} Days</strong> (Target: {new Date(Date.now() + service.slaDays * 24 * 60 * 60 * 1000).toLocaleDateString()})
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Return to Services
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            
            {/* Service Summary Info */}
            <div className="form-info-box border-blue" style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div className="flex-between">
                <span>Government Fee: <strong>{service.fee}</strong></span>
                <span className="sla-pill"><Clock size={12} /> {service.slaDays} Days SLA Guarantee</span>
              </div>
              <p className="small-text" style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
                <strong>Required Documents:</strong> {service.documentsNeeded.join(', ')}
              </p>
            </div>

            <div className="form-grid-2">
              <div className="form-group col-span-2">
                <label>Applicant Full Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter full legal name as in ID"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mobile Number (for SMS Tracking) <span className="req">*</span></label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98765 43210"
                  value={formData.applicantPhone}
                  onChange={(e) => setFormData({...formData, applicantPhone: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="applicant@example.com"
                  value={formData.applicantEmail}
                  onChange={(e) => setFormData({...formData, applicantEmail: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Govt Identity Document Type</label>
                <select 
                  value={formData.identityProof}
                  onChange={(e) => setFormData({...formData, identityProof: e.target.value})}
                  className="form-input"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>Identity Proof Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. XXXX-XXXX-1234"
                  value={formData.identityNumber}
                  onChange={(e) => setFormData({...formData, identityNumber: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group col-span-2">
                <label>Residential Address</label>
                <textarea 
                  rows={2}
                  placeholder="Full door number, street, ward, city..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group col-span-2">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Supporting Identity / Proof Document (Optional)</span>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Database size={12} /> IPFS Pinned
                  </span>
                </label>
                <div style={{
                  border: '1.5px dashed var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                  textAlign: 'center',
                  background: 'var(--bg-tertiary)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    id="app-doc-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFile(e.target.files[0]);
                        setDocFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="app-doc-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <Upload size={20} className="text-blue" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {docFileName ? `Selected: ${docFileName}` : 'Choose PDF, JPEG, or PNG to Pin to IPFS'}
                    </span>
                    <span className="small-text text-muted" style={{ fontSize: '0.72rem' }}>
                      Cryptographic SHA-256 Content-Addressed Storage
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group col-span-2 flex-align-center" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="decl"
                  checked={formData.declarationAgreed}
                  onChange={(e) => setFormData({...formData, declarationAgreed: e.target.checked})}
                />
                <label htmlFor="decl" className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                  I declare that all submitted information is accurate and true according to state government rules.
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!formData.declarationAgreed || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Pinning to IPFS...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Official Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

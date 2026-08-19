import React, { useState } from 'react';
import { FileText, CheckCircle2, Send, Clock, ShieldCheck } from 'lucide-react';

export default function ServiceApplicationModal({ service, onClose, onSubmitApplication }) {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    identityProof: 'Aadhaar Card',
    identityNumber: '',
    address: '',
    declarationAgreed: false
  });

  const [submittedId, setSubmittedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.applicantPhone || !formData.declarationAgreed) {
      alert("Please fill in required fields and agree to the declaration.");
      return;
    }

    const newAppId = `APP-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const newApp = {
      id: newAppId,
      serviceId: service.id,
      serviceName: service.name,
      department: service.department,
      applicantName: formData.applicantName,
      applicantEmail: formData.applicantEmail,
      applicantPhone: formData.applicantPhone,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
      slaDays: service.slaDays,
      estimatedCompletion: new Date(Date.now() + service.slaDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      remarks: 'Application submitted. Document verification under process.'
    };

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
              <h2>Apply for Service</h2>
              <p>{service.name} ({service.department})</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {submittedId ? (
          <div className="modal-body success-state text-center" style={{ padding: '40px 20px' }}>
            <CheckCircle2 size={56} color="#16a34a" />
            <h2>Application Submitted!</h2>
            <p className="success-sub">Application Reference Code:</p>
            <div className="id-highlight-box">{submittedId}</div>
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
            <div className="form-info-box border-blue">
              <div className="flex-between">
                <span>Government Fee: <strong>{service.fee}</strong></span>
                <span className="sla-pill"><Clock size={12} /> {service.slaDays} Days SLA Guarantee</span>
              </div>
              <p className="small-text mt-2"><strong>Required Documents:</strong> {service.documentsNeeded.join(', ')}</p>
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

              <div className="form-group col-span-2 flex-align-center">
                <input 
                  type="checkbox" 
                  id="decl"
                  checked={formData.declarationAgreed}
                  onChange={(e) => setFormData({...formData, declarationAgreed: e.target.checked})}
                />
                <label htmlFor="decl" className="checkbox-label">
                  I declare that all submitted information is accurate and true according to state government rules.
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!formData.declarationAgreed}>
                <Send size={16} /> Submit Official Application
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

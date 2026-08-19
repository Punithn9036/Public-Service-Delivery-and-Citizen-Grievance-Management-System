import React, { useState } from 'react';
import { FilePlus, MapPin, Upload, AlertCircle, Send, CheckCircle2, User, Phone, Mail } from 'lucide-react';

export default function GrievanceFormModal({ departments, onClose, onSubmitGrievance }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Sanitation & Waste Management',
    department: departments[0] || 'Water Supply & Sanitation',
    priority: 'Medium',
    description: '',
    location: '',
    landmark: '',
    citizenName: '',
    citizenPhone: '',
    citizenEmail: '',
    attachmentName: ''
  });

  const [submittedId, setSubmittedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.citizenName || !formData.citizenPhone) {
      alert("Please fill in all required fields.");
      return;
    }

    const newTicketId = `GRV-2026-${Math.floor(8000 + Math.random() * 1900)}`;
    const newGrievance = {
      id: newTicketId,
      ...formData,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedOfficer: 'Control Room Officer (Pending Dispatch)',
      assignedOfficerContact: '+91 1800-425-GOV',
      slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          note: 'Grievance lodged online via JanSeva Citizen Portal.'
        }
      ],
      feedback: null
    };

    onSubmitGrievance(newGrievance);
    setSubmittedId(newTicketId);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '720px' }}>
        
        <div className="modal-header">
          <div className="modal-title-box">
            <FilePlus size={22} className="text-blue" />
            <div>
              <h2>Lodge a New Grievance</h2>
              <p>Submit your complaint directly to the responsible municipal department</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {submittedId ? (
          <div className="modal-body success-state text-center" style={{ padding: '40px 20px' }}>
            <div className="success-icon-wrapper">
              <CheckCircle2 size={56} color="#16a34a" />
            </div>
            <h2>Grievance Lodged Successfully!</h2>
            <p className="success-sub">Your complaint has been assigned Reference ID:</p>
            <div className="id-highlight-box">{submittedId}</div>
            <p className="muted-text" style={{ margin: '15px 0 25px' }}>
              An SMS with your tracking link has been sent to <strong>{formData.citizenPhone}</strong>. You can monitor field officer status anytime on the tracking page.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            
            <div className="form-grid-2">
              <div className="form-group col-span-2">
                <label>Grievance Subject / Title <span className="req">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Broken water pipeline causing flooding near Ward 12..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Target Department <span className="req">*</span></label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="form-input"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority Level <span className="req">*</span></label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="form-input"
                >
                  <option value="Low">Low (General Inquiry / Request)</option>
                  <option value="Medium">Medium (Standard Issue - 3 Day SLA)</option>
                  <option value="High">High (Safety Hazard / 48 hr SLA)</option>
                  <option value="Urgent">Urgent (Health/Flood Emergency - 24 hr SLA)</option>
                </select>
              </div>

              <div className="form-group col-span-2">
                <label>Detailed Description of Complaint <span className="req">*</span></label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe the issue in detail (duration, exact location, impact on public)..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Locality / Street Address / Ward <span className="req">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Block B, Main Market Road, Ward 12"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Landmark (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Opposite Central Bus Terminal"
                  value={formData.landmark}
                  onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Citizen Full Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Your Full Name"
                  value={formData.citizenName}
                  onChange={(e) => setFormData({...formData, citizenName: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mobile Phone Number (for SMS Alerts) <span className="req">*</span></label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98765 43210"
                  value={formData.citizenPhone}
                  onChange={(e) => setFormData({...formData, citizenPhone: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group col-span-2">
                <label>Photo / Video Attachment (Simulated)</label>
                <div className="file-upload-box">
                  <Upload size={20} className="text-muted" />
                  <span>Drag & drop photo proof (JPG, PNG, max 10MB) or click to browse</span>
                  <input 
                    type="file" 
                    onChange={(e) => setFormData({...formData, attachmentName: e.target.files[0]?.name || ''})}
                    className="file-hidden-input"
                  />
                  {formData.attachmentName && (
                    <span className="file-name-chip">Attached: {formData.attachmentName}</span>
                  )}
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Submit Grievance
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

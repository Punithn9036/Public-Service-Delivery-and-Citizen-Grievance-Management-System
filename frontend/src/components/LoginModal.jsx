import React, { useState } from 'react';
import { 
  Lock, 
  UserCheck, 
  ShieldCheck, 
  Mail, 
  Key, 
  LogIn, 
  AlertCircle, 
  Phone, 
  User, 
  BadgeCheck, 
  Building2, 
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/apiClient';

export default function LoginModal({ onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [selectedRole, setSelectedRole] = useState('OFFICER'); // 'CITIZEN' | 'OFFICER' | 'ADMIN'
  
  const [formData, setFormData] = useState({
    fullName: 'Er. Rajesh Varma',
    email: 'rajesh.varma@gov.in',
    phone: '+91 94433 11223',
    password: 'Officer123!',
    department: 'Water Supply & Sanitation',
    employeeId: 'EMP-GOV-2001'
  });

  const [verifiedOfficer, setVerifiedOfficer] = useState(null);
  const [verifyingId, setVerifyingId] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Preset switcher
  const handleQuickPreset = (role) => {
    setSelectedRole(role);
    setError('');
    setVerifyNotice(null);
    setVerifiedOfficer(null);

    if (role === 'OFFICER') {
      setFormData({
        fullName: 'Er. Rajesh Varma',
        email: 'rajesh.varma@gov.in',
        phone: '+91 94433 11223',
        password: 'Officer123!',
        department: 'Water Supply & Sanitation',
        employeeId: 'EMP-GOV-2001'
      });
    } else if (role === 'ADMIN') {
      setFormData({
        fullName: 'Smt. Kavitha Reddi',
        email: 'admin.controlroom@gov.in',
        phone: '+91 94411 99887',
        password: 'Admin123!',
        department: 'Municipal Governance',
        employeeId: 'ADMIN-GOV-001'
      });
    } else {
      setFormData({
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        password: 'Password123!',
        department: '',
        employeeId: ''
      });
    }
  };

  // Verify Officer Government Unique Employee ID
  const handleVerifyEmployeeId = async (idToVerify) => {
    const empId = (idToVerify || formData.employeeId || '').trim();
    if (!empId) {
      setError('Please enter a Government Employee ID (e.g. EMP-GOV-2002)');
      return;
    }

    setError('');
    setVerifyNotice(null);
    setVerifyingId(true);

    try {
      const res = await authAPI.verifyEmployee(empId);
      if (res && res.valid && res.employee) {
        setVerifiedOfficer(res.employee);
        setFormData(prev => ({
          ...prev,
          employeeId: res.employee.employeeId,
          fullName: res.employee.fullName,
          department: res.employee.department,
          email: res.employee.email || prev.email
        }));
        setVerifyNotice({
          type: 'success',
          text: `Verified: ${res.employee.fullName} • ${res.employee.department} (${res.employee.designation})`
        });
      }
    } catch (err) {
      setVerifiedOfficer(null);
      setVerifyNotice({
        type: 'error',
        text: err.message || 'Invalid Employee ID. Access restricted to authorized personnel.'
      });
    } finally {
      setVerifyingId(false);
    }
  };

  // Quick Select an Unregistered Demo Employee ID
  const handleSelectSampleEmployee = (sampleId) => {
    setFormData(prev => ({ ...prev, employeeId: sampleId }));
    handleVerifyEmployeeId(sampleId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterView) {
        if (selectedRole === 'OFFICER' && !formData.employeeId) {
          setError('Government Employee ID is strictly required to register as an Officer.');
          setLoading(false);
          return;
        }

        await register({ ...formData, role: selectedRole });
      } else {
        // Can log in with either employeeId or email
        const loginIdentifier = (selectedRole === 'OFFICER' && formData.employeeId && !formData.email)
          ? formData.employeeId
          : formData.email;

        await login(loginIdentifier, formData.password, formData.phone);
      }
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <ShieldCheck size={22} className="text-blue" />
            <div>
              <h2>{isRegisterView ? 'Register Account' : 'Portal Login & Authorization'}</h2>
              <p className="small-text text-muted">
                {selectedRole === 'OFFICER' && isRegisterView
                  ? 'Government Employee Unique ID (KGID / HRMS) Verification Required'
                  : 'Official Public Service Delivery & Grievance Redressal Gateway'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-banner flex-align-center gap-2 mb-3" style={{ padding: '10px', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Role Quick Selector */}
          <div className="portal-toggle-pill mb-3" style={{ justifyContent: 'center' }}>
            <button 
              type="button"
              className={`portal-btn ${selectedRole === 'CITIZEN' ? 'active' : ''}`}
              onClick={() => handleQuickPreset('CITIZEN')}
            >
              <UserCheck size={14} /> Citizen
            </button>
            <button 
              type="button"
              className={`portal-btn ${selectedRole === 'OFFICER' ? 'active' : ''}`}
              onClick={() => handleQuickPreset('OFFICER')}
            >
              <ShieldCheck size={14} /> Field Officer
            </button>
            <button 
              type="button"
              className={`portal-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
              onClick={() => handleQuickPreset('ADMIN')}
            >
              <Lock size={14} /> Nodal Admin
            </button>
          </div>

          {/* OFFICER REGISTRATION: GOVERNMENT UNIQUE EMPLOYEE ID VERIFICATION */}
          {isRegisterView && selectedRole === 'OFFICER' && (
            <div style={{
              background: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                <BadgeCheck size={16} /> Government Personnel Verification (KGID / HRMS)
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Only verified government employees can create an Officer account. Enter your official Service Code to unlock registration.
              </p>

              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Government Employee Unique ID <span className="req">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-GOV-2002"
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value });
                    setVerifiedOfficer(null);
                    setVerifyNotice(null);
                  }}
                  className="track-input"
                  style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleVerifyEmployeeId(formData.employeeId)}
                  disabled={verifyingId}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {verifyingId ? 'Verifying...' : 'Verify ID'}
                </button>
              </div>

              {/* Real-time Verification Feedback */}
              {verifyNotice && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: verifyNotice.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: verifyNotice.type === 'success' ? '#15803d' : '#b91c1c'
                }}>
                  {verifyNotice.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{verifyNotice.text}</span>
                </div>
              )}

              {/* Clickable Authorized Demo Employee IDs */}
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(37, 99, 235, 0.2)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Available Authorized Demo IDs (Click to test):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectSampleEmployee('EMP-GOV-2002')}
                    style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    EMP-GOV-2002 (PWD)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSampleEmployee('EMP-GOV-2003')}
                    style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    EMP-GOV-2003 (Health)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSampleEmployee('EMP-GOV-2004')}
                    style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    EMP-GOV-2004 (Electricity)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Name Field */}
          {isRegisterView && (
            <div className="form-group mb-3">
              <label>
                Full Name <span className="req">*</span>
                {verifiedOfficer && <span style={{ fontSize: '0.72rem', color: '#16a34a', marginLeft: '6px' }}>(Locked from Govt Registry)</span>}
              </label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Er. Rajesh Varma"
                  value={formData.fullName}
                  readOnly={!!verifiedOfficer}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="track-input"
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '10px 10px 10px 38px',
                    background: verifiedOfficer ? 'var(--bg-tertiary)' : 'inherit'
                  }}
                />
              </div>
            </div>
          )}

          {/* Officer Department Lock */}
          {isRegisterView && selectedRole === 'OFFICER' && (
            <div className="form-group mb-3">
              <label>Official Department <span className="req">*</span></label>
              <div className="input-group">
                <Building2 size={16} className="input-icon" />
                <input 
                  type="text" 
                  required
                  value={formData.department}
                  readOnly={!!verifiedOfficer}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="track-input"
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '10px 10px 10px 38px',
                    background: verifiedOfficer ? 'var(--bg-tertiary)' : 'inherit'
                  }}
                />
              </div>
            </div>
          )}

          {/* Login Identifier / Email Address Field */}
          <div className="form-group mb-3">
            <label>
              {selectedRole === 'OFFICER' && !isRegisterView
                ? 'Government Employee ID or Email *'
                : 'Email Address *'}
            </label>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input 
                type="text" 
                required
                placeholder={selectedRole === 'OFFICER' && !isRegisterView ? 'e.g. EMP-GOV-2001 or rajesh.varma@gov.in' : 'name@example.com'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="track-input"
                style={{ fontSize: '0.9rem', padding: '10px 10px 10px 38px' }}
              />
            </div>
            {selectedRole === 'OFFICER' && !isRegisterView && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                Tip: You can log in using either your Employee ID (e.g. <code>EMP-GOV-2001</code>) or your official email.
              </span>
            )}
          </div>

          {/* Mobile Number for Alerts */}
          {(isRegisterView || selectedRole === 'CITIZEN') && (
            <div className="form-group mb-3">
              <label>Mobile Number (for Real Fast2SMS & WhatsApp Alerts) <span className="req">*</span></label>
              <div className="input-group">
                <Phone size={16} className="input-icon" />
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. +91 98765 43210 or 10-digit mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="track-input"
                  style={{ fontSize: '0.9rem', padding: '10px 10px 10px 38px' }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', display: 'block', marginTop: '3px' }}>
                ✓ Real SMS (Fast2SMS) and WhatsApp grievance alerts will be sent to this number
              </span>
            </div>
          )}

          {/* Password Field */}
          <div className="form-group mb-3">
            <label>Password <span className="req">*</span></label>
            <div className="input-group">
              <Key size={16} className="input-icon" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="track-input"
                style={{ fontSize: '0.9rem', padding: '10px 10px 10px 38px' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setIsRegisterView(!isRegisterView);
                setError('');
                setVerifyNotice(null);
              }}
            >
              {isRegisterView ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <LogIn size={16} /> {loading ? 'Authenticating...' : (isRegisterView ? 'Register Officer' : 'Sign In')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

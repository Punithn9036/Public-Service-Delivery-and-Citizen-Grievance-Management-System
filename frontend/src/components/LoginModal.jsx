import React, { useState } from 'react';
import { Lock, UserCheck, ShieldCheck, Mail, Key, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [selectedRole, setSelectedRole] = useState('OFFICER'); // 'CITIZEN' | 'OFFICER' | 'ADMIN'
  const [formData, setFormData] = useState({
    fullName: '',
    email: 'rajesh.varma@gov.in',
    phone: '+91 94433 11223',
    password: 'Officer123!',
    department: 'Water Supply & Sanitation'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickPreset = (role) => {
    setSelectedRole(role);
    if (role === 'OFFICER') {
      setFormData({
        fullName: 'Er. Rajesh Varma',
        email: 'rajesh.varma@gov.in',
        phone: '+91 94433 11223',
        password: 'Officer123!',
        department: 'Water Supply & Sanitation'
      });
    } else if (role === 'ADMIN') {
      setFormData({
        fullName: 'Smt. Kavitha Reddi',
        email: 'admin.controlroom@gov.in',
        phone: '+91 94411 99887',
        password: 'Admin123!',
        department: 'Municipal Governance'
      });
    } else {
      setFormData({
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        password: 'Password123!',
        department: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterView) {
        await register({ ...formData, role: selectedRole });
      } else {
        await login(formData.email, formData.password);
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
      <div className="modal-content animate-slide-up" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <ShieldCheck size={22} className="text-blue" />
            <div>
              <h2>{isRegisterView ? 'Register Account' : 'Portal Login & Authorization'}</h2>
              <p className="small-text text-muted">Authenticate to obtain JWT token for governance features</p>
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

          <div className="form-group mb-3">
            <label>Email Address <span className="req">*</span></label>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="track-input"
                style={{ fontSize: '0.9rem', padding: '10px 10px 10px 38px' }}
              />
            </div>
          </div>

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
            <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterView(!isRegisterView)}>
              {isRegisterView ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <LogIn size={16} /> {loading ? 'Authenticating...' : (isRegisterView ? 'Register Account' : 'Sign In')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

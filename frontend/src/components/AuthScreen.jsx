import React, { useState } from 'react';
import { Building, ShieldCheck, UserCheck, Lock, Mail, Phone, User, ArrowRight, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthScreen() {
  const { login, register, quickDemoLogin } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('CITIZEN'); // 'CITIZEN' | 'OFFICER' | 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Water Supply & Sanitation');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName || !email || !phone || !password) {
          throw new Error('Please fill in all required fields.');
        }
        await register({
          fullName,
          email,
          phone,
          password,
          role,
          department: role === 'CITIZEN' ? null : department
        });
        setSuccessMsg('Account registered successfully! Redirecting...');
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole) => {
    setError(null);
    try {
      if (demoRole === 'CITIZEN') {
        setEmail('aarav.sharma@example.com');
        setPassword('Password123!');
      } else if (demoRole === 'OFFICER') {
        setEmail('rajesh.varma@gov.in');
        setPassword('Officer123!');
      } else if (demoRole === 'ADMIN') {
        setEmail('admin.controlroom@gov.in');
        setPassword('Admin123!');
      }
      quickDemoLogin(demoRole);
    } catch (e) {
      setError('Quick login failed: ' + e.message);
    }
  };


  return (
    <div className="auth-screen-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 10%, rgba(37, 99, 235, 0.08), transparent 70%), var(--bg-primary)'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        position: 'relative'
      }}>
        
        {/* Top Right Regional Language Selector */}
        <div style={{
          position: 'absolute',
          top: '18px',
          right: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-tertiary, rgba(255,255,255,0.06))',
          borderRadius: '18px',
          padding: '3px 8px',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
          gap: '4px'
        }}>
          <Globe size={13} style={{ color: 'var(--brand-500, #2563eb)' }} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--text-main, #ffffff)',
              border: 'none',
              outline: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            aria-label="Select State Language"
            title="Select Regional Language"
          >
            <option value="en" style={{ background: '#1e293b', color: '#fff' }}>English (Official)</option>
            <option value="hi" style={{ background: '#1e293b', color: '#fff' }}>हिन्दी (North & Central)</option>
            <option value="kn" style={{ background: '#1e293b', color: '#fff' }}>ಕನ್ನಡ (Karnataka)</option>
            <option value="ta" style={{ background: '#1e293b', color: '#fff' }}>தமிழ் (Tamil Nadu)</option>
            <option value="te" style={{ background: '#1e293b', color: '#fff' }}>తెలుగు (AP & Telangana)</option>
            <option value="ml" style={{ background: '#1e293b', color: '#fff' }}>മലയാളം (Kerala)</option>
            <option value="mr" style={{ background: '#1e293b', color: '#fff' }}>मराठी (Maharashtra)</option>
            <option value="gu" style={{ background: '#1e293b', color: '#fff' }}>ગુજરાતી (Gujarat)</option>
            <option value="bn" style={{ background: '#1e293b', color: '#fff' }}>বাংলা (West Bengal)</option>
            <option value="or" style={{ background: '#1e293b', color: '#fff' }}>ଓଡ଼ିଆ (Odisha)</option>
            <option value="pa" style={{ background: '#1e293b', color: '#fff' }}>ਪੰਜਾਬੀ (Punjab)</option>
            <option value="as" style={{ background: '#1e293b', color: '#fff' }}>অসমীয়া (Assam)</option>
            <option value="ur" style={{ background: '#1e293b', color: '#fff' }}>اردو (J&K, Telangana, UP)</option>
          </select>
        </div>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
          }}>
            <Building size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>
            JanSeva Governance Portal
          </h2>
          <p className="small-text" style={{ margin: 0, color: 'var(--text-muted)' }}>
            Unified Public Service Delivery & Grievance Redressal System
          </p>
        </div>

        {/* Auth Mode Toggle (Login vs Register) */}
        <div className="auth-toggle-pill-wrapper" style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '22px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            className={`auth-toggle-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-toggle-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(null); }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.85rem',
            marginBottom: '18px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            fontSize: '0.85rem',
            marginBottom: '18px'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Account Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('CITIZEN')}
                    className={`auth-role-select-btn ${role === 'CITIZEN' ? 'selected' : ''}`}
                  >
                    <UserCheck size={16} color={role === 'CITIZEN' ? '#2563eb' : 'currentColor'} />
                    <span className="small-text font-bold">Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('OFFICER')}
                    className={`auth-role-select-btn ${role === 'OFFICER' ? 'selected' : ''}`}
                  >
                    <ShieldCheck size={16} color={role === 'OFFICER' ? '#2563eb' : 'currentColor'} />
                    <span className="small-text font-bold">Gov Officer</span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="auth-input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input-field"
                  />
                </div>
              </div>

              {role !== 'CITIZEN' && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Assigned Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="auth-input-field"
                    style={{ paddingLeft: '12px' }}
                  >
                    <option value="Water Supply & Sanitation">Water Supply & Sanitation</option>
                    <option value="Public Works & Infrastructure">Public Works & Infrastructure</option>
                    <option value="Revenue & Land Records">Revenue & Land Records</option>
                    <option value="Public Health & Safety">Public Health & Safety</option>
                    <option value="Municipal Governance">Municipal Governance</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="name@example.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-field"
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px dashed var(--border-subtle)' }}>
          <p className="small-text" style={{ margin: '0 0 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Quick Demo Login Profiles (One-Click):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary demo-pill-btn"
              onClick={() => handleQuickLogin('CITIZEN')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 600 }}
            >
              👤 Citizen (Aarav)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary demo-pill-btn"
              onClick={() => handleQuickLogin('OFFICER')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 600 }}
            >
              🛡️ Officer (Rajesh)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary demo-pill-btn"
              onClick={() => handleQuickLogin('ADMIN')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 600 }}
            >
              🏛️ Admin (Kavitha)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

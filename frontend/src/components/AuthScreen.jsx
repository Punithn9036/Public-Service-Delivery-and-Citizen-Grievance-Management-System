import React, { useState } from 'react';
import { 
  Building, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Globe,
  BadgeCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../api/apiClient';
import govHeroBg from '../assets/gov-hero-bg.png';

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
  
  // Officer Government Unique Employee ID Verification States
  const [employeeId, setEmployeeId] = useState('');
  const [verifiedOfficer, setVerifiedOfficer] = useState(null);
  const [verifyingId, setVerifyingId] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Real-time verification of Government Employee ID
  const handleVerifyEmployeeId = async (idToVerify) => {
    const empId = (idToVerify || employeeId || '').trim();
    if (!empId) {
      setError('Please enter a Government Employee ID (e.g. EMP-GOV-2002)');
      return;
    }

    setError(null);
    setVerifyNotice(null);
    setVerifyingId(true);

    try {
      const res = await authAPI.verifyEmployee(empId);
      if (res && res.valid && res.employee) {
        setVerifiedOfficer(res.employee);
        setEmployeeId(res.employee.employeeId);
        setFullName(res.employee.fullName);
        setDepartment(res.employee.department);
        if (res.employee.email) {
          setEmail(res.employee.email);
        }
        setVerifyNotice({
          type: 'success',
          text: `Verified Official: ${res.employee.fullName} • ${res.employee.department} (${res.employee.designation})`
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

  // Quick select an available demo Employee ID for testing
  const handleSelectSampleEmployee = (sampleId) => {
    setEmployeeId(sampleId);
    handleVerifyEmployeeId(sampleId);
  };

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

        if (role === 'OFFICER' && !employeeId.trim()) {
          throw new Error('Government Employee Unique ID (KGID / HRMS) is required to register as an Officer.');
        }

        await register({
          fullName,
          email,
          phone,
          password,
          role,
          employeeId: role === 'OFFICER' ? employeeId.trim() : null,
          department: role === 'CITIZEN' ? null : department
        });
        setSuccessMsg('Account registered successfully! Redirecting...');
      } else {
        if (!email || !password) {
          throw new Error('Please enter your Employee ID / Email and password.');
        }
        await login(email, password, phone);
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
        setEmail('EMP-GOV-2001');
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
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0a1223'
    }}>
      {/* Overhanging Hero Background Layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '-2cm',
          right: '-2cm',
          bottom: 0,
          width: 'calc(100% + 4cm)',
          backgroundImage: `linear-gradient(180deg, rgba(10, 18, 35, 0.45) 0%, rgba(10, 18, 35, 0.65) 50%, rgba(10, 18, 35, 0.85) 100%), url(${govHeroBg})`,
          backgroundAttachment: 'scroll',
          backgroundSize: 'cover',
          backgroundPosition: 'calc(50% + 0.5cm) 30%',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className="glass-card" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '36px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Top Right Regional Language Selector */}
        <div style={{
          position: 'absolute',
          top: '18px',
          right: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          padding: '3px 8px',
          border: '1px solid var(--border-subtle)',
          gap: '4px'
        }}>
          <Globe size={13} style={{ color: 'var(--brand-700)' }} />
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 2px 8px rgba(74, 74, 74, 0.1)'
          }}>
            <Building size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>
            JanSeva Governance Portal
          </h2>
          <p className="small-text" style={{ margin: 0, color: 'var(--text-muted)' }}>
            {t('brandSubtitle')}
          </p>
        </div>

        {/* Auth Mode Toggle (Login vs Register) */}
        <div className="auth-toggle-pill-wrapper" style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            className={`auth-toggle-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { 
              setIsRegister(false); 
              setError(null); 
              setVerifyNotice(null); 
            }}
          >
            {t('signIn')}
          </button>
          <button
            type="button"
            className={`auth-toggle-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { 
              setIsRegister(true); 
              setError(null); 
              setVerifyNotice(null); 
            }}
          >
            {t('createAccount')}
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
              {/* Account Role Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Account Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('CITIZEN');
                      setVerifiedOfficer(null);
                      setVerifyNotice(null);
                      setError(null);
                    }}
                    className={`auth-role-select-btn ${role === 'CITIZEN' ? 'selected' : ''}`}
                  >
                    <UserCheck size={16} color={role === 'CITIZEN' ? 'var(--brand-700)' : 'currentColor'} />
                    <span className="small-text font-bold">Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('OFFICER');
                      setVerifiedOfficer(null);
                      setVerifyNotice(null);
                      setError(null);
                    }}
                    className={`auth-role-select-btn ${role === 'OFFICER' ? 'selected' : ''}`}
                  >
                    <ShieldCheck size={16} color={role === 'OFFICER' ? 'var(--brand-700)' : 'currentColor'} />
                    <span className="small-text font-bold">Gov Officer</span>
                  </button>
                </div>
              </div>

              {/* MANDATORY GOVERNMENT EMPLOYEE ID VERIFICATION (FIELD OFFICERS ONLY) */}
              {role === 'OFFICER' && (
                <div style={{
                  background: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <BadgeCheck size={16} /> Government Personnel Verification (KGID / HRMS)
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Only verified government employees can create an Officer account. Enter your official Service ID to unlock registration.
                  </p>

                  <label className="small-text font-bold" style={{ display: 'block', marginBottom: '4px', color: 'var(--text-main)' }}>
                    Government Employee Unique ID <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-GOV-2002"
                      value={employeeId}
                      onChange={(e) => {
                        setEmployeeId(e.target.value);
                        setVerifiedOfficer(null);
                        setVerifyNotice(null);
                      }}
                      className="auth-input-field"
                      style={{ 
                        flex: 1, 
                        fontFamily: 'monospace', 
                        textTransform: 'uppercase', 
                        fontWeight: 700,
                        letterSpacing: '0.5px' 
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleVerifyEmployeeId(employeeId)}
                      disabled={verifyingId}
                      style={{ whiteSpace: 'nowrap', padding: '0 16px', fontWeight: 600 }}
                    >
                      {verifyingId ? 'Verifying...' : 'Verify ID'}
                    </button>
                  </div>

                  {/* Real-time Verification Feedback */}
                  {verifyNotice && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: verifyNotice.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: verifyNotice.type === 'success' ? '#15803d' : '#b91c1c',
                      border: `1px solid ${verifyNotice.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                    }}>
                      {verifyNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{verifyNotice.text}</span>
                    </div>
                  )}

                  {/* Clickable Authorized Demo Employee IDs */}
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(37, 99, 235, 0.2)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Available Authorized Demo IDs (Click to auto-verify):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectSampleEmployee('EMP-GOV-2002')}
                        style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        EMP-GOV-2002 (PWD)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSampleEmployee('EMP-GOV-2003')}
                        style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        EMP-GOV-2003 (Health)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSampleEmployee('EMP-GOV-2004')}
                        style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        EMP-GOV-2004 (Electricity)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div style={{ marginBottom: '14px' }}>
                <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Full Name
                  {verifiedOfficer && <span style={{ fontSize: '0.72rem', color: '#16a34a', marginLeft: '6px' }}>(✓ Locked from Govt Registry)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Ananya Sen"
                    value={fullName}
                    readOnly={!!verifiedOfficer}
                    onChange={(e) => setFullName(e.target.value)}
                    className="auth-input-field"
                    style={{ background: verifiedOfficer ? 'var(--bg-tertiary)' : 'inherit' }}
                  />
                </div>
              </div>

              {/* Assigned Department */}
              {role !== 'CITIZEN' && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                    Assigned Department
                    {verifiedOfficer && <span style={{ fontSize: '0.72rem', color: '#16a34a', marginLeft: '6px' }}>(✓ Locked from Govt Registry)</span>}
                  </label>
                  {verifiedOfficer ? (
                    <input
                      type="text"
                      readOnly
                      value={department}
                      className="auth-input-field"
                      style={{ background: 'var(--bg-tertiary)' }}
                    />
                  ) : (
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
                      <option value="Electricity & Street Lighting">Electricity & Street Lighting</option>
                      <option value="Town Planning & Building">Town Planning & Building</option>
                      <option value="Municipal Governance">Municipal Governance</option>
                    </select>
                  )}
                </div>
              )}

              {/* Phone Number */}
              <div style={{ marginBottom: '14px' }}>
                <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Mobile Number (Fast2SMS & WhatsApp Alerts)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 94495 24516"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input-field"
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', display: 'block', marginTop: '3px' }}>
                  ✓ Real SMS & WhatsApp statutory alerts will be dispatched to this number
                </span>
              </div>
            </>
          )}

          {/* Email / Government Employee ID Field */}
          <div style={{ marginBottom: '14px' }}>
            <label className="small-text font-bold" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>
              {!isRegister ? 'Government Employee ID or Email Address' : 'Official Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                placeholder={!isRegister ? "e.g. EMP-GOV-2001 or rajesh.varma@gov.in" : "name@example.gov.in"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-field"
              />
            </div>
            {!isRegister && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                Tip: Field Officers can log in directly using their Employee ID (e.g. <code>EMP-GOV-2001</code>) or Email.
              </span>
            )}
          </div>

          {/* Password Field */}
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
            {loading ? 'Authenticating...' : isRegister ? (role === 'OFFICER' ? 'Register Verified Officer' : 'Register Account') : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div style={{ marginTop: '26px', paddingTop: '18px', borderTop: '1px dashed var(--border-subtle)' }}>
          <p className="small-text" style={{ margin: '0 0 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Quick Demo Login Profiles (One-Click):
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => handleQuickLogin('CITIZEN')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={14} /> Citizen (Aarav)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => handleQuickLogin('OFFICER')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={14} /> Officer (EMP-GOV-2001)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => handleQuickLogin('ADMIN')}
              style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Building size={14} /> Admin (Kavitha)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Globe, 
  Bell, 
  Shield, 
  Eye, 
  X, 
  Check, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Lock,
  Save,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsModal({ onClose, theme, toggleTheme }) {
  const { user } = useAuth();
  const { lang, setLang, supportedLanguages, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'language' | 'appearance' | 'notifications' | 'security'
  
  // Profile Form State
  const [profileName, setProfileName] = useState(user?.fullName || 'Aarav Sharma');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'citizen@janseva.gov.in');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileWard, setProfileWard] = useState('Ward 14 - Indiranagar Central');
  
  // Notification Preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  
  // Accessibility Preferences
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('janseva_high_contrast') === 'true');
  const [fontSizeScale, setFontSizeScale] = useState(() => localStorage.getItem('janseva_font_scale') || 'normal'); // 'normal' | 'large'

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Feedback status
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('janseva_high_contrast', highContrast);
    localStorage.setItem('janseva_font_scale', fontSizeScale);
    
    // Apply font scale to document if large
    if (fontSizeScale === 'large') {
      document.documentElement.style.fontSize = '17px';
    } else {
      document.documentElement.style.fontSize = '15px';
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '680px', width: '95%', padding: '0', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Portal Settings & Preferences</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customize your regional language, notifications, accessibility, and profile</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Modal Body with Sidebar Navigation */}
        <div style={{ display: 'flex', minHeight: '380px' }}>
          
          {/* Settings Sidebar Tabs */}
          <div style={{
            width: '200px',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'profile' ? 'var(--brand-600, #2563eb)' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <User size={16} /> Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('language')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'language' ? 'var(--brand-600, #2563eb)' : 'transparent',
                color: activeTab === 'language' ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Globe size={16} /> Language & State
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'appearance' ? 'var(--brand-600, #2563eb)' : 'transparent',
                color: activeTab === 'appearance' ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Eye size={16} /> Appearance & A11y
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'notifications' ? 'var(--brand-600, #2563eb)' : 'transparent',
                color: activeTab === 'notifications' ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Bell size={16} /> Alerts & SMS
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'security' ? 'var(--brand-600, #2563eb)' : 'transparent',
                color: activeTab === 'security' ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={16} /> Security
            </button>
          </div>

          {/* Settings Content Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', maxHeight: '480px' }}>
            
            {savedSuccess && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#16a34a',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Check size={16} /> Preferences updated and saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings}>
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    Citizen Profile Details
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone (for SMS OTP & SLA Alerts)</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Municipal Ward / Zone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileWard}
                      onChange={(e) => setProfileWard(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    Regional Language & Localization
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Select your state's regional language. The portal interface, grievance forms, and status logs will render in your selected language.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Primary Interface Language</label>
                    <select
                      className="form-input"
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      style={{ fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      {supportedLanguages.map(item => (
                        <option key={item.code} value={item.code}>
                          {item.nativeName} ({item.name}) • {item.region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}>
                    <strong>Active Region:</strong> {supportedLanguages.find(l => l.code === lang)?.region || 'National'}
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    Theme & Accessibility Settings
                  </h3>

                  {/* Theme Selector */}
                  <div>
                    <label className="form-label">Color Theme</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={theme === 'dark' ? toggleTheme : undefined}
                        className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Sun size={16} /> Light Theme
                      </button>
                      <button
                        type="button"
                        onClick={theme === 'light' ? toggleTheme : undefined}
                        className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Moon size={16} /> Dark Theme
                      </button>
                    </div>
                  </div>

                  {/* Font Scaling */}
                  <div>
                    <label className="form-label">Text Size Scaling (Senior Citizen Accessibility)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setFontSizeScale('normal')}
                        className={`btn ${fontSizeScale === 'normal' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1 }}
                      >
                        Default (100%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSizeScale('large')}
                        className={`btn ${fontSizeScale === 'large' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1 }}
                      >
                        Large Text (115%)
                      </button>
                    </div>
                  </div>

                  {/* High Contrast Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>High Contrast Mode</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Enhances text borders and contrast for visual clarity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    Alerts & Citizen Communications
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Smartphone size={18} color="#2563eb" />
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>SMS Status Alerts</strong>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Receive SMS when officer is assigned or arrives on field</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={18} color="#2563eb" />
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>Email Resolution Receipts</strong>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Get official PDF resolution receipts emailed upon closure</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MessageSquare size={18} color="#16a34a" />
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>WhatsApp Redressal Bot</strong>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-time WhatsApp updates via JanSeva official channel</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappAlerts}
                      onChange={(e) => setWhatsappAlerts(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    Security & Session Credentials
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 8 characters with letters and numbers"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>Two-Factor Authentication (Aadhaar / Mobile OTP)</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Require SMS OTP for lodging grievances & downloading certificates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => setTwoFactor(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

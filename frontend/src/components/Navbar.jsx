import React from 'react';
import { 
  Building, 
  Moon, 
  Sun, 
  Bell, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  Search,
  LogOut,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  activePortal, 
  setActivePortal, 
  theme, 
  toggleTheme, 
  unreadNotifications, 
  setShowNotifications, 
  openGrievanceModal,
  searchQuery,
  setSearchQuery
}) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const isCitizen = user?.role === 'CITIZEN';

  return (
    <header className="navbar-header glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, sticky: 'top', zIndex: 900 }}>
      <div className="nav-container">
        
        {/* Left: Branding */}
        <div className="nav-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <Building className="brand-icon" size={24} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title-row">
              <span className="brand-name">JanSeva</span>
              <span className="brand-tagline">{t('brandTagline')}</span>
            </div>
            <p className="brand-sub">{t('brandSubtitle')}</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="nav-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
        </div>

        {/* Middle/Right Navigation Controls */}
        <div className="nav-actions">

          {/* User Role Badge */}
          {user && (
            <div className="user-badge-chip flex-align-center gap-2" style={{
              background: isCitizen ? 'rgba(34, 197, 94, 0.1)' : 'rgba(26, 86, 219, 0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${isCitizen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(26, 86, 219, 0.3)'}`
            }}>
              {isCitizen ? <UserCheck size={14} color="#22c55e" /> : <ShieldCheck size={14} color="#1a56db" />}
              <span className="small-text font-bold" style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                {user.fullName || user.email}
              </span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '10px',
                background: isCitizen ? '#22c55e' : '#1a56db',
                color: '#ffffff',
                fontWeight: '700'
              }}>
                {user.role}
              </span>
              {user.department && (
                <span className="small-text text-muted" style={{ fontSize: '0.75rem' }}>
                  • {user.department}
                </span>
              )}
            </div>
          )}

          {/* Lodge Grievance quick button for Citizen */}
          {isCitizen && (
            <button className="btn btn-primary btn-sm" onClick={openGrievanceModal}>
              <PlusCircle size={16} />
              <span>{t('lodgeGrievance')}</span>
            </button>
          )}

          {/* Regional Languages Dropdown Selector */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '4px 10px',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            gap: '6px'
          }}>
            <Globe size={15} color="#2563eb" style={{ flexShrink: 0 }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 4px'
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

          {/* Notifications */}
          <button 
            className="icon-circle-btn" 
            onClick={() => setShowNotifications(prev => !prev)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>

          {/* Theme Toggle */}
          <button 
            className="icon-circle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Logout Button */}
          {user && (
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Sign Out of Portal"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} />
              <span>{t('signOut')}</span>
            </button>
          )}
        </div>

      </div>

      {/* Navigation Sub-bar for Citizens */}
      {isCitizen && (
        <div className="nav-subtabs">
          <button 
            className={`subtab ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            {t('overviewTab')}
          </button>
          <button 
            className={`subtab ${activeTab === 'services' ? 'active' : ''}`} 
            onClick={() => setActiveTab('services')}
          >
            {t('servicesTab')}
          </button>
          <button 
            className={`subtab ${activeTab === 'track' ? 'active' : ''}`} 
            onClick={() => setActiveTab('track')}
          >
            {t('trackTab')}
          </button>
          <button 
            className={`subtab ${activeTab === 'faqs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('faqs')}
          >
            {t('faqsTab')}
          </button>
        </div>
      )}
    </header>
  );
}

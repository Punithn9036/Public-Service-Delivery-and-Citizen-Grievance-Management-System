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

          {/* Language Selector */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary, rgba(255,255,255,0.06))',
            borderRadius: '20px',
            padding: '2px 6px',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            gap: '4px'
          }}>
            <Globe size={13} style={{ opacity: 0.7, marginLeft: '4px' }} />
            {['en', 'hi', 'kn'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                style={{
                  background: lang === code ? 'var(--primary, #2563eb)' : 'transparent',
                  color: lang === code ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: lang === code ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

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

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
  User,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
              <span className="brand-tagline">GOV PORTAL</span>
            </div>
            <p className="brand-sub">Public Services & Grievance Governance</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="nav-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search grievances, service IDs, or FAQs..." 
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
              <span>Lodge Grievance</span>
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
              <span>Sign Out</span>
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
            Dashboard Overview
          </button>
          <button 
            className={`subtab ${activeTab === 'services' ? 'active' : ''}`} 
            onClick={() => setActiveTab('services')}
          >
            Public Services Catalog
          </button>
          <button 
            className={`subtab ${activeTab === 'track' ? 'active' : ''}`} 
            onClick={() => setActiveTab('track')}
          >
            Track Status & Resolution
          </button>
          <button 
            className={`subtab ${activeTab === 'faqs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('faqs')}
          >
            Knowledge Base & AI Guide
          </button>
        </div>
      )}
    </header>
  );
}

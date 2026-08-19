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
  CheckCircle2
} from 'lucide-react';

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

          {/* Portal Switcher (Citizen vs Official) */}
          <div className="portal-toggle-pill">
            <button 
              className={`portal-btn ${activePortal === 'citizen' ? 'active' : ''}`}
              onClick={() => { setActivePortal('citizen'); setActiveTab('overview'); }}
            >
              <UserCheck size={14} />
              <span>Citizen</span>
            </button>
            <button 
              className={`portal-btn ${activePortal === 'admin' ? 'active' : ''}`}
              onClick={() => { setActivePortal('admin'); setActiveTab('admin-dashboard'); }}
            >
              <ShieldCheck size={14} />
              <span>Official Admin</span>
            </button>
          </div>

          {/* Lodge Grievance quick button */}
          {activePortal === 'citizen' && (
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
        </div>

      </div>

      {/* Navigation Sub-bar */}
      {activePortal === 'citizen' && (
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

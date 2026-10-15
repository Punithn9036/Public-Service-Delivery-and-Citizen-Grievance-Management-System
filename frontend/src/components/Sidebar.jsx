import React from 'react';
import { 
  Building, 
  LayoutDashboard, 
  Layers, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  Settings, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activePortal,
  setActivePortal,
  openGrievanceModal,
  onOpenSettings,
  isSettingsOpen = false,
  isOpen,
  onClose
}) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const isCitizen = user?.role === 'CITIZEN';

  const navItems = [
    {
      id: 'overview',
      label: t('overviewTab') || 'Dashboard Overview',
      icon: LayoutDashboard,
      role: 'CITIZEN'
    },
    {
      id: 'services',
      label: t('servicesTab') || 'Public Services Catalog',
      icon: Layers,
      role: 'CITIZEN'
    },
    {
      id: 'track',
      label: t('trackTab') || 'Track Status & Resolution',
      icon: Search,
      role: 'CITIZEN'
    },
    {
      id: 'settings',
      label: t('settings') || 'Settings',
      icon: Settings,
      role: 'CITIZEN'
    }
  ];

  return (
    <>
      {/* Backdrop overlay when sidebar is open on smaller screens / drawer mode */}
      {isOpen && (
        <div 
          className="sidebar-backdrop-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Top Header of Sidebar */}
        <div className="sidebar-brand">
          <div 
            className="sidebar-brand-left"
            onClick={() => {
              if (isCitizen) {
                setActivePortal('citizen');
                setActiveTab('overview');
              } else {
                setActivePortal('admin');
                setActiveTab('admin-dashboard');
              }
              if (onClose) onClose();
            }}
            title={isCitizen ? "JanSeva Governance Portal" : "JanSeva Official Governance Center"}
          >
            <div className="sidebar-brand-icon">
              <Building size={20} color="#ffffff" />
            </div>
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-title">
                <span className="brand-name">JanSeva</span>
                <span className="sidebar-gov-tag">{isCitizen ? 'GOV' : (user?.role === 'OFFICER' ? 'OFFICER' : 'ADMIN')}</span>
              </div>
              <span className="sidebar-brand-sub">{isCitizen ? 'Navigation Menu' : 'Official Workspace'}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-icon-btn"
            onClick={onClose}
            title="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lodge Grievance Primary CTA Button for Citizens */}
        {isCitizen && (
          <div className="sidebar-cta-wrap">
            <button 
              type="button" 
              className="btn btn-primary sidebar-cta-btn" 
              onClick={() => {
                openGrievanceModal();
                if (onClose) onClose();
              }}
              title="Lodge New Grievance"
            >
              <PlusCircle size={16} />
              <span>{t('lodgeGrievance') || 'Lodge Grievance'}</span>
            </button>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            {isCitizen ? 'SERVICES & NAVIGATION' : 'OFFICIAL WORKSPACE'}
          </div>

          {isCitizen ? (
            navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'settings' ? Boolean(isSettingsOpen) : (activeTab === item.id && !isSettingsOpen);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (item.id === 'settings') {
                      if (onOpenSettings) onOpenSettings();
                    } else {
                      setActivePortal('citizen');
                      setActiveTab(item.id);
                    }
                    if (onClose) onClose();
                  }}
                  title={item.label}
                >
                  <Icon size={18} className="sidebar-nav-icon" />
                  <span className="sidebar-nav-label">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="sidebar-active-arrow" />}
                </button>
              );
            })
          ) : (
            /* Official Admin & Officer Navigation Only (Strictly isolated from Citizen View) */
            <>
              <button
                type="button"
                className={`sidebar-nav-item ${activeTab === 'admin-dashboard' && !isSettingsOpen ? 'active' : ''}`}
                onClick={() => {
                  setActivePortal('admin');
                  setActiveTab('admin-dashboard');
                  if (onClose) onClose();
                }}
                title={user?.role === 'OFFICER' ? 'Officer Command Center' : 'Admin Governance Center'}
              >
                <ShieldCheck size={18} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">
                  {user?.role === 'OFFICER' ? 'Officer Duty & Field Desk' : 'Admin Governance Center'}
                </span>
                {activeTab === 'admin-dashboard' && !isSettingsOpen && <ChevronRight size={14} className="sidebar-active-arrow" />}
              </button>

              <button
                type="button"
                className={`sidebar-nav-item ${isSettingsOpen ? 'active' : ''}`}
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  if (onClose) onClose();
                }}
                title={t('settings') || 'Settings'}
              >
                <Settings size={18} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{t('settings') || 'Settings'}</span>
                {isSettingsOpen && <ChevronRight size={14} className="sidebar-active-arrow" />}
              </button>
            </>
          )}
        </nav>

        {/* Footer Navigation & User Profile */}
        <div className="sidebar-footer">
          {/* User Card */}
          {user && (
            <div className="sidebar-user-card" title={`${user.fullName || user.email} (${user.role})`}>
              <div className="sidebar-user-avatar">
                {isCitizen ? <UserCheck size={16} /> : <ShieldCheck size={16} />}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.fullName || user.email}</span>
                <span className="sidebar-user-role">{user.role} {user.department ? `• ${user.department}` : ''}</span>
              </div>
            </div>
          )}

          {/* Bottom Options: Sign Out */}
          <div className="sidebar-action-buttons">
            <button 
              type="button" 
              className="sidebar-bottom-btn sidebar-logout-btn" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

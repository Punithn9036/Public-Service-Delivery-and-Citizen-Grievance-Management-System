import React from 'react';
import { 
  Building, 
  LayoutDashboard, 
  Layers, 
  Search, 
  BookOpen, 
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
      id: 'faqs',
      label: t('faqsTab') || 'Knowledge Base & AI Guide',
      icon: BookOpen,
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
              setActiveTab('overview');
            }}
            title="JanSeva Governance Portal"
          >
            <div className="sidebar-brand-icon">
              <Building size={20} color="#ffffff" />
            </div>
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-title">
                <span className="brand-name">JanSeva</span>
                <span className="sidebar-gov-tag">GOV</span>
              </div>
              <span className="sidebar-brand-sub">Navigation Menu</span>
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
          <div className="sidebar-section-label">SERVICES & NAVIGATION</div>

          {isCitizen ? (
            navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActivePortal('citizen');
                    setActiveTab(item.id);
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
            /* Official Admin Navigation */
            <>
              <button
                type="button"
                className={`sidebar-nav-item ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActivePortal('admin');
                  setActiveTab('admin-dashboard');
                }}
                title={t('nodalOfficerControl') || 'Admin Governance Center'}
              >
                <ShieldCheck size={18} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{t('nodalOfficerControl') || 'Admin Governance Center'}</span>
                {activeTab === 'admin-dashboard' && <ChevronRight size={14} className="sidebar-active-arrow" />}
              </button>

              {/* Quick Switch for Admin to view Citizen Interface */}
              <div className="sidebar-section-label" style={{ marginTop: '16px' }}>CITIZEN VIEW</div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePortal === 'citizen' && activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActivePortal('citizen');
                      setActiveTab(item.id);
                    }}
                    title={item.label}
                  >
                    <Icon size={18} className="sidebar-nav-icon" />
                    <span className="sidebar-nav-label">{item.label}</span>
                  </button>
                );
              })}
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

          {/* Bottom Options: Settings & Sign Out */}
          <div className="sidebar-action-buttons">
            <button 
              type="button" 
              className="sidebar-bottom-btn" 
              onClick={() => {
                onOpenSettings();
              }}
              title="Settings & Appearance"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <button 
              type="button" 
              className="sidebar-bottom-btn sidebar-logout-btn" 
              onClick={logout}
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

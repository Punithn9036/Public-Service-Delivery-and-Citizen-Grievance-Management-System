import React from 'react';
import { 
  Bell, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Globe,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ 
  activeTab, 
  unreadNotifications, 
  setShowNotifications, 
  openGrievanceModal,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse
}) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const isCitizen = user?.role === 'CITIZEN';

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return t('overviewTab') || 'Dashboard Overview';
      case 'services': return t('servicesTab') || 'Public Services Catalog';
      case 'track': return t('trackTab') || 'Track Status & Resolution';
      case 'faqs': return t('faqsTab') || 'Knowledge Base & AI Guide';
      case 'admin-dashboard': return t('nodalOfficerControl') || 'Admin Governance Center';
      default: return 'JanSeva Portal';
    }
  };

  return (
    <header className="navbar-header">
      <div className="nav-container">
        
        {/* Left: Sidebar Toggle & Page Title */}
        <div className="nav-left-group">
          <button
            type="button"
            className="icon-circle-btn nav-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar Navigation" : "Retract Sidebar Navigation"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="nav-page-context">
            <h2 className="nav-page-heading">{getPageTitle()}</h2>
            <span className="nav-page-sub">Public Service Delivery & Citizen Grievance Portal</span>
          </div>
        </div>

        {/* Center: Search bar */}
        <div className="nav-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder') || 'Search tickets, services, or FAQs...'} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
        </div>

        {/* Right Controls */}
        <div className="nav-actions">

          {/* Regional Languages Dropdown Selector */}
          <div className="language-selector-pill">
            <Globe size={15} style={{ flexShrink: 0, color: 'var(--brand-700)' }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="language-select-dropdown"
              aria-label="Select State Language"
              title="Select Regional Language"
            >
              <option value="en">English (Official)</option>
              <option value="hi">हिन्दी (North & Central)</option>
              <option value="kn">ಕನ್ನಡ (Karnataka)</option>
              <option value="ta">தமிழ் (Tamil Nadu)</option>
              <option value="te">తెలుగు (AP & Telangana)</option>
              <option value="ml">മലയാളം (Kerala)</option>
              <option value="mr">मराठी (Maharashtra)</option>
              <option value="gu">ગુજરાતી (Gujarat)</option>
              <option value="bn">বাংলা (West Bengal)</option>
              <option value="or">ଓଡ଼ିଆ (Odisha)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjab)</option>
              <option value="as">অসমীয়া (Assam)</option>
              <option value="ur">اردو (J&K, Telangana, UP)</option>
            </select>
          </div>

          {/* Notifications */}
          <button 
            type="button"
            className="icon-circle-btn" 
            onClick={() => setShowNotifications(prev => !prev)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>

          {/* Settings Quick Access */}
          <button
            type="button"
            className="icon-circle-btn"
            onClick={onOpenSettings}
            title="Portal Settings (Theme, Language, Profile)"
          >
            <Settings size={18} />
          </button>

          {/* Quick Lodge Grievance for Citizen */}
          {isCitizen && (
            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={openGrievanceModal}
            >
              <PlusCircle size={15} />
              <span>{t('lodgeGrievance') || 'Lodge Grievance'}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

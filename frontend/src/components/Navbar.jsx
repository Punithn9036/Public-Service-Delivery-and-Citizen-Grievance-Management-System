import React from 'react';
import { 
  Building,
  Bell, 
  PlusCircle, 
  Search, 
  Globe,
  Settings,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab,
  unreadNotifications, 
  setShowNotifications, 
  openGrievanceModal,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  isSidebarOpen,
  onToggleSidebar
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
        
        {/* Left Section: JanSeva Brand Heading & Context */}
        <div className="nav-left-group">
          {/* JanSeva Official Brand Badge & Portal Title */}
          <div 
            className="nav-brand-badge" 
            onClick={() => setActiveTab('overview')} 
            style={{ cursor: 'pointer' }}
            title="JanSeva Civic Portal Home"
          >
            <div className="nav-brand-icon-box">
              <Building size={20} color="#ffffff" />
            </div>
            <div className="nav-brand-title-wrap">
              <span className="nav-brand-name">JanSeva</span>
              <span className="nav-brand-tag">GOV</span>
            </div>
          </div>

          <div className="nav-vertical-divider" />

          {/* Clean Portal Subtitle */}
          <div className="nav-page-context">
            <span className="nav-page-sub-main">Public Service Delivery & Citizen Grievance Portal</span>
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

          {/* Tricolour 3-line Hamburger Menu Button in Top-Right Corner */}
          <button
            type="button"
            className={`tricolour-menu-btn ${isSidebarOpen ? 'active' : ''}`}
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Close Navigation Sidebar" : "Open Navigation Sidebar"}
            aria-label="Toggle Navigation Sidebar"
          >
            <div className="tricolour-icon">
              <span className="tricolour-bar saffron-bar" />
              <span className="tricolour-bar white-bar" />
              <span className="tricolour-bar green-bar" />
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}

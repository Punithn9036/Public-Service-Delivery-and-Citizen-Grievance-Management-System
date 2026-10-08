import React from 'react';
import { 
  Building,
  Bell, 
  PlusCircle, 
  Search, 
  Globe,
  Settings,
  Menu,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab,
  onNavigate,
  canGoBack,
  onGoBack,
  previousPageTitle,
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
  const isHeroTab = activeTab === 'overview';

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
    <header className={`navbar-header ${isHeroTab ? 'navbar-hero-merged' : ''}`}>
      <div className="nav-container">
        
        {/* Left Section: Back Button & JanSeva Brand Heading */}
        <div className="nav-left-group">
          {canGoBack && (
            <button
              type="button"
              className="nav-back-btn"
              onClick={onGoBack}
              title={previousPageTitle ? `Back to ${previousPageTitle}` : "Go back to previous page"}
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={16} />
              <span className="nav-back-text">Back</span>
            </button>
          )}

          {/* JanSeva Official Brand Badge & Portal Title */}
          <div 
            className="nav-brand-badge" 
            onClick={() => onNavigate ? onNavigate('overview') : setActiveTab('overview')} 
            style={{ cursor: 'pointer' }}
            title="JanSeva Civic Portal Home"
          >
            <div className="nav-brand-title-wrap">
              <span className="nav-brand-name">JanSeva</span>
              <span className="nav-brand-gov-plain">gov</span>
            </div>
          </div>
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

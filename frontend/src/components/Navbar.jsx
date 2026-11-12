// frontend/src/components/Navbar.jsx
// Unified top navigation bar for Citizen, Officer, and Admin roles.
// Uses transparent hero-merged mode over full-bleed Citizen/Admin hero banners,
// and solid sticky institutional header mode for the Officer Field Workspace.

import React from 'react';
import { Bell, Globe, ArrowLeft, ShieldCheck, Building2 } from 'lucide-react';
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
  isSidebarOpen,
  onToggleSidebar
}) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const isCitizen = user?.role === 'CITIZEN';
  const isOfficer = user?.role === 'OFFICER';
  const isAdmin = user?.role === 'ADMIN';

  // Only Citizen Overview and Admin Control Center render a full-bleed dark hero banner underneath the navbar.
  // OfficerDashboard opens straight into the operational desk on var(--bg-primary), so it uses the solid sticky header.
  const isHeroTab = (isCitizen && activeTab === 'overview') || (isAdmin && activeTab === 'admin-dashboard');

  const handleBrandClick = () => {
    const homeTab = isCitizen ? 'overview' : 'admin-dashboard';
    if (onNavigate) onNavigate(homeTab);
    else if (setActiveTab) setActiveTab(homeTab);
  };

  return (
    <header className={`navbar-header${isHeroTab ? ' navbar-hero-merged' : ''}`}>
      <div className="nav-container">

        {/* Left Section: Contextual Back (Citizens on sub-pages) + Brand + Role & Dept Identity */}
        <div className="nav-left-group">
          {canGoBack && isCitizen && (
            <button
              type="button"
              className="nav-back-btn"
              onClick={onGoBack}
              title={previousPageTitle ? `Back to ${previousPageTitle}` : 'Go back to previous page'}
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={15} />
              <span className="nav-back-text">{t('Back')}</span>
            </button>
          )}

          {/* JanSeva Official Brand Wordmark */}
          <div
            className="nav-brand-badge"
            onClick={handleBrandClick}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleBrandClick()}
            title={isCitizen ? 'JanSeva Civic Portal Home' : 'JanSeva Official Governance Dashboard'}
          >
            <div className="nav-brand-title-wrap">
              <span className="nav-brand-name">JanSeva</span>
              <span className="nav-brand-gov-plain">{isAdmin ? 'admin' : 'gov'}</span>
            </div>
          </div>

          {/* Official Role Badge (Officer / Admin only) */}
          {isOfficer && (
            <span className="nav-role-badge nav-role-badge--officer">
              <ShieldCheck size={12} />
              <span>{t('FIELD OFFICER')}</span>
            </span>
          )}

          {isAdmin && (
            <span className="nav-role-badge nav-role-badge--admin">
              <ShieldCheck size={12} />
              <span>{t('NODAL ADMIN')}</span>
            </span>
          )}

          {/* Department Badge (Officer only) */}
          {isOfficer && user?.department && (
            <div className="nav-dept-strip" title={user.department}>
              <Building2 size={13} className="nav-dept-icon" />
              <span className="nav-dept-name">{user.department}</span>
            </div>
          )}

          {/* Officer Name Chip */}
          {isOfficer && user?.fullName && (
            <span className="nav-officer-name-chip" title={user.fullName}>
              {user.fullName}
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="nav-actions">

          {/* Regional Languages Dropdown Selector */}
          <div className="language-selector-pill">
            <Globe size={15} className="nav-globe-icon" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="language-select-dropdown"
              aria-label="Select State Language"
              title="Select Regional Language"
            >
              <option value="en">English (Official)</option>
              <option value="hi">हिन्दी (North &amp; Central)</option>
              <option value="kn">ಕನ್ನಡ (Karnataka)</option>
              <option value="ta">தமிழ் (Tamil Nadu)</option>
              <option value="te">తెలుగు (AP &amp; Telangana)</option>
              <option value="ml">മലയാളം (Kerala)</option>
              <option value="mr">मराठी (Maharashtra)</option>
              <option value="gu">ગુજરાતી (Gujarat)</option>
              <option value="bn">বাংলা (West Bengal)</option>
              <option value="or">ଓଡ଼ିଆ (Odisha)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjab)</option>
              <option value="as">অসমীয়া (Assam)</option>
              <option value="ur">اردو (J&amp;K, Telangana, UP)</option>
            </select>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="icon-circle-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            title="Notifications"
            aria-label="Toggle Notifications"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>

          {/* Tricolour 3-line Hamburger Menu Button */}
          <button
            type="button"
            className={`tricolour-menu-btn${isSidebarOpen ? ' active' : ''}`}
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Close Navigation Sidebar' : 'Open Navigation Sidebar'}
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

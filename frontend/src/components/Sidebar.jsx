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
  X,
  ClipboardCheck,
  Inbox,
  FileCheck2,
  FileSpreadsheet,
  BarChart2,
  Users,
  Gavel,
  Smartphone,
  Database,
  PhoneCall,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activePortal,
  setActivePortal,
  adminActiveSection = 'grievances',
  setAdminActiveSection,
  officerQueueScope = 'assigned',
  setOfficerQueueScope,
  grievances = [],
  applications = [],
  openGrievanceModal,
  onOpenSettings,
  isSettingsOpen = false,
  isOpen,
  onClose
}) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const isCitizen = user?.role === 'CITIZEN';
  const isOfficer = user?.role === 'OFFICER';
  const isAdmin = user?.role === 'ADMIN';

  // Live Metric Calculations for Dynamic Badges
  const currentOfficerName = (user?.fullName || user?.name || '').toLowerCase().trim();
  const officerEmpId = (user?.employeeId || user?.userId || '').toLowerCase().trim();
  const officerPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);

  const isAssignedToCurrentOfficer = (g) => {
    if (!g) return false;
    const assigned = (g.assignedOfficer || '').toLowerCase();
    const assignedContact = (g.assignedOfficerContact || '').replace(/\D/g, '').slice(-10);
    const matchName = currentOfficerName && assigned.includes(currentOfficerName);
    const matchEmpId = officerEmpId && assigned.includes(officerEmpId);
    const matchPhone = officerPhone && assignedContact && officerPhone === assignedContact;
    return Boolean(matchName || matchEmpId || matchPhone);
  };

  const officerAssignedGrievances = grievances.filter(isAssignedToCurrentOfficer);
  const officerAssignedCount = officerAssignedGrievances.filter(g => g.status !== 'Resolved').length;
  const deptUnassignedCount = isOfficer && user?.department
    ? grievances.filter(g => g.department === user.department && (!g.assignedOfficer || g.status === 'Submitted')).length
    : 0;
  const officerEscalatedCount = officerAssignedGrievances.filter(g => g.status === 'Escalated').length;
  const officerAppsCount = applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;

  const adminOpenGrievances = grievances.filter(g => g.status !== 'Resolved').length;
  const adminPendingApps = applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
  const adminEscalated = grievances.filter(g => g.status === 'Escalated').length;

  // Citizen Navigation Items (Strict Title Case)
  const citizenNavItems = [
    {
      id: 'overview',
      label: t('Dashboard Overview'),
      icon: LayoutDashboard
    },
    {
      id: 'services',
      label: t('Public Services Catalog'),
      icon: Layers
    },
    {
      id: 'track',
      label: t('Track Status & Resolution'),
      icon: Search
    },
    {
      id: 'faqs',
      label: t('Knowledge Base & FAQs'),
      icon: BookOpen
    },
    {
      id: 'settings',
      label: t('Settings'),
      icon: Settings
    }
  ];

  // Officer Navigation Groups (Strict Title Case matching Citizen Sidebar)
  const officerNavGroups = [
    {
      groupLabel: t('Field Queues & Desk'),
      items: [
        {
          id: 'officer-queue',
          section: 'grievances',
          scope: 'assigned',
          label: t('My Assigned Field Queue'),
          icon: ClipboardCheck,
          badge: officerAssignedCount > 0 ? { text: `${officerAssignedCount} Active`, type: 'active' } : null
        },
        {
          id: 'officer-dept',
          section: 'grievances',
          scope: 'dept-unassigned',
          label: t('Department Triage Queue'),
          icon: Inbox,
          badge: deptUnassignedCount > 0 ? { text: `${deptUnassignedCount} Unassigned`, type: 'neutral' } : null
        },
        {
          id: 'officer-apps',
          section: 'applications',
          label: t('Service Applications Desk'),
          icon: FileCheck2,
          badge: officerAppsCount > 0 ? { text: `${officerAppsCount} Pending`, type: 'neutral' } : null
        }
      ]
    },
    {
      groupLabel: t('Duty & Statutory Compliance'),
      items: [
        {
          id: 'officer-roster',
          section: 'roster',
          label: t('My Duty Profile & Ward'),
          icon: UserCheck
        },
        {
          id: 'officer-tribunal',
          section: 'sla-tribunal',
          label: t('SLA Compliance & Notices'),
          icon: Gavel,
          badge: officerEscalatedCount > 0 
            ? { text: `${officerEscalatedCount} Alert`, type: 'urgent' } 
            : { text: '0 Notices', type: 'neutral' }
        },
        {
          id: 'officer-notifs',
          section: 'notifications',
          label: t('Citizen DLT Alerts & SMS'),
          icon: Smartphone
        },
        {
          id: 'officer-blockchain',
          section: 'blockchain',
          label: t('Blockchain Audit Trail'),
          icon: Database
        }
      ]
    },
    {
      groupLabel: t('Portal Preferences'),
      items: [
        {
          id: 'settings',
          label: t('Settings'),
          icon: Settings
        }
      ]
    }
  ];

  // Admin Navigation Groups (Strict Title Case matching Citizen Sidebar)
  const adminNavGroups = [
    {
      groupLabel: t('Governance & Triage'),
      items: [
        {
          id: 'admin-grievances',
          section: 'grievances',
          label: t('Grievance Command Center'),
          icon: LayoutDashboard,
          badge: adminOpenGrievances > 0 ? { text: `${adminOpenGrievances} Open`, type: 'active' } : null
        },
        {
          id: 'admin-apps',
          section: 'applications',
          label: t('Statutory Service Approvals'),
          icon: FileSpreadsheet,
          badge: adminPendingApps > 0 ? { text: `${adminPendingApps} Pending`, type: 'neutral' } : null
        },
        {
          id: 'admin-analytics',
          section: 'analytics',
          label: t('Governance Analytics & SLA'),
          icon: BarChart2
        }
      ]
    },
    {
      groupLabel: t('Administration & Control'),
      items: [
        {
          id: 'admin-roster',
          section: 'roster',
          label: t('Officer Roster & Dispatch'),
          icon: Users,
          badge: { text: '28 Officers', type: 'neutral' }
        },
        {
          id: 'admin-tribunal',
          section: 'sla-tribunal',
          label: t('SLA Tribunal & Discipline'),
          icon: Gavel,
          badge: adminEscalated > 0 
            ? { text: `${adminEscalated} Breached`, type: 'urgent' } 
            : { text: 'Clear', type: 'neutral' }
        },
        {
          id: 'admin-notifs',
          section: 'notifications',
          label: t('Statutory DLT & WhatsApp'),
          icon: Smartphone
        },
        {
          id: 'admin-blockchain',
          section: 'blockchain',
          label: t('Hyperledger Fabric & IPFS'),
          icon: Database
        }
      ]
    },
    {
      groupLabel: t('Portal Preferences'),
      items: [
        {
          id: 'settings',
          label: t('Settings'),
          icon: Settings
        }
      ]
    }
  ];

  const handleOfficialNavClick = (item) => {
    if (item.id === 'settings') {
      if (onOpenSettings) onOpenSettings();
    } else {
      setActivePortal('admin');
      setActiveTab('admin-dashboard');
      if (item.section && setAdminActiveSection) {
        setAdminActiveSection(item.section);
      }
      if (item.scope && setOfficerQueueScope) {
        setOfficerQueueScope(item.scope);
      }
    }
    if (onClose) onClose();
  };

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
                if (setAdminActiveSection) setAdminActiveSection('grievances');
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
                <span className="sidebar-gov-tag">
                  {isCitizen ? 'GOV' : (isOfficer ? 'OFFICER' : 'ADMIN')}
                </span>
              </div>
              <span className="sidebar-brand-sub">
                {isCitizen 
                  ? t('Navigation Menu') 
                  : (isOfficer 
                      ? t('Officer Field Desk') 
                      : t('Nodal Governance Center'))}
              </span>
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
          {isCitizen ? (
            <>
              <div className="sidebar-section-label">
                {t('Services & Navigation')}
              </div>
              {citizenNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'settings' 
                  ? Boolean(isSettingsOpen) 
                  : (activeTab === item.id && !isSettingsOpen);
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
              })}
            </>
          ) : isOfficer ? (
            /* ========================================================= */
            /* FIELD OFFICER NAVIGATION (Categorized, Rich & Actionable) */
            /* ========================================================= */
            officerNavGroups.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <div className="sidebar-section-label">{group.groupLabel}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === 'settings'
                    ? Boolean(isSettingsOpen)
                    : (!isSettingsOpen && activePortal === 'admin' && activeTab === 'admin-dashboard' && (
                        item.section === adminActiveSection && (!item.scope || item.scope === officerQueueScope)
                      ));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleOfficialNavClick(item)}
                      title={item.label}
                    >
                      <Icon size={18} className="sidebar-nav-icon" />
                      <span className="sidebar-nav-label">{item.label}</span>
                      {item.badge && (
                        <span className={`sidebar-nav-badge badge-${item.badge.type}`}>
                          {item.badge.text}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="sidebar-active-arrow" />}
                    </button>
                  );
                })}
              </React.Fragment>
            ))
          ) : (
            /* ========================================================= */
            /* ADMINISTRATOR NAVIGATION (Full Command & Control Suite)  */
            /* ========================================================= */
            adminNavGroups.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <div className="sidebar-section-label">{group.groupLabel}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === 'settings'
                    ? Boolean(isSettingsOpen)
                    : (!isSettingsOpen && activePortal === 'admin' && activeTab === 'admin-dashboard' && (
                        item.section === adminActiveSection
                      ));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleOfficialNavClick(item)}
                      title={item.label}
                    >
                      <Icon size={18} className="sidebar-nav-icon" />
                      <span className="sidebar-nav-label">{item.label}</span>
                      {item.badge && (
                        <span className={`sidebar-nav-badge badge-${item.badge.type}`}>
                          {item.badge.text}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="sidebar-active-arrow" />}
                    </button>
                  );
                })}
              </React.Fragment>
            ))
          )}
        </nav>

        {/* Live Duty Profile / System Health Widget for Officer and Admin */}
        {isOfficer && (
          <div className="sidebar-status-card">
            <div className="sidebar-status-header">
              <span>{t('Field Duty Status')}</span>
              <span className="sidebar-status-pill">
                <span className="bot-status-beacon" style={{ position: 'static', width: '6px', height: '6px', display: 'inline-block' }} /> 
                {t('On Duty')}
              </span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Sector / Ward')}:</span>
              <span className="sidebar-status-val">{user?.sector || 'Central'} • {user?.ward || 'Ward 14'}</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Department')}:</span>
              <span className="sidebar-status-val">{user?.department || 'Public Works'}</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Statutory SLA')}:</span>
              <span className="sidebar-status-val" style={{ color: '#16a34a' }}>98.2% {t('On-Time')}</span>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="sidebar-status-card">
            <div className="sidebar-status-header">
              <span>{t('Governance Grid')}</span>
              <span className="sidebar-status-pill">
                <span className="bot-status-beacon" style={{ position: 'static', width: '6px', height: '6px', display: 'inline-block' }} /> 
                {t('Healthy')}
              </span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Hyperledger')}:</span>
              <span className="sidebar-status-val" style={{ color: '#2563eb' }}>janseva-channel</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('IPFS Store')}:</span>
              <span className="sidebar-status-val">SHA-256 Pinned</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Officer Force')}:</span>
              <span className="sidebar-status-val">4 Sectors • 28 Officers</span>
            </div>
          </div>
        )}

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
                <span className="sidebar-user-role">
                  {user.role} {user.department ? `• ${user.department}` : ''}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Action Buttons: 24x7 Control Room & Sign Out */}
          <div className="sidebar-action-buttons">
            <a 
              href="tel:1800425468" 
              className="sidebar-bottom-btn" 
              style={{ textDecoration: 'none' }}
              title="24x7 Control Room Hotline: 1800-425-GOV"
            >
              <PhoneCall size={14} />
              <span>1800-425-GOV</span>
            </a>

            <button 
              type="button" 
              className="sidebar-bottom-btn sidebar-logout-btn" 
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>{t('Sign Out')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

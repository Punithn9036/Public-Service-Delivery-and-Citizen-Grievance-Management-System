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
  BookOpen,
  MapPin,
  Scale,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isSameDepartment, isTicketAssignedToOfficer } from '../utils/departmentScope';
import { INITIAL_OFFICERS, SECTORS } from '../data/officerRoster';

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

  const officerDeptGrievances = isOfficer && user?.department
    ? grievances.filter((g) => isSameDepartment(user.department, g.department))
    : [];
  const officerAssignedGrievances = officerDeptGrievances.filter(
    (g) => isTicketAssignedToOfficer(g, user) || isAssignedToCurrentOfficer(g)
  );
  const officerAssignedCount = officerAssignedGrievances.filter((g) => !['Resolved', 'Rejected'].includes(g.status)).length;
  const deptUnassignedCount = officerDeptGrievances.filter(
    (g) => !g.assignedOfficer || String(g.assignedOfficer).includes('Pending Dispatch') || g.status === 'Submitted'
  ).length;
  const officerEscalatedCount = officerAssignedGrievances.filter((g) => g.status === 'Escalated').length;
  const officerAppsCount = isOfficer && user?.department
    ? applications.filter(
        (a) =>
          isSameDepartment(user.department, a.department) &&
          ['Submitted', 'Under Review', 'In Verification', 'Resubmission Required'].includes(a.status)
      ).length
    : 0;
  const officerOnTimePct = officerAssignedGrievances.length > 0
    ? Math.round((officerAssignedGrievances.filter((g) => g.status !== 'Escalated').length / officerAssignedGrievances.length) * 100)
    : 100;
  const totalRosterOfficers = INITIAL_OFFICERS.length;

  const adminOpenGrievances = grievances.filter(g => g.status !== 'Resolved').length;
  const adminPendingApps = applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
  const adminEscalated = grievances.filter(g => g.status === 'Escalated').length;

  // Citizen Navigation Items (Plain, clear language)
  const citizenNavItems = [
    {
      id: 'overview',
      label: t('Home & Overview'),
      icon: LayoutDashboard
    },
    {
      id: 'services',
      label: t('Public Services'),
      icon: Layers
    },
    {
      id: 'track',
      label: t('Track My Request'),
      icon: Search
    },
    {
      id: 'faqs',
      label: t('Help & FAQs'),
      icon: BookOpen
    },
    {
      id: 'settings',
      label: t('Settings'),
      icon: Settings
    }
  ];

  // Officer Navigation Groups (Plain, department-scoped labels)
  const officerNavGroups = [
    {
      title: t('My Work'),
      items: [
        {
          id: 'officer-queue',
          section: 'grievances',
          scope: 'assigned',
          label: t('Assigned to Me'),
          icon: ClipboardCheck,
          badge: officerAssignedCount > 0 ? { text: `${officerAssignedCount} Open`, type: 'active' } : null
        },
        {
          id: 'officer-dept',
          section: 'grievances',
          scope: 'department',
          label: t('Department Queue'),
          icon: Inbox,
          badge: deptUnassignedCount > 0 ? { text: `${deptUnassignedCount} Open`, type: 'neutral' } : null
        },
        {
          id: 'officer-apps',
          section: 'applications',
          label: t('Service Requests'),
          icon: FileCheck2,
          badge: officerAppsCount > 0 ? { text: `${officerAppsCount} Pending`, type: 'neutral' } : null
        },
        {
          id: 'officer-map',
          section: 'map',
          label: t('Area Map'),
          icon: MapPin,
          badge: null
        }
      ]
    },
    {
      title: t('Performance'),
      items: [
        {
          id: 'officer-tribunal',
          section: 'sla-tribunal',
          label: t('Deadlines & Profile'),
          icon: Scale,
          badge: officerEscalatedCount > 0
            ? { text: `${officerEscalatedCount} Late`, type: 'urgent' }
            : null
        }
      ]
    },
    {
      title: t('Account'),
      items: [
        {
          id: 'settings',
          label: t('Settings'),
          icon: Settings
        }
      ]
    }
  ];

  // Admin Navigation Groups (Clear municipal control room menu)
  const adminNavGroups = [
    {
      title: t('Daily Operations'),
      items: [
        {
          id: 'admin-grievances',
          section: 'grievances',
          label: t('All Complaints'),
          icon: FileSpreadsheet,
          badge: adminOpenGrievances > 0 ? { text: `${adminOpenGrievances} Open`, type: 'active' } : null
        },
        {
          id: 'admin-apps',
          section: 'applications',
          label: t('Service Requests'),
          icon: FileCheck2,
          badge: adminPendingApps > 0 ? { text: `${adminPendingApps} Pending`, type: 'neutral' } : null
        },
        {
          id: 'admin-map',
          section: 'map',
          label: t('Area Map'),
          icon: MapPin,
          badge: null
        },
        {
          id: 'admin-appeals',
          section: 'appeals',
          label: t('Appeals & Duplicates'),
          icon: Scale,
          badge: null
        },
        {
          id: 'admin-roster',
          section: 'roster',
          label: t('Officers & Teams'),
          icon: Users,
          badge: { text: `${totalRosterOfficers} Staff`, type: 'neutral' }
        }
      ]
    },
    {
      title: t('Rules & Reports'),
      items: [
        {
          id: 'admin-tribunal',
          section: 'sla-tribunal',
          label: t('Late Cases & Actions'),
          icon: Gavel,
          badge: adminEscalated > 0 ? { text: `${adminEscalated} Late`, type: 'urgent' } : null
        },
        {
          id: 'admin-governance',
          section: 'governance',
          label: t('Services & Alerts'),
          icon: Megaphone
        },
        {
          id: 'admin-analytics',
          section: 'analytics',
          label: t('Reports & Stats'),
          icon: BarChart2
        },
        {
          id: 'admin-audit',
          section: 'audit',
          label: t('Activity Logs'),
          icon: BookOpen
        }
      ]
    },
    {
      title: t('System'),
      items: [
        {
          id: 'admin-notifs',
          section: 'notifications',
          label: t('SMS & WhatsApp'),
          icon: Smartphone
        },
        {
          id: 'admin-blockchain',
          section: 'blockchain',
          label: t('Audit Ledger'),
          icon: Database
        },
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
                  ? t('Citizen Menu') 
                  : (isOfficer 
                      ? t('Officer Portal') 
                      : t('Admin Control Room'))}
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
                {t('Menu')}
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
                <div className="sidebar-section-label">{group.title}</div>
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
                <div className="sidebar-section-label">{group.title}</div>
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
              <span>{t('Duty Status')}</span>
              <span className="sidebar-status-pill">
                <span className="bot-status-beacon" style={{ position: 'static', width: '6px', height: '6px', display: 'inline-block' }} /> 
                {t('On Duty')}
              </span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Zone / Ward')}:</span>
              <span className="sidebar-status-val">{user?.sector || 'Central'} • {user?.ward || 'Ward 14'}</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Department')}:</span>
              <span className="sidebar-status-val">{user?.department || 'Public Works'}</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('On-Time Rate')}:</span>
              <span className="sidebar-status-val" style={{ color: '#16a34a' }}>{officerOnTimePct}% {t('On-Time')}</span>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="sidebar-status-card">
            <div className="sidebar-status-header">
              <span>{t('System Health')}</span>
              <span className="sidebar-status-pill">
                <span className="bot-status-beacon" style={{ position: 'static', width: '6px', height: '6px', display: 'inline-block' }} /> 
                {t('Online')}
              </span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Audit Ledger')}:</span>
              <span className="sidebar-status-val" style={{ color: '#2563eb' }}>Connected</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('File Storage')}:</span>
              <span className="sidebar-status-val">IPFS Verified</span>
            </div>
            <div className="sidebar-status-row">
              <span className="sidebar-status-label">{t('Active Staff')}:</span>
              <span className="sidebar-status-val">{SECTORS.length} {t('Zones')} • {totalRosterOfficers} {t('Officers')}</span>
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

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CitizenDashboard from './components/CitizenDashboard';
import TrackingView from './components/TrackingView';
import AdminDashboard from './components/AdminDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import KnowledgeBase from './components/KnowledgeBase';
import GrievanceFormModal from './components/GrievanceFormModal';
import ServiceApplicationModal from './components/ServiceApplicationModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import SettingsModal from './components/SettingsModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import FloatingAiChatBot from './components/FloatingAiChatBot';
import AuthScreen from './components/AuthScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import { grievanceAPI, applicationAPI, serviceAPI, advisoryAPI } from './api/apiClient';
import { isSameDepartment } from './utils/departmentScope';
import { releaseOfficerFromTicket } from './utils/officerDispatch';
import { safeSetItem, safeGetItem, sanitizeGrievances } from './utils/safeStorage';
import { auditAndEscalateGrievances } from './utils/slaEscalationEngine';

import { 
  INITIAL_SERVICES, 
  INITIAL_GRIEVANCES, 
  INITIAL_APPLICATIONS, 
  FAQ_ARTICLES, 
  DEPARTMENTS 
} from './data/mockData';

import './App.css';

// Resilient Navigation State Restoration Helper across Page Refresh & Browser Reloads
function getInitialNavState(user) {
  const isOfficial = user && (user.role === 'OFFICER' || user.role === 'ADMIN');

  // 1. Read hash if available in browser URL
  let hashTab = '';
  let hashParams = {};
  if (typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (raw) {
      const [path, query] = raw.split('?');
      hashTab = path;
      if (query) {
        query.split('&').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k) hashParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
      }
    }
  }

  // 2. Read stored session / local state
  let storedTab = '';
  let storedPortal = '';
  let storedSection = '';
  let storedScope = '';
  let storedTrackId = '';

  try {
    storedTab = sessionStorage.getItem('janseva_active_tab') || localStorage.getItem('janseva_active_tab') || '';
    storedPortal = sessionStorage.getItem('janseva_active_portal') || localStorage.getItem('janseva_active_portal') || '';
    storedSection = sessionStorage.getItem('janseva_admin_section') || localStorage.getItem('janseva_admin_section') || '';
    storedScope = sessionStorage.getItem('janseva_officer_queue_scope') || localStorage.getItem('janseva_officer_queue_scope') || '';
    storedTrackId = sessionStorage.getItem('janseva_selected_track_id') || localStorage.getItem('janseva_selected_track_id') || '';
  } catch (e) {}

  const validCitizenTabs = ['overview', 'services', 'track', 'faqs'];
  const validAdminSections = user?.role === 'OFFICER'
    ? ['grievances', 'applications', 'map', 'sla-tribunal']
    : ['grievances', 'applications', 'appeals', 'roster', 'sla-tribunal', 'governance', 'analytics', 'audit', 'notifications', 'blockchain'];

  if (isOfficial) {
    let section = 'grievances';
    if (validAdminSections.includes(hashParams.section)) {
      section = hashParams.section;
    } else if (validAdminSections.includes(storedSection)) {
      section = storedSection;
    }

    return {
      portal: 'admin',
      tab: 'admin-dashboard',
      adminSection: section,
      officerQueueScope: hashParams.scope || storedScope || 'assigned',
      selectedTrackId: ''
    };
  }

  // Citizen Navigation
  let tab = 'overview';
  if (validCitizenTabs.includes(hashTab)) {
    tab = hashTab;
  } else if (validCitizenTabs.includes(storedTab)) {
    tab = storedTab;
  }

  const trackId = hashParams.id || hashParams.trackId || storedTrackId || '';

  return {
    portal: 'citizen',
    tab,
    adminSection: 'grievances',
    officerQueueScope: 'assigned',
    selectedTrackId: trackId
  };
}

function MainAppContent() {
  const { user } = useAuth();
  const isCitizen = user?.role === 'CITIZEN';
  const isOfficer = user?.role === 'OFFICER';
  const isAdmin = user?.role === 'ADMIN';

  // Restore initial navigation snapshot from URL hash and session persistence
  const initialNav = getInitialNavState(user);

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('janseva_theme') || 'light');
  
  // Navigation State with Full Reload & Refresh Persistence
  const [activePortal, setActivePortal] = useState(() => initialNav.portal);
  const [activeTab, setActiveTab] = useState(() => initialNav.tab);
  const [adminActiveSection, setAdminActiveSection] = useState(() => initialNav.adminSection);
  const [officerQueueScope, setOfficerQueueScope] = useState(() => initialNav.officerQueueScope);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [advisories, setAdvisories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState(() => initialNav.selectedTrackId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const previousUserRef = useRef(user ? `${user.role}:${user.email || user.userId || ''}` : null);

  // Modals state
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Navigation History Stack for Complete Step-by-Step Back Navigation
  const [navHistory, setNavHistory] = useState([]);

  // Data State with API + LocalStorage Fallback (Quota Protected)
  const [grievances, setGrievances] = useState(() => {
    try {
      const saved = safeGetItem('janseva_grievances', null);
      return saved && Array.isArray(saved) && saved.length > 0 
        ? sanitizeGrievances(saved) 
        : INITIAL_GRIEVANCES;
    } catch (e) {
      console.warn("Failed to parse grievances from storage:", e);
      return INITIAL_GRIEVANCES;
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = safeGetItem('janseva_applications', null);
      return saved && Array.isArray(saved) && saved.length > 0 
        ? saved 
        : INITIAL_APPLICATIONS;
    } catch (e) {
      console.warn("Failed to parse applications from storage:", e);
      return INITIAL_APPLICATIONS;
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'Status Update on Ticket #GRV-2026-8910',
      message: 'Field dredging team dispatched by Senior Engineer.',
      time: '10 mins ago',
      type: 'in-progress'
    },
    {
      id: 'n-2',
      title: 'Service Approved #APP-2026-1049',
      message: 'Birth Certificate digital copy is ready for download.',
      time: '1 hour ago',
      type: 'resolved'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Centralized Navigation Controller that pushes snapshot to history
  const navigateTo = (newTab, options = {}) => {
    // If navigating to main overview dashboard, reset navigation history
    if (newTab === 'overview' && !showGrievanceModal && !selectedServiceModal && !showSettingsModal && !showPrivacyModal && !showTermsModal) {
      setNavHistory([]);
    } else {
      // Save snapshot of current view before transitioning
      const snapshot = {
        activePortal,
        activeTab,
        selectedTrackId,
        showGrievanceModal,
        selectedServiceModal,
        showSettingsModal,
        showPrivacyModal,
        showTermsModal,
        scrollPosition: window.scrollY
      };

      // Prevent duplicate consecutive entries in history
      const isSameState = activeTab === newTab && 
        activePortal === (options.portal || activePortal) &&
        selectedTrackId === (options.trackId !== undefined ? options.trackId : selectedTrackId) &&
        !showGrievanceModal && !selectedServiceModal && !showSettingsModal && !showPrivacyModal && !showTermsModal;

      if (!isSameState) {
        setNavHistory(prev => [...prev, snapshot]);
        // Update browser URL hash / history
        try {
          window.history.pushState({ tab: newTab, portal: options.portal || activePortal, trackId: options.trackId }, '', '#' + newTab);
        } catch (e) {}
      }
    }

    // Strict Role-Based Portal Guard: Officers and Admins belong exclusively in the Official Governance Center
    if (!isCitizen) {
      setActivePortal('admin');
      setActiveTab('admin-dashboard');
      setNavHistory([]);
      if (options.closeModals !== false) {
        setShowGrievanceModal(false);
        setSelectedServiceModal(null);
        setShowSettingsModal(false);
        setShowPrivacyModal(false);
        setShowTermsModal(false);
      }
      return;
    }

    if (options.portal) setActivePortal(options.portal);
    if (newTab) {
      setActiveTab(newTab);
      if (newTab === 'overview') {
        setNavHistory([]);
      }
    }
    if (options.trackId !== undefined) setSelectedTrackId(options.trackId);
    if (options.closeModals !== false) {
      setShowGrievanceModal(false);
      setSelectedServiceModal(null);
      setShowSettingsModal(false);
      setShowPrivacyModal(false);
      setShowTermsModal(false);
    }
  };

  // Step-by-step Go Back Handler
  const handleGoBack = () => {
    // 1. If any modal is open, closing it is the immediate step back
    if (showGrievanceModal || selectedServiceModal || showSettingsModal || showPrivacyModal || showTermsModal) {
      setShowGrievanceModal(false);
      setSelectedServiceModal(null);
      setShowSettingsModal(false);
      setShowPrivacyModal(false);
      setShowTermsModal(false);
      return;
    }

    // 2. Officers and Admins belong strictly to their official dashboard and must NEVER be kicked to citizen pages
    if (!isCitizen) {
      setActivePortal('admin');
      setActiveTab('admin-dashboard');
      setNavHistory([]);
      return;
    }

    // 3. If history has previous views, pop the last one (Citizens only)
    if (navHistory.length > 0) {
      const historyCopy = [...navHistory];
      const previousState = historyCopy.pop();
      setNavHistory(historyCopy);

      if (previousState) {
        setActivePortal('citizen');
        setActiveTab(previousState.activeTab || 'overview');
        setSelectedTrackId(previousState.selectedTrackId || '');
        setShowGrievanceModal(Boolean(previousState.showGrievanceModal));
        setSelectedServiceModal(previousState.selectedServiceModal || null);
        setShowSettingsModal(Boolean(previousState.showSettingsModal));
        setShowPrivacyModal(Boolean(previousState.showPrivacyModal));
        setShowTermsModal(Boolean(previousState.showTermsModal));

        // If returned to overview and no modals open, reset history completely
        if (previousState.activeTab === 'overview' && !previousState.showGrievanceModal && !previousState.selectedServiceModal && !previousState.showSettingsModal && !previousState.showPrivacyModal && !previousState.showTermsModal) {
          setNavHistory([]);
        }

        if (previousState.scrollPosition !== undefined) {
          setTimeout(() => {
            window.scrollTo({ top: previousState.scrollPosition, behavior: 'smooth' });
          }, 40);
        }
      }
      return;
    }

    // 4. Fallback for citizens: return to citizen overview dashboard
    setActiveTab('overview');
    setActivePortal('citizen');
    setNavHistory([]);
  };

  // Synchronize with Browser's Native Back / Forward Buttons
  useEffect(() => {
    const onPopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        if (event.state.portal) setActivePortal(event.state.portal);
        if (event.state.trackId !== undefined) setSelectedTrackId(event.state.trackId);
        if (event.state.tab === 'overview') {
          setNavHistory([]);
        }
      } else {
        handleGoBack();
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navHistory, showGrievanceModal, selectedServiceModal, showSettingsModal, showPrivacyModal, showTermsModal]);

  const isAnyModalOpen = showGrievanceModal || Boolean(selectedServiceModal) || showSettingsModal || showPrivacyModal || showTermsModal;
  // Officers and Admins are permanently stationed on their official portal with zero back button to citizen pages
  const canGoBack = isCitizen && (activeTab !== 'overview' || isAnyModalOpen);

  const getPreviousPageTitle = () => {
    if (isAnyModalOpen) {
      return 'Current Page';
    }
    if (navHistory.length > 0) {
      const last = navHistory[navHistory.length - 1];
      switch (last.activeTab) {
        case 'overview': return 'Overview Dashboard';
        case 'services': return 'Public Services';
        case 'track': return 'Track Status';
        case 'faqs': return 'Knowledge Base';
        case 'admin-dashboard': return 'Admin Governance';
        default: return 'Previous Page';
      }
    }
    return activeTab !== 'overview' ? 'Overview Dashboard' : '';
  };

  // Synchronize active portal with user role ONLY when the logged-in user or role actually changes
  useEffect(() => {
    if (!user) return;
    const currentKey = `${user.role}:${user.email || user.userId || ''}`;
    if (previousUserRef.current !== currentKey) {
      previousUserRef.current = currentKey;
      if (user.role === 'CITIZEN') {
        setActivePortal('citizen');
        setActiveTab('overview');
      } else {
        setActivePortal('admin');
        setActiveTab('admin-dashboard');
      }
    }
  }, [user]);

  // Persist navigation state to sessionStorage & localStorage and synchronize URL hash so page reloads remain on the exact page
  useEffect(() => {
    try {
      sessionStorage.setItem('janseva_active_portal', activePortal);
      sessionStorage.setItem('janseva_active_tab', activeTab);
      sessionStorage.setItem('janseva_admin_section', adminActiveSection);
      sessionStorage.setItem('janseva_officer_queue_scope', officerQueueScope);
      if (selectedTrackId) {
        sessionStorage.setItem('janseva_selected_track_id', selectedTrackId);
      } else {
        sessionStorage.removeItem('janseva_selected_track_id');
      }

      localStorage.setItem('janseva_active_tab', activeTab);
      localStorage.setItem('janseva_active_portal', activePortal);
      localStorage.setItem('janseva_admin_section', adminActiveSection);
      localStorage.setItem('janseva_officer_queue_scope', officerQueueScope);
      if (selectedTrackId) {
        localStorage.setItem('janseva_selected_track_id', selectedTrackId);
      } else {
        localStorage.removeItem('janseva_selected_track_id');
      }

      // Sync window URL hash without triggering an unnecessary extra history push
      let targetHash = `#${activeTab}`;
      if (activeTab === 'admin-dashboard') {
        const params = new URLSearchParams();
        if (adminActiveSection) params.set('section', adminActiveSection);
        if (officerQueueScope) params.set('scope', officerQueueScope);
        const query = params.toString();
        targetHash = `#admin-dashboard${query ? '?' + query : ''}`;
      } else if (activeTab === 'track' && selectedTrackId) {
        targetHash = `#track?id=${encodeURIComponent(selectedTrackId)}`;
      }

      if (window.location.hash !== targetHash) {
        window.history.replaceState(
          { tab: activeTab, portal: activePortal, trackId: selectedTrackId, section: adminActiveSection, scope: officerQueueScope },
          '',
          targetHash
        );
      }
    } catch (e) {
      console.warn('Failed to sync navigation state to storage / URL hash:', e);
    }
  }, [activePortal, activeTab, adminActiveSection, officerQueueScope, selectedTrackId]);

  // Synchronize state when browser URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const nextNav = getInitialNavState(user);
      if (nextNav.portal && nextNav.portal !== activePortal) {
        setActivePortal(nextNav.portal);
      }
      if (nextNav.tab && nextNav.tab !== activeTab) {
        setActiveTab(nextNav.tab);
      }
      if (nextNav.adminSection && nextNav.adminSection !== adminActiveSection) {
        setAdminActiveSection(nextNav.adminSection);
      }
      if (nextNav.officerQueueScope && nextNav.officerQueueScope !== officerQueueScope) {
        setOfficerQueueScope(nextNav.officerQueueScope);
      }
      if (nextNav.selectedTrackId !== undefined && nextNav.selectedTrackId !== selectedTrackId) {
        setSelectedTrackId(nextNav.selectedTrackId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, activePortal, activeTab, adminActiveSection, officerQueueScope, selectedTrackId]);

  // Sync Theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('janseva_theme', theme);
  }, [theme]);

  // Sync Data to localStorage with Quota Protection & Payload Sanitization
  useEffect(() => {
    const cleaned = sanitizeGrievances(grievances);
    safeSetItem('janseva_grievances', cleaned);
  }, [grievances]);

  useEffect(() => {
    safeSetItem('janseva_applications', applications);
  }, [applications]);

  // Fetch live grievances, applications, and services from backend API on mount
  useEffect(() => {
    async function fetchLiveData() {
      try {
        const gData = await grievanceAPI.getAll();
        if (gData && Array.isArray(gData.grievances)) {
          setGrievances(gData.grievances);
        }
      } catch (err) {}

      try {
        const aData = await applicationAPI.getAll();
        if (aData && Array.isArray(aData.applications)) {
          setApplications(aData.applications);
        }
      } catch (err) {}
      try {
        const sData = await serviceAPI.getAll();
        if (Array.isArray(sData?.services) && sData.services.length > 0) {
          setServices(() => {
            const byId = new Map(INITIAL_SERVICES.map((s) => [s.id, s]));
            for (const srv of sData.services) {
              byId.set(srv.id, { ...(byId.get(srv.id) || {}), ...srv });
            }
            return Array.from(byId.values());
          });
        }
      } catch (err) {}

      try {
        const advData = await advisoryAPI.getAll();
        if (Array.isArray(advData?.advisories)) {
          setAdvisories(advData.advisories);
        }
      } catch (err) {}
    }
    fetchLiveData();
  }, [user?.role, user?.email]);

  useEffect(() => {
    if (isOfficer && !['grievances', 'applications', 'map', 'sla-tribunal'].includes(adminActiveSection)) {
      setAdminActiveSection('grievances');
    }
  }, [isOfficer, adminActiveSection]);

  // Automated Periodic SLA Breach & Multi-Tier Escalation Audit Engine
  useEffect(() => {
    if (!grievances || grievances.length === 0) return;

    const runSlaAudit = () => {
      const result = auditAndEscalateGrievances(grievances);
      if (result.hasChanges) {
        setGrievances(result.grievances);
        if (result.escalatedCount > 0) {
          setNotifications(prev => [
            {
              id: `sla-esc-${Date.now()}`,
              title: `🚨 ${result.escalatedCount} Complaint(s) Auto-Escalated to Executive Engineers`,
              message: `Statutory SLA elapsed. Re-assigned to Supervising Executive Engineers with Show Cause Notices issued.`,
              time: 'Just now',
              type: 'escalated'
            },
            ...prev
          ]);
        }
      }
    };

    runSlaAudit();
    const interval = setInterval(runSlaAudit, 30000);
    return () => clearInterval(interval);
  }, [grievances]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Actions
  const handleAddGrievance = async (newGrievance) => {
    try {
      await grievanceAPI.create(newGrievance);
    } catch (e) {}

    setGrievances(prev => [newGrievance, ...prev]);
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: `New Ticket Lodged #${newGrievance.id}`,
        message: `Routed to ${newGrievance.department}. SLA deadline: 3 Days.`,
        time: 'Just now',
        type: 'submitted'
      },
      ...prev
    ]);
  };

  const handleUpvoteGrievance = async (existingTicketId) => {
    try {
      await grievanceAPI.upvote(existingTicketId, user?.fullName || 'Citizen');
    } catch (e) {}

    setGrievances(prev => prev.map(g => {
      if (g.id === existingTicketId) {
        const currentCount = g.reportCount || 1;
        const newCount = currentCount + 1;
        const newPriority = newCount >= 3 ? 'Urgent' : newCount >= 2 ? 'High' : g.priority;
        const updatedTimeline = [
          ...(g.timeline || []),
          {
            status: g.status,
            timestamp: new Date().toISOString(),
            note: `Community Report #+1 added by ${user?.fullName || 'Citizen'}. Priority auto-escalated to ${newPriority} (${newCount} citizens affected).`
          }
        ];
        return {
          ...g,
          reportCount: newCount,
          priority: newPriority,
          timeline: updatedTimeline
        };
      }
      return g;
    }));

    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: `Subscribed to Ticket #${existingTicketId}`,
        message: `You will receive SMS alerts as officers resolve this community issue.`,
        time: 'Just now',
        type: 'in-progress'
      },
      ...prev
    ]);
  };

  const handleAddApplication = async (newApp) => {
    try {
      await applicationAPI.create(newApp);
    } catch (e) {}

    setApplications(prev => [newApp, ...prev]);
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: `Service Application Received #${newApp.id}`,
        message: `Verification under process for ${newApp.serviceName}.`,
        time: 'Just now',
        type: 'submitted'
      },
      ...prev
    ]);
  };

  const handleClaimGrievance = async (id, extra = {}) => {
    let backendUpdated = null;
    try {
      const res = await grievanceAPI.claim(id, extra);
      if (res?.grievance) backendUpdated = res.grievance;
    } catch (e) {}

    setGrievances((prev) => prev.map((g) => {
      if (g.id !== id) return g;
      if (backendUpdated) return { ...g, ...backendUpdated };
      const claimant = user?.fullName || user?.email || 'Field Officer';
      const nextStatus = ['Submitted', 'Under Review'].includes(g.status) ? 'Assigned' : g.status;
      return {
        ...g,
        status: nextStatus,
        assignedOfficer: claimant,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(g.timeline || []),
          { status: nextStatus, officerName: claimant, timestamp: new Date().toISOString(), note: extra.note || `Claimed by ${claimant}.` }
        ]
      };
    }));
  };

  const handleTransferGrievance = async (id, targetDepartment, reason) => {
    let backendUpdated = null;
    try {
      const res = await grievanceAPI.transfer(id, { targetDepartment, reason });
      if (res?.grievance) backendUpdated = res.grievance;
    } catch (e) {}

    setGrievances((prev) => prev.map((g) => {
      if (g.id !== id) return g;
      if (backendUpdated) return { ...g, ...backendUpdated };
      return {
        ...g,
        department: targetDepartment,
        status: ['Resolved', 'Rejected'].includes(g.status) ? g.status : 'Under Review',
        assignedOfficer: `${targetDepartment} Desk`,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(g.timeline || []),
          { status: 'Under Review', timestamp: new Date().toISOString(), note: `Transferred to ${targetDepartment}. Reason: ${reason}` }
        ]
      };
    }));
  };

  const handleBulkAssignGrievances = async (grievanceIds, officerName, officerContact, note) => {
    try {
      const res = await grievanceAPI.bulkAssign({ grievanceIds, officerName, officerContact, note });
      if (Array.isArray(res?.grievances) && res.grievances.length > 0) {
        const updatedMap = new Map(res.grievances.map((item) => [item.id, item]));
        setGrievances((prev) => prev.map((g) => (updatedMap.has(g.id) ? { ...g, ...updatedMap.get(g.id) } : g)));
        return res;
      }
    } catch (e) {}

    const idSet = new Set(grievanceIds);
    setGrievances((prev) => prev.map((g) => {
      if (!idSet.has(g.id) || ['Resolved', 'Rejected'].includes(g.status)) return g;
      const nextStatus = ['Submitted', 'Under Review'].includes(g.status) ? 'Assigned' : g.status;
      return {
        ...g,
        status: nextStatus,
        assignedOfficer: officerName,
        assignedOfficerContact: officerContact || g.assignedOfficerContact,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(g.timeline || []),
          { status: nextStatus, officerName, timestamp: new Date().toISOString(), note: note || `Bulk assigned to ${officerName}.` }
        ]
      };
    }));
    return null;
  };

  const handleLinkDuplicateGrievance = async (duplicateId, masterGrievanceId, note) => {
    try {
      const res = await grievanceAPI.linkDuplicate(duplicateId, { masterGrievanceId, note });
      if (res?.duplicate && res?.master) {
        setGrievances((prev) => prev.map((g) => {
          if (g.id === duplicateId) return { ...g, ...res.duplicate };
          if (g.id === masterGrievanceId) return { ...g, ...res.master };
          return g;
        }));
        return res;
      }
    } catch (e) {}

    setGrievances((prev) => prev.map((g) => {
      if (g.id === duplicateId) return { ...g, duplicateOf: masterGrievanceId, updatedAt: new Date().toISOString() };
      if (g.id === masterGrievanceId) {
        const linked = Array.isArray(g.linkedDuplicates) ? [...g.linkedDuplicates] : [];
        if (!linked.includes(duplicateId)) linked.push(duplicateId);
        return { ...g, linkedDuplicates: linked, updatedAt: new Date().toISOString() };
      }
      return g;
    }));
    return null;
  };

  const handleUpdateApplicationStatus = async (id, payload) => {
    let backendApp = null;
    try {
      const res = await applicationAPI.updateStatus(id, payload);
      if (res?.application) backendApp = res.application;
    } catch (e) {}

    setApplications((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      if (backendApp) return { ...a, ...backendApp };
      return {
        ...a,
        status: payload.status,
        remarks: payload.remarks || payload.resubmissionReason || payload.rejectionReason || a.remarks,
        verifiedDocuments: payload.verifiedDocuments || a.verifiedDocuments,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const handleUpdateGrievanceStatus = async (id, status, officerName, note, extraPayload = {}) => {
    let backendGrievance = null;
    try {
      const res = await grievanceAPI.updateStatus(id, { nextStatus: status, officerName, note, ...extraPayload });
      if (res?.grievance) backendGrievance = res.grievance;
    } catch (e) {}

    if (backendGrievance) {
      if (status === 'Resolved' || status === 'Rejected') {
        try { releaseOfficerFromTicket(id); } catch (e) {}
      }
      setGrievances((prev) => prev.map((g) => (g.id === id ? { ...g, ...backendGrievance } : g)));
      if (status === 'Resolved' && Array.isArray(backendGrievance.linkedDuplicates) && backendGrievance.linkedDuplicates.length > 0) {
        try {
          const gData = await grievanceAPI.getAll();
          if (Array.isArray(gData?.grievances)) setGrievances(gData.grievances);
        } catch (e) {}
      }
      return;
    }

    // When a ticket is marked Resolved or Rejected, free up the officer and return them to the queue!
    if (status === 'Resolved' || status === 'Rejected') {
      try {
        releaseOfficerFromTicket(id);
      } catch (e) {}
    }

    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        const updatedTimeline = [
          ...(g.timeline || []),
          {
            status: status,
            timestamp: new Date().toISOString(),
            note: note || `Status changed to ${status} by ${officerName}.`
          }
        ];
        return {
          ...g,
          status,
          assignedOfficer: officerName || g.assignedOfficer,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline
        };
      }
      return g;
    }));

    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: `Ticket #${id} Updated to ${status}`,
        message: note || `Action taken by ${officerName}.`,
        time: 'Just now',
        type: status === 'Resolved' ? 'resolved' : 'in-progress'
      },
      ...prev
    ]);
  };

  const handleSubmitFeedback = async (id, rating, comment) => {
    try {
      await grievanceAPI.submitFeedback(id, { rating, comment });
    } catch (e) {}

    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          feedback: { rating, comment, submittedAt: new Date().toISOString() }
        };
      }
      return g;
    }));
  };

  const handleReopenGrievance = async (id) => {
    try {
      await grievanceAPI.reopen(id, 'Incomplete resolution');
    } catch (e) {}

    handleUpdateGrievanceStatus(id, 'Under Review', 'Control Room Nodal Officer', 'Ticket re-opened by citizen due to incomplete resolution. Priority escalated.');
  };

  // If user is not logged in, enforce the Login-First Gate
  if (!user) {
    return <AuthScreen />;
  }

  const cleanUserPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const cleanUserEmail = (user?.email || '').toLowerCase().trim();
  const cleanUserName = (user?.fullName || '').toLowerCase().trim();
  const cleanUserEmpId = (user?.employeeId || user?.userId || '').toLowerCase().trim();

  // Scope notifications strictly to the current user
  const userNotifications = notifications.filter(n => {
    if (isAdmin) return true;
    const match = n.title.match(/#(GRV-[\w-]+|APP-[\w-]+)/i);
    if (!match || !match[1]) return true;
    const ticketId = match[1];

    if (isCitizen) {
      const g = grievances.find(item => item && item.id === ticketId);
      if (g) {
        const itemPhone = (g.citizenPhone || '').replace(/\D/g, '').slice(-10);
        return (cleanUserPhone && itemPhone === cleanUserPhone) || 
               (g.citizenEmail && g.citizenEmail.toLowerCase() === cleanUserEmail) ||
               (g.citizenName && g.citizenName.toLowerCase() === cleanUserName);
      }
      const app = applications.find(item => item && item.id === ticketId);
      if (app) {
        return (cleanUserPhone && app.applicantPhone && app.applicantPhone.includes(cleanUserPhone)) ||
               (app.applicantEmail && app.applicantEmail.toLowerCase() === cleanUserEmail);
      }
      return false;
    }

    if (isOfficer) {
      const g = grievances.find(item => item && item.id === ticketId);
      if (g) {
        const assigned = (g.assignedOfficer || '').toLowerCase();
        return (cleanUserName && assigned.includes(cleanUserName)) || 
               (cleanUserEmpId && assigned.includes(cleanUserEmpId));
      }
      return false;
    }

    return true;
  });

  return (
    <div className="app-root">
      <div className="app-layout">
        
        {/* Left Navigation Sidebar (Retractable, initially closed) */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={(tab) => navigateTo(tab)}
          activePortal={activePortal}
          setActivePortal={(portal) => navigateTo(activeTab, { portal })}
          adminActiveSection={adminActiveSection}
          setAdminActiveSection={setAdminActiveSection}
          officerQueueScope={officerQueueScope}
          setOfficerQueueScope={setOfficerQueueScope}
          grievances={grievances}
          applications={applications}
          openGrievanceModal={() => {
            navigateTo(activeTab, { closeModals: false });
            setShowGrievanceModal(true);
          }}
          onOpenSettings={() => {
            navigateTo(activeTab, { closeModals: false });
            setShowSettingsModal(true);
          }}
          isSettingsOpen={showSettingsModal}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Application Area */}
        <div className="app-main-wrapper">
          
          {/* Top Navbar Header - Citizen Overview and Official Portals (Subpages render .subpage-back-bar) */}
          {(activeTab === 'overview' || activeTab === 'admin-dashboard' || (!isCitizen && activePortal === 'admin')) && (
            <Navbar 
              activeTab={activeTab}
              setActiveTab={(tab) => navigateTo(tab)}
              onNavigate={(tab) => navigateTo(tab)}
              canGoBack={canGoBack}
              onGoBack={handleGoBack}
              previousPageTitle={getPreviousPageTitle()}
              unreadNotifications={userNotifications.length}
              setShowNotifications={setShowNotifications}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            />
          )}

          {/* Real-time Notifications Popover */}
          {showNotifications && (
            <NotificationsDrawer 
              notifications={userNotifications}
              onClose={() => setShowNotifications(false)}
              onClearAll={() => setNotifications([])}
              onSelectNotification={(n) => {
                const match = n.title.match(/#(GRV-[\w-]+|APP-[\w-]+)/i);
                if (match && match[1]) {
                  navigateTo('track', { trackId: match[1] });
                }
              }}
            />
          )}

          {/* Main App Page View Switcher */}
          <main className="main-app-container">
        
        {/* Official / Admin Portal View */}
        {!isCitizen && activePortal === 'admin' ? (
          isOfficer ? (
            <OfficerDashboard
              grievances={grievances}
              applications={applications}
              advisories={advisories}
              departments={DEPARTMENTS}
              onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
              onClaimGrievance={handleClaimGrievance}
              onTransferGrievance={handleTransferGrievance}
              onUpdateApplicationStatus={handleUpdateApplicationStatus}
              onGoBack={handleGoBack}
              canGoBack={canGoBack}
              activeSection={adminActiveSection}
              setActiveSection={setAdminActiveSection}
              officerQueueScope={officerQueueScope}
              setOfficerQueueScope={setOfficerQueueScope}
            />
          ) : (
            <AdminDashboard
              grievances={grievances}
              applications={applications}
              setApplications={setApplications}
              services={services}
              setServices={setServices}
              advisories={advisories}
              setAdvisories={setAdvisories}
              departments={DEPARTMENTS}
              onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
              onAssignOfficer={handleUpdateGrievanceStatus}
              onBulkAssignGrievances={handleBulkAssignGrievances}
              onLinkDuplicateGrievance={handleLinkDuplicateGrievance}
              onUpdateApplicationStatus={handleUpdateApplicationStatus}
              onGoBack={handleGoBack}
              canGoBack={canGoBack}
              activeSection={adminActiveSection}
              setActiveSection={setAdminActiveSection}
              officerQueueScope={officerQueueScope}
              setOfficerQueueScope={setOfficerQueueScope}
            />
          )
        ) : (
          /* Citizen View Tabs */
          <>
            {activeTab === 'overview' && (
              <CitizenDashboard 
                grievances={grievances}
                services={services}
                applications={applications}
                openGrievanceModal={() => {
                  navigateTo(activeTab, { closeModals: false });
                  setShowGrievanceModal(true);
                }}
                openServiceModal={(service) => {
                  navigateTo(activeTab, { closeModals: false });
                  setSelectedServiceModal(service);
                }}
                activeTab={activeTab}
                setActiveTab={(tab) => navigateTo(tab)}
                selectGrievanceToTrack={(id) => navigateTo('track', { trackId: id })}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                onGoBack={handleGoBack}
                canGoBack={canGoBack}
                unreadNotifications={userNotifications.length}
                setShowNotifications={setShowNotifications}
              />
            )}

            {activeTab === 'services' && (
              <CitizenDashboard 
                grievances={grievances}
                services={services}
                applications={applications}
                openGrievanceModal={() => {
                  navigateTo(activeTab, { closeModals: false });
                  setShowGrievanceModal(true);
                }}
                openServiceModal={(service) => {
                  navigateTo(activeTab, { closeModals: false });
                  setSelectedServiceModal(service);
                }}
                activeTab={activeTab}
                setActiveTab={(tab) => navigateTo(tab)}
                selectGrievanceToTrack={(id) => navigateTo('track', { trackId: id })}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                onGoBack={handleGoBack}
                canGoBack={canGoBack}
                unreadNotifications={userNotifications.length}
                setShowNotifications={setShowNotifications}
              />
            )}

            {activeTab === 'track' && (
              <TrackingView 
                grievances={grievances}
                applications={applications}
                selectedTrackId={selectedTrackId}
                onSubmitFeedback={handleSubmitFeedback}
                onReopenGrievance={handleReopenGrievance}
                onGoBack={handleGoBack}
                canGoBack={canGoBack}
                previousPageTitle={getPreviousPageTitle()}
                unreadNotifications={userNotifications.length}
                setShowNotifications={setShowNotifications}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
              />
            )}

            {activeTab === 'faqs' && (
              <KnowledgeBase 
                faqs={FAQ_ARTICLES}
                grievances={grievances}
                applications={applications}
                services={services}
                user={user}
                searchQuery={searchQuery}
                onGoBack={handleGoBack}
                canGoBack={canGoBack}
                previousPageTitle={getPreviousPageTitle()}
                unreadNotifications={userNotifications.length}
                setShowNotifications={setShowNotifications}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                onTrackTicket={(id) => navigateTo('track', { trackId: id })}
                onOpenGrievanceModal={(prefill) => {
                  navigateTo(activeTab, { closeModals: false });
                  setShowGrievanceModal(true);
                }}
                onOpenServiceModal={(service) => {
                  navigateTo(activeTab, { closeModals: false });
                  setSelectedServiceModal(service);
                }}
                onNavigateServices={() => navigateTo('services')}
                onNavigateTrack={(trackId) => navigateTo('track', { trackId })}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="footer glass-card" style={{ borderRadius: 0, marginTop: '50px', borderBottom: 0, borderLeft: 0, borderRight: 0 }}>
        <div className="main-app-container flex-between flex-wrap gap-4" style={{ margin: 0, padding: '20px' }}>
          <div>
            <strong style={{ fontFamily: 'var(--font-heading)' }}>JanSeva Public Service & Grievance Governance Portal</strong>
            <p className="small-text text-muted">Ministry of Governance & Administrative Reforms - Government Platform</p>
          </div>
          <div className="flex-align-center gap-3 text-muted small-text">
            <span>24x7 Citizen Helpline: <strong>1800-425-GOV</strong></span>
            <span>-</span>
            <button 
              type="button"
              onClick={() => {
                navigateTo(activeTab, { closeModals: false });
                setShowPrivacyModal(true);
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--brand-700)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 600, textDecoration: 'underline' }}
            >
              Privacy Policy
            </button>
            <span>-</span>
            <button 
              type="button"
              onClick={() => {
                navigateTo(activeTab, { closeModals: false });
                setShowTermsModal(true);
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--brand-700)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 600, textDecoration: 'underline' }}
            >
              Terms of Governance
            </button>
          </div>
        </div>
      </footer>

    </div>
  </div>

  {/* Grievance Lodge Modal */}
  {showGrievanceModal && (
    <GrievanceFormModal 
      departments={DEPARTMENTS}
      grievances={grievances}
      onClose={() => handleGoBack()}
      onSubmitGrievance={handleAddGrievance}
      onUpvoteGrievance={handleUpvoteGrievance}
    />
  )}

  {/* Service Application Modal */}
  {selectedServiceModal && (
    <ServiceApplicationModal 
      service={selectedServiceModal}
      onClose={() => handleGoBack()}
      onSubmitApplication={handleAddApplication}
    />
  )}

  {/* Portal & User Settings Modal */}
  {showSettingsModal && (
    <SettingsModal 
      onClose={() => handleGoBack()}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )}

  {/* Privacy Policy Modal */}
  {showPrivacyModal && (
    <PrivacyPolicyModal onClose={() => handleGoBack()} />
  )}

  {/* Terms of Governance Modal */}
  {showTermsModal && (
    <TermsOfServiceModal onClose={() => handleGoBack()} />
  )}

  {/* Movable Floating AI Redressal Bot */}
  <FloatingAiChatBot 
    grievances={grievances}
    applications={applications}
    services={services}
    user={user}
    onTrackTicket={(id) => navigateTo('track', { trackId: id })}
    onOpenGrievanceModal={(prefill) => {
      navigateTo(activeTab, { closeModals: false });
      setShowGrievanceModal(true);
    }}
    onOpenServiceModal={(service) => {
      navigateTo(activeTab, { closeModals: false });
      setSelectedServiceModal(service);
    }}
    onNavigateServices={() => navigateTo('services')}
    onNavigateTrack={(trackId) => navigateTo('track', { trackId })}
    onOpenSubmissionsModal={() => {
      const el = document.querySelector('.my-submissions-banner-card');
      if (el) el.click();
    }}
  />

</div>
);
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <MainAppContent />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

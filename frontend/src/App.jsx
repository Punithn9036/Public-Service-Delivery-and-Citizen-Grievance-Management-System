import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CitizenDashboard from './components/CitizenDashboard';
import TrackingView from './components/TrackingView';
import AdminDashboard from './components/AdminDashboard';
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
import { grievanceAPI } from './api/apiClient';

import { 
  INITIAL_SERVICES, 
  INITIAL_GRIEVANCES, 
  INITIAL_APPLICATIONS, 
  FAQ_ARTICLES, 
  DEPARTMENTS 
} from './data/mockData';

import './App.css';

function MainAppContent() {
  const { user } = useAuth();

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('janseva_theme') || 'light');
  
  // Navigation State
  const [activePortal, setActivePortal] = useState('citizen'); // 'citizen' | 'admin'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'track' | 'faqs' | 'admin-dashboard'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Initially closed by default as requested

  // Modals state
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Navigation History Stack for Complete Step-by-Step Back Navigation
  const [navHistory, setNavHistory] = useState([]);

  // Data State with API + LocalStorage Fallback
  const [grievances, setGrievances] = useState(() => {
    try {
      const saved = localStorage.getItem('janseva_grievances');
      return saved ? JSON.parse(saved) : INITIAL_GRIEVANCES;
    } catch (e) {
      console.warn("Failed to parse grievances from storage:", e);
      return INITIAL_GRIEVANCES;
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('janseva_applications');
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
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

    // 2. If history has previous views, pop the last one
    if (navHistory.length > 0) {
      const historyCopy = [...navHistory];
      const previousState = historyCopy.pop();
      setNavHistory(historyCopy);

      if (previousState) {
        setActivePortal(previousState.activePortal || 'citizen');
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

    // 3. Fallback: If no history but on a sub-view, return to overview dashboard and reset
    if (activeTab !== 'overview') {
      setActiveTab('overview');
      setActivePortal('citizen');
      setNavHistory([]);
    }
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
  const canGoBack = activeTab !== 'overview' || isAnyModalOpen;

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

  // Synchronize active portal with user role when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'CITIZEN') {
        setActivePortal('citizen');
        setActiveTab('overview');
      } else {
        setActivePortal('admin');
        setActiveTab('admin-dashboard');
      }
    }
  }, [user]);

  // Sync Theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('janseva_theme', theme);
  }, [theme]);

  // Sync Data to localStorage & attempt API sync
  useEffect(() => {
    localStorage.setItem('janseva_grievances', JSON.stringify(grievances));
  }, [grievances]);

  useEffect(() => {
    localStorage.setItem('janseva_applications', JSON.stringify(applications));
  }, [applications]);

  // Fetch live grievances from backend API on mount
  useEffect(() => {
    async function fetchLiveGrievances() {
      try {
        const data = await grievanceAPI.getAll();
        if (data.grievances && data.grievances.length > 0) {
          setGrievances(data.grievances);
        }
      } catch (err) {
        // Fallback to local state if backend is offline
      }
    }
    fetchLiveGrievances();
  }, []);

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

  const handleUpvoteGrievance = (existingTicketId) => {
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

  const handleAddApplication = (newApp) => {
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

  const handleUpdateGrievanceStatus = async (id, status, officerName, note) => {
    try {
      await grievanceAPI.updateStatus(id, { nextStatus: status, officerName, note });
    } catch (e) {}

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

  const isCitizen = user.role === 'CITIZEN';

  return (
    <div className="app-root">
      <div className="app-layout">
        
        {/* Left Navigation Sidebar (Retractable, initially closed) */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={(tab) => navigateTo(tab)}
          activePortal={activePortal}
          setActivePortal={(portal) => navigateTo(activeTab, { portal })}
          openGrievanceModal={() => {
            navigateTo(activeTab, { closeModals: false });
            setShowGrievanceModal(true);
          }}
          onOpenSettings={() => {
            navigateTo(activeTab, { closeModals: false });
            setShowSettingsModal(true);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Application Area */}
        <div className="app-main-wrapper">
          
          {/* Top Navbar Header */}
          <Navbar 
            activeTab={activeTab}
            setActiveTab={(tab) => navigateTo(tab)}
            onNavigate={(tab) => navigateTo(tab)}
            canGoBack={canGoBack}
            onGoBack={handleGoBack}
            previousPageTitle={getPreviousPageTitle()}
            unreadNotifications={notifications.length}
            setShowNotifications={setShowNotifications}
            openGrievanceModal={() => {
              navigateTo(activeTab, { closeModals: false });
              setShowGrievanceModal(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenSettings={() => {
              navigateTo(activeTab, { closeModals: false });
              setShowSettingsModal(true);
            }}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          />

          {/* Real-time Notifications Popover */}
          {showNotifications && (
            <NotificationsDrawer 
              notifications={notifications}
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
          <AdminDashboard 
            grievances={grievances}
            applications={applications}
            departments={DEPARTMENTS}
            onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
            onAssignOfficer={handleUpdateGrievanceStatus}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        ) : (
          /* Citizen View Tabs */
          <>
            {activeTab === 'overview' && (
              <CitizenDashboard 
                grievances={grievances}
                services={INITIAL_SERVICES}
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
              />
            )}

            {activeTab === 'services' && (
              <CitizenDashboard 
                grievances={grievances}
                services={INITIAL_SERVICES}
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
              />
            )}

            {activeTab === 'faqs' && (
              <KnowledgeBase 
                faqs={FAQ_ARTICLES}
                searchQuery={searchQuery}
                onGoBack={handleGoBack}
                canGoBack={canGoBack}
                previousPageTitle={getPreviousPageTitle()}
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
    onTrackTicket={(id) => navigateTo('track', { trackId: id })}
    onOpenGrievanceModal={() => {
      navigateTo(activeTab, { closeModals: false });
      setShowGrievanceModal(true);
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

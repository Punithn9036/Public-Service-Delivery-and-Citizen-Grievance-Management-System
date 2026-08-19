import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CitizenDashboard from './components/CitizenDashboard';
import TrackingView from './components/TrackingView';
import AdminDashboard from './components/AdminDashboard';
import KnowledgeBase from './components/KnowledgeBase';
import GrievanceFormModal from './components/GrievanceFormModal';
import ServiceApplicationModal from './components/ServiceApplicationModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import { AuthProvider } from './context/AuthContext';
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
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('janseva_theme') || 'light');
  
  // Navigation State
  const [activePortal, setActivePortal] = useState('citizen'); // 'citizen' | 'admin'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'track' | 'faqs' | 'admin-dashboard'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');

  // Data State with API + LocalStorage Fallback
  const [grievances, setGrievances] = useState(() => {
    const saved = localStorage.getItem('janseva_grievances');
    return saved ? JSON.parse(saved) : INITIAL_GRIEVANCES;
  });

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('janseva_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
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

  // Modals state
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

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
      // Attempt backend API create
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

  return (
    <div className="app-root">
      
      {/* Top Navbar Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        theme={theme}
        toggleTheme={toggleTheme}
        unreadNotifications={notifications.length}
        setShowNotifications={setShowNotifications}
        openGrievanceModal={() => setShowGrievanceModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Real-time Notifications Popover */}
      {showNotifications && (
        <NotificationsDrawer 
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onClearAll={() => setNotifications([])}
        />
      )}

      {/* Main App Page View Switcher */}
      <main className="main-app-container">
        
        {/* Official / Admin Portal View */}
        {activePortal === 'admin' ? (
          <AdminDashboard 
            grievances={grievances}
            applications={applications}
            departments={DEPARTMENTS}
            onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
            onAssignOfficer={handleUpdateGrievanceStatus}
          />
        ) : (
          /* Citizen View Tabs */
          <>
            {activeTab === 'overview' && (
              <CitizenDashboard 
                grievances={grievances}
                services={INITIAL_SERVICES}
                applications={applications}
                openGrievanceModal={() => setShowGrievanceModal(true)}
                openServiceModal={(service) => setSelectedServiceModal(service)}
                setActiveTab={setActiveTab}
                selectGrievanceToTrack={(id) => setSelectedTrackId(id)}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'services' && (
              <CitizenDashboard 
                grievances={grievances}
                services={INITIAL_SERVICES}
                applications={applications}
                openGrievanceModal={() => setShowGrievanceModal(true)}
                openServiceModal={(service) => setSelectedServiceModal(service)}
                setActiveTab={setActiveTab}
                selectGrievanceToTrack={(id) => setSelectedTrackId(id)}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'track' && (
              <TrackingView 
                grievances={grievances}
                applications={applications}
                selectedTrackId={selectedTrackId}
                onSubmitFeedback={handleSubmitFeedback}
                onReopenGrievance={handleReopenGrievance}
              />
            )}

            {activeTab === 'faqs' && (
              <KnowledgeBase 
                faqs={FAQ_ARTICLES}
                searchQuery={searchQuery}
              />
            )}
          </>
        )}

      </main>

      {/* Grievance Lodge Modal */}
      {showGrievanceModal && (
        <GrievanceFormModal 
          departments={DEPARTMENTS}
          onClose={() => setShowGrievanceModal(false)}
          onSubmitGrievance={handleAddGrievance}
        />
      )}

      {/* Service Application Modal */}
      {selectedServiceModal && (
        <ServiceApplicationModal 
          service={selectedServiceModal}
          onClose={() => setSelectedServiceModal(null)}
          onSubmitApplication={handleAddApplication}
        />
      )}

      {/* Footer */}
      <footer className="footer glass-card" style={{ borderRadius: 0, marginTop: '50px', borderBottom: 0, borderLeft: 0, borderRight: 0 }}>
        <div className="main-app-container flex-between flex-wrap gap-4" style={{ margin: 0, padding: '20px' }}>
          <div>
            <strong style={{ fontFamily: 'var(--font-heading)' }}>JanSeva Public Service & Grievance Governance Portal</strong>
            <p className="small-text text-muted">Ministry of Governance & Administrative Reforms • Government Platform</p>
          </div>
          <div className="flex-align-center gap-3 text-muted small-text">
            <span>24x7 Citizen Helpline: <strong>1800-425-GOV</strong></span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Governance</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

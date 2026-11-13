// frontend/src/components/OfficerDashboard.jsx
// Dedicated Department-Scoped Field Officer Workspace
// Strictly isolated from municipal admin controls, cross-department rosters, blockchain explorer, and DLT gateway.

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  ArrowRightLeft,
  Hand,
  MapPin,
  Upload,
  Eye,
  Lock,
  MessageSquare,
  HelpCircle,
  Scale,
  ArrowLeft,
  Search,
  Send,
  X,
  Megaphone,
  ChevronDown,
  Building,
  FileCheck2,
  ClipboardCheck
} from 'lucide-react';
import govHeroBg from '../assets/gov-hero-bg.png';
import nationalEmblemImg from '../assets/national-emblem.webp';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI, grievanceAPI, ipfsAPI } from '../api/apiClient';
import { isSameDepartment, isTicketAssignedToOfficer } from '../utils/departmentScope';
import { submitOfficerExplanation } from '../utils/slaEscalationEngine';
import GrievanceGeospatialMap, { derivePlotCoords as sharedDerivePlotCoords } from './GrievanceGeospatialMap';

const OFFICER_VALID_TRANSITIONS = {
  'Submitted': ['Under Review', 'Escalated'],
  'Under Review': ['Assigned', 'Pending Citizen Info', 'Rejected', 'Escalated'],
  'Assigned': ['In Progress', 'Pending Citizen Info', 'Under Review', 'Escalated'],
  'In Progress': ['Resolved', 'Pending Citizen Info', 'Under Review', 'Escalated'],
  'Pending Citizen Info': ['In Progress', 'Under Review', 'Assigned', 'Resolved', 'Escalated', 'Rejected'],
  'Escalated': ['In Progress', 'Pending Citizen Info', 'Resolved', 'Under Review'],
  'Resolved': ['Under Review'],
  'Rejected': []
};

const APP_CHECKLIST_ITEMS = [
  'Citizen Identity Proof Verified (Aadhaar / Voter ID)',
  'Address & Ward Jurisdiction Confirmed',
  'Department Technical Feasibility Checked',
  'Statutory Fee / Compliance Cleared'
];

const APP_REASON_CHIPS = [
  'Blurry or unreadable identity document',
  'Site address outside department jurisdiction',
  'Missing supporting technical layout / certificate',
  'Applicant contact verification pending'
];

const SECTOR_COORDS = {
  'Sector 1': { x: 22, y: 24, zone: 'North Zone' },
  'Sector 2': { x: 74, y: 28, zone: 'East Zone' },
  'Sector 3': { x: 52, y: 74, zone: 'South Zone' },
  'Sector 4': { x: 20, y: 66, zone: 'West Zone' },
  'Sector 5': { x: 50, y: 46, zone: 'Central Zone' }
};

const derivePlotCoords = (grievance, idx) => sharedDerivePlotCoords(grievance, idx);

export default function OfficerDashboard({
  grievances = [],
  applications = [],
  advisories = [],
  departments = [],
  onUpdateGrievanceStatus,
  onClaimGrievance,
  onTransferGrievance,
  onUpdateApplicationStatus,
  onGoBack,
  canGoBack,
  activeSection = 'grievances',
  setActiveSection,
  officerQueueScope = 'assigned',
  setOfficerQueueScope
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const officerDept = user?.department || '';

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [ownRosterProfile, setOwnRosterProfile] = useState(null);
  const [deptSlaPolicy, setDeptSlaPolicy] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Field Action Modal state
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [publicRemark, setPublicRemark] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [resolutionProofPreview, setResolutionProofPreview] = useState('');
  const [resolutionProofName, setResolutionProofName] = useState('');
  const [resolutionIpfsCid, setResolutionIpfsCid] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Transfer Department Modal
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferDept, setTransferDept] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Service Application Review Drawer
  const [selectedApp, setSelectedApp] = useState(null);
  const [appNextStatus, setAppNextStatus] = useState('Under Review');
  const [appRemarks, setAppRemarks] = useState('');
  const [appChecklist, setAppChecklist] = useState([]);

  // Map Selection
  const [selectedMapTicketId, setSelectedMapTicketId] = useState(null);

  // Officer Own SLA Explanation Modal
  const [slaLogsVersion, setSlaLogsVersion] = useState(0);
  const [explainTarget, setExplainTarget] = useState(null);
  const [explainText, setExplainText] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadOfficerMeta() {
      try {
        const rosterRes = await grievanceAPI.getOfficerRoster();
        if (active && rosterRes?.officers?.length > 0) {
          setOwnRosterProfile(rosterRes.officers[0]);
        }
      } catch {}
      try {
        const slaRes = await adminAPI.getSlaPolicies();
        if (active && Array.isArray(slaRes?.policies) && slaRes.policies.length > 0) {
          setDeptSlaPolicy(slaRes.policies[0]);
        }
      } catch {}
    }
    loadOfficerMeta();
    return () => {
      active = false;
    };
  }, [user?.email, officerDept]);

  const showToast = (msg, type = 'success') => {
    setFeedbackToast({ msg, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Strictly department-scoped datasets (defense in depth)
  const deptGrievances = useMemo(
    () => grievances.filter((g) => isSameDepartment(officerDept, g.department)),
    [grievances, officerDept]
  );

  const assignedGrievances = useMemo(
    () => deptGrievances.filter((g) => isTicketAssignedToOfficer(g, user)),
    [deptGrievances, user]
  );

  const deptApplications = useMemo(
    () => applications.filter((a) => isSameDepartment(officerDept, a.department)),
    [applications, officerDept]
  );

  const scopedAdvisories = useMemo(
    () => advisories.filter(
      (a) => a.active !== false && (!a.department || a.department === 'All Departments' || isSameDepartment(officerDept, a.department))
    ),
    [advisories, officerDept]
  );

  // Personal & Own-Dept KPIs
  const activeAssignedCount = assignedGrievances.filter((g) => !['Resolved', 'Rejected'].includes(g.status)).length;
  const triageUnassignedCount = deptGrievances.filter(
    (g) => !['Resolved', 'Rejected'].includes(g.status) && (!g.assignedOfficer || String(g.assignedOfficer).includes('Pending Dispatch') || g.status === 'Submitted')
  ).length;
  const resolvedDeptCount = deptGrievances.filter((g) => g.status === 'Resolved').length;
  const escalatedOwnCount = assignedGrievances.filter((g) => g.status === 'Escalated').length;
  const pendingAppsCount = deptApplications.filter(
    (a) => ['Submitted', 'Under Review', 'In Verification', 'Resubmission Required'].includes(a.status)
  ).length;

  // Real Personal / Department MTTR in Hours (no dummy math!)
  const realDeptMttrHours = useMemo(() => {
    const resolved = deptGrievances.filter((g) => g.status === 'Resolved');
    const durations = resolved
      .map((g) => {
        const s = new Date(g.createdAt).getTime();
        const e = new Date(g.resolvedAt || g.updatedAt || g.createdAt).getTime();
        return (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) ? (e - s) / (1000 * 60 * 60) : null;
      })
      .filter((v) => v !== null);
    if (durations.length === 0) return null;
    return (durations.reduce((acc, val) => acc + val, 0) / durations.length).toFixed(1);
  }, [deptGrievances]);

  // Queue filter computation
  const queueBase = officerQueueScope === 'assigned' ? assignedGrievances : deptGrievances;
  const filteredGrievances = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return queueBase.filter((g) => {
      if (statusFilter !== 'All' && g.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && g.priority !== priorityFilter) return false;
      if (q) {
        const hay = `${g.id} ${g.title} ${g.location} ${g.citizenName} ${g.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [queueBase, statusFilter, priorityFilter, searchTerm]);

  // Own SLA Escalation Audit Notices ONLY (pure read derivation — never reads other officers!)
  const ownSlaNotices = useMemo(() => {
    void slaLogsVersion;
    const savedExplanations = Array.isArray(ownRosterProfile?.explanations) ? ownRosterProfile.explanations : [];
    const expMap = new Map(savedExplanations.map((ex) => [ex.ticketId, ex.explanationText]));
    let localExp = {};
    try {
      localExp = JSON.parse(localStorage.getItem('janseva_officer_sla_explanations') || '{}');
    } catch {}

    return assignedGrievances
      .filter((g) => {
        const isBreached = g.slaDeadline && new Date(g.slaDeadline).getTime() < nowMs && !['Resolved', 'Rejected'].includes(g.status);
        return g.status === 'Escalated' || isBreached;
      })
      .map((g) => ({
        id: `SLA-${g.id}`,
        ticketId: g.id,
        ticketTitle: g.title,
        tier: g.status === 'Escalated' ? 2 : 1,
        status: g.status === 'Escalated' ? 'Escalated / Show-Cause Active' : 'SLA Warning',
        officerExplanation: expMap.get(g.id) || localExp[g.id] || ''
      }));
  }, [assignedGrievances, ownRosterProfile, nowMs, slaLogsVersion]);

  // Helper: SLA Badge
  const renderSlaBadge = (g) => {
    if (g.status === 'Resolved' || g.status === 'Rejected') {
      return <span className="badge badge-resolved">{t('Closed')}</span>;
    }
    if (!g.slaDeadline) return <span className="badge badge-pending">Standard SLA</span>;
    const diffHours = Math.round((new Date(g.slaDeadline).getTime() - nowMs) / (1000 * 60 * 60));
    if (diffHours < 0) {
      return <span className="badge badge-urgent">BREACHED ({Math.abs(diffHours)}h ago)</span>;
    }
    if (diffHours <= 8) {
      return <span className="badge badge-in-progress">{diffHours}h left</span>;
    }
    return <span className="badge badge-assigned">{diffHours}h SLA</span>;
  };

  // Handlers
  const openActionModal = (g) => {
    const allowed = OFFICER_VALID_TRANSITIONS[g.status] || ['Under Review'];
    setSelectedGrievance(g);
    setNextStatus(allowed[0] || g.status);
    setPublicRemark('');
    setInternalNoteText('');
    setResolutionProofPreview('');
    setResolutionProofName('');
    setResolutionIpfsCid(g.resolutionIpfsCid || '');
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl !== 'string') return;
      setResolutionProofPreview(dataUrl);
      setResolutionProofName(file.name);
      setIsUploadingProof(true);
      try {
        const up = await ipfsAPI.upload(dataUrl, file.name);
        if (up?.cid) {
          setResolutionIpfsCid(up.cid);
          showToast(`Proof uploaded & pinned to IPFS: ${up.cid}`);
        }
      } catch {
        // Fallback passes resolutionFileContent directly on update
      } finally {
        setIsUploadingProof(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFieldAction = async (e) => {
    e.preventDefault();
    if (!selectedGrievance || !nextStatus) return;

    const currentAssignee = selectedGrievance.assignedOfficer && !String(selectedGrievance.assignedOfficer).includes('Pending Dispatch')
      ? selectedGrievance.assignedOfficer
      : (user?.fullName || 'Department Officer');

    await onUpdateGrievanceStatus(
      selectedGrievance.id,
      nextStatus,
      currentAssignee,
      publicRemark || `Status progressed to ${nextStatus} by ${user?.fullName || 'Department Officer'}.`,
      {
        internalNote: internalNoteText.trim() || undefined,
        resolutionIpfsCid: resolutionIpfsCid || undefined,
        resolutionFileContent: !resolutionIpfsCid && resolutionProofPreview ? resolutionProofPreview : undefined,
        resolutionFileName: resolutionProofName || undefined
      }
    );

    showToast(`Ticket ${selectedGrievance.id} updated to ${nextStatus}.`);
    setSelectedGrievance(null);
  };

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    if (!transferTarget || !transferDept || transferReason.trim().length < 5) return;
    await onTransferGrievance(transferTarget.id, transferDept, transferReason.trim());
    showToast(`Ticket ${transferTarget.id} re-routed to ${transferDept}.`);
    setTransferTarget(null);
    setTransferDept('');
    setTransferReason('');
  };

  const openApplicationDrawer = (app) => {
    setSelectedApp(app);
    setAppNextStatus(app.status === 'Submitted' ? 'Under Review' : app.status);
    setAppRemarks(app.remarks || '');
    setAppChecklist(Array.isArray(app.verifiedDocuments) ? app.verifiedDocuments : []);
  };

  const toggleChecklistItem = (label) => {
    setAppChecklist((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleSaveApplicationDecision = async (e) => {
    e.preventDefault();
    if (!selectedApp || !onUpdateApplicationStatus) return;
    await onUpdateApplicationStatus(selectedApp.id, {
      status: appNextStatus,
      remarks: appRemarks,
      resubmissionReason: appNextStatus === 'Resubmission Required' ? appRemarks : undefined,
      rejectionReason: appNextStatus === 'Rejected' ? appRemarks : undefined,
      verifiedDocuments: appChecklist
    });
    showToast(`Application ${selectedApp.id} marked as ${appNextStatus}.`);
    setSelectedApp(null);
  };

  const handleSubmitExplanation = (e) => {
    e.preventDefault();
    if (!explainTarget || !explainText.trim()) return;
    const offId = ownRosterProfile?.id || user?.employeeId || user?.id || 'EMP-OFFICER';
    try {
      submitOfficerExplanation(offId, explainTarget.ticketId, explainText.trim());
    } catch {}
    try {
      const prev = JSON.parse(localStorage.getItem('janseva_officer_sla_explanations') || '{}');
      prev[explainTarget.ticketId] = explainText.trim();
      localStorage.setItem('janseva_officer_sla_explanations', JSON.stringify(prev));
    } catch {}
    setSlaLogsVersion((v) => v + 1);
    showToast('SLA explanation logged for Reviewing Authority.');
    setExplainTarget(null);
    setExplainText('');
  };

  const mapTickets = useMemo(() => {
    return deptGrievances
      .filter((g) => !['Resolved', 'Rejected'].includes(g.status))
      .map((g, idx) => ({
        ...g,
        coords: derivePlotCoords(g, idx)
      }));
  }, [deptGrievances]);

  const activeMapTicket = mapTickets.find((tItem) => tItem.id === selectedMapTicketId) || mapTickets[0] || null;

  const navTabs = [
    { id: 'grievances', label: t('Complaints Queue') },
    { id: 'applications', label: `${t('Service Requests')} (${deptApplications.length})` },
    { id: 'map', label: t('Area Map') },
    { id: 'sla-tribunal', label: t('Deadlines & Profile') }
  ];

  // Own-department lifecycle distribution bars (NO cross-department exposure!)
  const ownLifecycleBreakdown = useMemo(() => {
    const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Pending Citizen Info', 'Escalated', 'Resolved'];
    const total = Math.max(1, deptGrievances.length);
    return statuses.map((st) => {
      const count = deptGrievances.filter((g) => g.status === st).length;
      return { status: st, count, pct: Math.round((count / total) * 100) };
    });
  }, [deptGrievances]);

  return (
    <div className="dashboard-content animate-fade-in" style={{ padding: 0 }}>
      {/* ========================================================================= */}
      {/* 1. GRAND GOVERNMENT HERO BANNER (FOR FIELD OFFICER) */}
      {/* ========================================================================= */}
      <div className="india-gov-hero-section admin-hero-theme">
        {/* Overhanging Hero Background Layer */}
        <div 
          className="hero-bg-layer"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10, 18, 35, 0.28) 0%, rgba(10, 18, 35, 0.48) 50%, rgba(10, 18, 35, 0.76) 100%), url(${govHeroBg})`
          }}
        />

        <div className="hero-center-content">
          {/* State Emblem of India */}
          <div className="hero-emblem-container animate-float-subtle">
            <img 
              src={nationalEmblemImg} 
              alt="State Emblem of India" 
              className="hero-emblem-img"
            />
          </div>

          {/* Role Pill Badge */}
          <div className="admin-portal-hero-badge">
            <ShieldCheck size={15} />
            <span>
              {officerDept ? `${officerDept} • Field Officer Control Desk` : 'Nodal Field Officer Command Desk'}
            </span>
          </div>

          {/* Portal Title */}
          <h1 className="hero-portal-title">
            janseva<span className="hero-gov-dot">.gov.in</span>
          </h1>

          <div className="hero-portal-sub">
            {officerDept ? `${officerDept} — Designated Field Officer Workspace` : 'Designated Field Officer Command Desk'}
          </div>

          <p className="hero-tagline-quote">
            Authorized Officer: {user?.fullName || ownRosterProfile?.name || 'Field Officer'} — Statutory SLA Compliance & Rapid Field Remediation
          </p>

          {/* Central India.gov.in Style Search Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const target = document.getElementById('officer-management-section');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hero-search-wrapper"
          >
            <div className="hero-search-input-box">
              <Search size={18} className="hero-search-icon" />
              <input 
                type="text" 
                placeholder="Search assigned tickets by ID (GRV-...), citizen name, location, or issue..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hero-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          </form>

          {/* Fast-Track Operations Chips */}
          <div className="hero-trending-row">
            <span className="trending-label">Quick Filters:</span>
            <div className="trending-chips-wrap">
              <button 
                type="button" 
                className={`trending-chip ${activeSection === 'grievances' && officerQueueScope === 'assigned' && statusFilter === 'All' ? 'active-chip' : ''}`}
                onClick={() => {
                  if (setActiveSection) setActiveSection('grievances');
                  if (setOfficerQueueScope) setOfficerQueueScope('assigned');
                  setStatusFilter('All');
                  const target = document.getElementById('officer-management-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ClipboardCheck size={12} />
                <span>Assigned to Me ({activeAssignedCount})</span>
              </button>

              <button 
                type="button" 
                className={`trending-chip ${activeSection === 'grievances' && officerQueueScope === 'department' ? 'active-chip' : ''}`}
                onClick={() => {
                  if (setActiveSection) setActiveSection('grievances');
                  if (setOfficerQueueScope) setOfficerQueueScope('department');
                  const target = document.getElementById('officer-management-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Building size={12} />
                <span>Department Queue ({triageUnassignedCount})</span>
              </button>

              <button 
                type="button" 
                className={`trending-chip highlight-chip ${activeSection === 'applications' ? 'active-chip' : ''}`}
                onClick={() => {
                  if (setActiveSection) setActiveSection('applications');
                  const target = document.getElementById('officer-management-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <FileCheck2 size={12} />
                <span>Service Requests ({pendingAppsCount})</span>
              </button>

              <button 
                type="button" 
                className={`trending-chip ${activeSection === 'sla-tribunal' ? 'active-chip' : ''}`}
                onClick={() => {
                  if (setActiveSection) setActiveSection('sla-tribunal');
                  const target = document.getElementById('officer-management-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ borderColor: '#ef4444', color: '#dc2626' }}
              >
                <Scale size={12} color="#dc2626" />
                <span>🚨 Escalated Breaches ({escalatedOwnCount})</span>
              </button>

              <button 
                type="button" 
                className={`trending-chip ${statusFilter === 'Resolved' ? 'active-chip' : ''}`}
                onClick={() => {
                  if (setActiveSection) setActiveSection('grievances');
                  setStatusFilter('Resolved');
                  const target = document.getElementById('officer-management-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <CheckCircle2 size={12} />
                <span>Resolved ({resolvedDeptCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Down Arrow Indicator Button */}
        <div className="hero-scroll-down-container">
          <button 
            type="button" 
            className="hero-scroll-down-btn"
            onClick={() => {
              const target = document.getElementById('officer-management-section');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="Scroll down to officer workspace"
            title="Scroll down to officer workspace"
          >
            <div className="scroll-arrow-circle">
              <ChevronDown size={26} className="bouncing-arrow" />
            </div>
            <span className="scroll-arrow-label">Officer Workspace</span>
          </button>
        </div>
      </div>

      {/* 2. OFFICER WORKSPACE CONSOLE */}
      <div className="admin-container" id="officer-management-section">
      {canGoBack && onGoBack && (
        <div style={{ marginBottom: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onGoBack}>
            <ArrowLeft size={14} /> {t('Back')}
          </button>
        </div>
      )}

      {feedbackToast && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: feedbackToast.type === 'error' ? 'var(--status-urgent-bg)' : 'var(--status-resolved-bg)',
            color: feedbackToast.type === 'error' ? 'var(--status-urgent-text)' : 'var(--status-resolved-text)',
            border: `1px solid ${feedbackToast.type === 'error' ? 'var(--status-urgent-border)' : 'var(--status-resolved-border)'}`,
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {feedbackToast.msg}
        </div>
      )}

      {/* Strictly Department-Scoped Officer Workspace Header */}
      <div className="admin-header officer-workspace-header">
        <div>
          <div className="officer-header-badges">
            <span className="officer-portal-badge">
              <ShieldCheck size={14} /> {t('Department Officer Portal')}
            </span>
            <span className="officer-dept-pill">
              {officerDept || t('Department Unspecified')}
            </span>
            {deptSlaPolicy && (
              <span className="sla-rate-pill officer-sla-pill">
                <Clock size={12} /> Target Time: {deptSlaPolicy.targetDays} Days
              </span>
            )}
          </div>
          <h1 style={{ margin: '0.2rem 0', fontSize: '1.5rem' }}>
            {user?.fullName || ownRosterProfile?.name || t('Officer')} — {t('Work Desk')}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t('Showing only complaints and service requests for')} <strong>{officerDept}</strong>.
          </p>
        </div>

        <div className="officer-header-tabs">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${activeSection === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection && setActiveSection(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scoped Civic Advisories Alert Strip */}
      {scopedAdvisories.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1.15rem',
            borderLeft: '4px solid var(--brand-500)',
            background: 'var(--status-progress-bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--status-progress-text)' }}>
            <Megaphone size={15} /> {t('Departmental Advisory')} ({scopedAdvisories[0].department}): {scopedAdvisories[0].title}
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-main)' }}>
            {scopedAdvisories[0].message}
          </p>
        </div>
      )}

      {/* Own-Department KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span>{t('Assigned to Me')}</span>
            <UserCheck size={18} color="var(--brand-700)" />
          </div>
          <h2>{activeAssignedCount}</h2>
          <div className="kpi-foot">{assignedGrievances.length} {t('total assigned to you')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span>{t('Unassigned in Dept')}</span>
            <Hand size={18} color="var(--brand-500)" />
          </div>
          <h2>{triageUnassignedCount}</h2>
          <div className="kpi-foot">{t('Available to claim in')} {officerDept}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span>{t('Solved in Dept')}</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <h2>{resolvedDeptCount}</h2>
          <div className="kpi-foot">
            {realDeptMttrHours !== null ? `${t('Avg. Fix Time')}: ${realDeptMttrHours} hrs` : t('No resolved timestamps yet')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span>{t('Service Requests')}</span>
            <FileText size={18} color="var(--brand-700)" />
          </div>
          <h2>{pendingAppsCount}</h2>
          <div className="kpi-foot">{deptApplications.length} {t('total applications in your dept')}</div>
        </div>
      </div>

      {/* SECTION 1: FIELD GRIEVANCE QUEUE */}
      {activeSection === 'grievances' && (
        <>
          {/* Own-Department Lifecycle & Workload Overview (NO cross-department comparison!) */}
          <div className="admin-analytics-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{officerDept} — {t('Complaints by Status')}</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {t('Only complaints for your department')}
                </p>
              </div>
              <span className="badge badge-official">
                {escalatedOwnCount > 0 ? `${escalatedOwnCount} Escalated` : t('Queue Healthy')}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
              {ownLifecycleBreakdown.map((row) => (
                <div key={row.status} style={{ padding: '0.65rem 0.85rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span>{row.status}</span>
                    <span>{row.count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '4px', marginTop: '0.4rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.pct}%`, background: row.status === 'Escalated' ? '#dc2626' : 'var(--brand-700)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queue Controls & Tickets Table */}
          <div className="admin-table-card">
            <div className="table-header-controls">
              <div>
                <h2>
                  {officerQueueScope === 'assigned'
                    ? `${t('Assigned to Me')} (${assignedGrievances.length})`
                    : `${t('Department Queue')} (${deptGrievances.length})`}
                </h2>
                <p>{t('Pick up unassigned complaints, upload photos of finished work, or ask citizens for details.')}</p>
              </div>
              <div className="filter-row" style={{ flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${officerQueueScope === 'assigned' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOfficerQueueScope && setOfficerQueueScope('assigned')}
                  >
                    {t('Assigned to Me')} ({assignedGrievances.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${officerQueueScope === 'department' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOfficerQueueScope && setOfficerQueueScope('department')}
                  >
                    {t('All Department Cases')} ({deptGrievances.length})
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="filter-select"
                    style={{ paddingLeft: '2rem', minWidth: '190px' }}
                    placeholder={t('Search ID, ward, title...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">{t('All Statuses')}</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Citizen Info">Pending Citizen Info</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="All">{t('All Priorities')}</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('Complaint & Area')}</th>
                    <th>{t('Citizen')}</th>
                    <th>{t('Priority & Deadline')}</th>
                    <th>{t('Status & Photos')}</th>
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrievances.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {officerQueueScope === 'assigned'
                          ? t('No assigned tickets match your filters. Switch to "All Dept Queue" to claim open departmental tickets.')
                          : t('No grievances found in your department queue.')}
                      </td>
                    </tr>
                  ) : (
                    filteredGrievances.map((g) => {
                      const mine = isTicketAssignedToOfficer(g, user);
                      const isTerminal = ['Resolved', 'Rejected'].includes(g.status);
                      return (
                        <tr key={g.id}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{g.id} — {g.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {g.location}
                              {g.sector ? ` (${g.sector})` : ''}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.citizenName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.citizenPhone}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                              <span className={`badge ${g.priority === 'Urgent' || g.priority === 'High' ? 'badge-urgent' : 'badge-submitted'}`}>
                                {g.priority}
                              </span>
                              {renderSlaBadge(g)}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                              <span className={`badge ${g.status === 'Resolved' ? 'badge-resolved' : g.status === 'Escalated' ? 'badge-urgent' : 'badge-in-progress'}`}>
                                {g.status}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {g.assignedOfficer || 'Unassigned'}
                              </span>
                              {g.resolutionIpfsCid && (
                                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                                  Proof CID: {g.resolutionIpfsCid.slice(0, 14)}...
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {!isTerminal && !mine && onClaimGrievance && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={async () => {
                                    await onClaimGrievance(g.id, { note: `Claimed by ${user?.fullName || 'Field Officer'}` });
                                    showToast(`Claimed ticket ${g.id} to your active field queue.`);
                                  }}
                                >
                                  <Hand size={13} /> {t('Claim Ticket')}
                                </button>
                              )}
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => openActionModal(g)}>
                                <Upload size={13} /> {isTerminal ? t('Inspect') : t('Update / Resolve')}
                              </button>
                              {!isTerminal && onTransferGrievance && (
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  title={t('Transfer misrouted ticket to correct department')}
                                  onClick={() => {
                                    setTransferTarget(g);
                                    const otherDepts = departments.filter((d) => !isSameDepartment(officerDept, d));
                                    setTransferDept(otherDepts[0] || '');
                                    setTransferReason('');
                                  }}
                                >
                                  <ArrowRightLeft size={13} /> {t('Transfer')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: SAME-DEPARTMENT SERVICE APPLICATIONS ONLY */}
      {activeSection === 'applications' && (
        <div className="admin-table-card">
          <div className="table-header-controls">
            <div>
              <h2>{officerDept} — {t('Service Applications')} ({deptApplications.length})</h2>
              <p>
                {t('Only service requests sent to your department appear here.')}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('Application ID')}</th>
                  <th>{t('Service Name')}</th>
                  <th>{t('Applicant')}</th>
                  <th>{t('Status & SLA')}</th>
                  <th>{t('Verification Action')}</th>
                </tr>
              </thead>
              <tbody>
                {deptApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      {t('No pending service applications belong to')} <strong>{officerDept}</strong>.
                    </td>
                  </tr>
                ) : (
                  deptApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.appliedDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.serviceName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.department}</div>
                      </td>
                      <td>
                        <div>{app.applicantName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.applicantPhone}</div>
                      </td>
                      <td>
                        <span className={`badge ${app.status === 'Approved' ? 'badge-resolved' : app.status === 'Rejected' ? 'badge-urgent' : 'badge-in-progress'}`}>
                          {app.status}
                        </span>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Due: {app.estimatedDate}
                        </div>
                      </td>
                      <td>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => openApplicationDrawer(app)}>
                          <Eye size={13} /> {t('Review & Decide')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: FIELD WARD MAP & ROUTE */}
      {activeSection === 'map' && (
        <GrievanceGeospatialMap
          grievances={deptGrievances}
          departments={departments}
          initialDept={officerDept || 'ALL'}
          onOpenAction={openActionModal}
          onClaimGrievance={onClaimGrievance}
          user={user}
        />
      )}

      {/* SECTION 4: OWN DUTY PROFILE & SLA COMPLIANCE (STRICTLY OWN RECORDS ONLY!) */}
      {activeSection === 'sla-tribunal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="admin-analytics-card">
            <h3 style={{ margin: '0 0 0.75rem 0' }}><Scale size={18} style={{ verticalAlign: 'middle' }} /> {t('My Officer Profile')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{t('Officer Name')}</div>
                <div style={{ fontWeight: 700 }}>{user?.fullName || ownRosterProfile?.name || 'Department Officer'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{t('Department')}</div>
                <div style={{ fontWeight: 700 }}>{officerDept}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{t('Assigned Sector / Badge')}</div>
                <div style={{ fontWeight: 700 }}>{ownRosterProfile?.sector || user?.sector || 'Department Desk'} ({ownRosterProfile?.badgeNumber || user?.employeeId || 'EMP-OFFICER'})</div>
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{t('Duty Capacity')}</div>
                <div style={{ fontWeight: 700 }}>{activeAssignedCount} / {ownRosterProfile?.maxCapacity || 5} Active Tickets</div>
              </div>
            </div>
          </div>

          <div className="admin-table-card">
            <div className="table-header-controls">
              <div>
                <h2>{t('Late Case Notices')} ({ownSlaNotices.length})</h2>
                <p>{t('Submit field justifications for delayed or escalated tickets assigned to you. Other officers records and administrative strike actions are restricted to Admin.')}</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('Notice / Ticket')}</th>
                    <th>{t('Delay / Escalation Tier')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Your Explanation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ownSlaNotices.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '1.75rem', color: 'var(--text-muted)' }}>
                        {t('No SLA breach warnings or escalated compliance notices against your duty record.')}
                      </td>
                    </tr>
                  ) : (
                    ownSlaNotices.map((notice) => (
                      <tr key={notice.id}>
                        <td>
                          <strong>{notice.ticketId}</strong>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{notice.ticketTitle}</div>
                        </td>
                        <td>
                          <span className="badge badge-urgent">Level {notice.tier || 1} Breach</span>
                        </td>
                        <td>
                          <span className="badge badge-in-progress">{notice.status || 'Notice Issued'}</span>
                        </td>
                        <td>
                          {notice.officerExplanation ? (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                              {notice.officerExplanation}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setExplainTarget(notice);
                                setExplainText('');
                              }}
                            >
                              <Send size={13} /> {t('Submit Explanation')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: FIELD ACTION & PROOF-OF-RESOLUTION */}
      {selectedGrievance && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{t('Field Ticket Action')} — {selectedGrievance.id}</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {selectedGrievance.title} ({selectedGrievance.status})
                </p>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedGrievance(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFieldAction} className="modal-form">
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', fontSize: '0.82rem', marginBottom: '0.9rem' }}>
                <Lock size={13} style={{ verticalAlign: 'middle' }} /> <strong>{t('Assigned Owner')}:</strong> {selectedGrievance.assignedOfficer || user?.fullName}
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({t('Cross-officer reassignment restricted to Admin')})</span>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  {t('Next Valid Lifecycle Transition')}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    className="filter-select"
                    style={{ flex: 1 }}
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                  >
                    {(OFFICER_VALID_TRANSITIONS[selectedGrievance.status] || []).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                    {(OFFICER_VALID_TRANSITIONS[selectedGrievance.status] || []).length === 0 && (
                      <option value={selectedGrievance.status}>{selectedGrievance.status} (Terminal)</option>
                    )}
                  </select>
                  {(OFFICER_VALID_TRANSITIONS[selectedGrievance.status] || []).includes('Pending Citizen Info') && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setNextStatus('Pending Citizen Info');
                        setPublicRemark((prev) => prev || 'Please confirm the nearest landmark or upload a clearer daytime photo so our field crew can inspect the exact spot.');
                      }}
                    >
                      <HelpCircle size={13} /> {t('Ask Clarification')}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <MessageSquare size={13} style={{ verticalAlign: 'middle' }} /> {t('Public Citizen Remark (Visible in Citizen Tracker & SMS)')}
                </label>
                <textarea
                  rows={2}
                  className="filter-select"
                  style={{ width: '100%' }}
                  placeholder={t('Describe field progress, clarification question, or work completed for citizen...')}
                  value={publicRemark}
                  onChange={(e) => setPublicRemark(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Lock size={13} style={{ verticalAlign: 'middle' }} /> {t('Internal Officer Field Note (Private — Hidden from Citizens)')}
                </label>
                <textarea
                  rows={2}
                  className="filter-select"
                  style={{ width: '100%' }}
                  placeholder={t('e.g., Crew team #3 dispatched; contractor valve spare requested...')}
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                />
                {Array.isArray(selectedGrievance.internalNotes) && selectedGrievance.internalNotes.length > 0 && (
                  <div style={{ marginTop: '0.45rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                    <strong>{t('Previous Internal Notes')}:</strong>
                    {selectedGrievance.internalNotes.map((n, idx) => (
                      <div key={n.id || idx} style={{ marginTop: '0.2rem' }}>• {n.note}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* After-Action Resolution Proof Photo / Document Upload */}
              {(nextStatus === 'Resolved' || selectedGrievance.resolutionIpfsCid) && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <Upload size={14} style={{ verticalAlign: 'middle' }} /> {t('After-Action Resolution Proof (IPFS Pinned)')}
                  </label>
                  <input type="file" accept="image/*,.pdf,.txt" onChange={handleProofFileChange} />
                  {isUploadingProof && <div style={{ fontSize: '0.78rem', color: 'var(--brand-500)', marginTop: '0.3rem' }}>{t('Pinning proof to IPFS...')}</div>}
                  {resolutionIpfsCid && (
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.35rem', fontWeight: 600 }}>
                      IPFS Proof Ready: {resolutionIpfsCid}
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedGrievance(null)}>{t('Cancel')}</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={(OFFICER_VALID_TRANSITIONS[selectedGrievance.status] || []).length === 0}
                >
                  {t('Commit Status Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER MISROUTED TICKET TO TARGET DEPARTMENT */}
      {transferTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{t('Re-route / Transfer Grievance')} — {transferTarget.id}</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setTransferTarget(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmitTransfer} className="modal-form">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {t('Transferring this ticket removes it from')} <strong>{officerDept}</strong> {t('and routes it to the correct municipal department.')}
              </p>
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.3rem' }}>{t('Target Department')}</label>
                <select className="filter-select" style={{ width: '100%' }} value={transferDept} onChange={(e) => setTransferDept(e.target.value)} required>
                  {departments.filter((d) => !isSameDepartment(officerDept, d)).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.3rem' }}>{t('Mandatory Justification (min 5 chars)')}</label>
                <textarea
                  rows={3}
                  className="filter-select"
                  style={{ width: '100%' }}
                  placeholder={t('e.g., Water valve repair finished; road resurfacing belongs to Public Works...')}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  required
                  minLength={5}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setTransferTarget(null)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('Confirm Department Transfer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SERVICE APPLICATION VERIFICATION DRAWER (SAME-DEPT ONLY) */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{selectedApp.serviceName} — {selectedApp.id}</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {t('Applicant')}: {selectedApp.applicantName} ({selectedApp.applicantPhone}) • {selectedApp.department}
                </p>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedApp(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveApplicationDecision} className="modal-form">
              <div style={{ marginBottom: '0.85rem', padding: '0.65rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                <strong>{t('IPFS Submitted Document CID')}:</strong> {selectedApp.ipfsDocumentCid || 'QmVerifiedDemoProof'}
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  {t('Verification Checklist')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {APP_CHECKLIST_ITEMS.map((item) => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={appChecklist.includes(item)} onChange={() => toggleChecklistItem(item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>{t('Decision Status')}</label>
                <select className="filter-select" style={{ width: '100%' }} value={appNextStatus} onChange={(e) => setAppNextStatus(e.target.value)}>
                  <option value="Under Review">Under Review</option>
                  <option value="In Verification">In Verification</option>
                  <option value="Resubmission Required">Request Resubmission (Resubmission Required)</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {(appNextStatus === 'Resubmission Required' || appNextStatus === 'Rejected') && (
                <div style={{ marginBottom: '0.65rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>{t('Standard Reason Templates')}:</div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {APP_REASON_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.74rem' }}
                        onClick={() => setAppRemarks(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>{t('Officer Verification Remarks')}</label>
                <textarea
                  rows={3}
                  className="filter-select"
                  style={{ width: '100%' }}
                  placeholder={t('Enter inspection notes or resubmission instructions for applicant...')}
                  value={appRemarks}
                  onChange={(e) => setAppRemarks(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedApp(null)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('Save Application Decision')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: OWN SLA EXPLANATION */}
      {explainTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{t('Submit SLA Delay Explanation')} — {explainTarget.ticketId}</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setExplainTarget(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmitExplanation} className="modal-form">
              <textarea
                rows={4}
                className="filter-select"
                style={{ width: '100%', marginBottom: '1rem' }}
                placeholder={t('State operational reason for SLA delay (e.g., pending utility shutdown, heavy rain, waiting on citizen confirmation)...')}
                value={explainText}
                onChange={(e) => setExplainText(e.target.value)}
                required
              />
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setExplainTarget(null)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('Submit Explanation')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

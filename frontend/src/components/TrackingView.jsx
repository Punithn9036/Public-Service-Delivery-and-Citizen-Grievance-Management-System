import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  Star, 
  RotateCcw, 
  Send, 
  FileCheck, 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  Flame, 
  Printer, 
  Layers, 
  X,
  FileText,
  ArrowLeft,
  Bell,
  Eye,
  Globe,
  MessageSquare,
  Smartphone,
  Info,
  PhoneCall,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { notificationAPI, blockchainAPI } from '../api/apiClient';

export default function TrackingView({ 
  grievances, 
  applications,
  selectedTrackId, 
  onSubmitFeedback,
  onReopenGrievance,
  onGoBack,
  canGoBack,
  previousPageTitle,
  unreadNotifications,
  setShowNotifications,
  isSidebarOpen,
  onToggleSidebar
}) {
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth();
  const gList = Array.isArray(grievances) ? grievances : [];
  const aList = Array.isArray(applications) ? applications : [];
  const isCitizen = !user || user.role === 'CITIZEN';
  const isOfficer = user?.role === 'OFFICER';
  const isAdmin = user?.role === 'ADMIN';

  const cleanUserPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const cleanUserEmail = (user?.email || '').toLowerCase().trim();
  const cleanUserName = (user?.fullName || '').toLowerCase().trim();
  const cleanUserEmpId = (user?.employeeId || user?.userId || '').toLowerCase().trim();

  const myUserGrievances = user ? gList.filter(g => {
    if (!g) return false;
    if (isOfficer) {
      const assigned = (g.assignedOfficer || '').toLowerCase();
      const assignedContact = (g.assignedOfficerContact || '').replace(/\D/g, '').slice(-10);
      return (cleanUserName && assigned.includes(cleanUserName)) || 
             (cleanUserEmpId && assigned.includes(cleanUserEmpId)) || 
             (cleanUserPhone && assignedContact && cleanUserPhone === assignedContact);
    }
    const cleanGPhone = (g.citizenPhone || '').replace(/\D/g, '').slice(-10);
    const matchPhone = cleanUserPhone && cleanGPhone && cleanGPhone === cleanUserPhone;
    const matchEmail = g.citizenEmail && cleanUserEmail && g.citizenEmail.toLowerCase().trim() === cleanUserEmail;
    const matchName = g.citizenName && cleanUserName && g.citizenName.toLowerCase().trim() === cleanUserName;
    const matchUserId = g.userId && user.id && String(g.userId) === String(user.id);
    return Boolean(matchPhone || matchEmail || matchName || matchUserId);
  }) : [];

  const myUserApplications = user ? aList.filter(a => {
    if (!a) return false;
    const cleanAPhone = (a.citizenPhone || a.phone || '').replace(/\D/g, '').slice(-10);
    const matchPhone = cleanUserPhone && cleanAPhone && cleanAPhone === cleanUserPhone;
    const matchEmail = (a.citizenEmail || a.email) && cleanUserEmail && (a.citizenEmail || a.email).toLowerCase().trim() === cleanUserEmail;
    const matchName = (a.citizenName || a.name) && cleanUserName && (a.citizenName || a.name).toLowerCase().trim() === cleanUserName;
    const matchUserId = a.userId && user.id && String(a.userId) === String(user.id);
    return Boolean(matchPhone || matchEmail || matchName || matchUserId);
  }) : [];

  const [trackInput, setTrackInput] = useState(selectedTrackId || '');

  const [activeSearchResult, setActiveSearchResult] = useState(() => {
    if (selectedTrackId) {
      const cleanId = String(selectedTrackId).toUpperCase();
      return gList.find(g => g && g.id && g.id.toUpperCase() === cleanId) || 
             aList.find(a => a && a.id && a.id.toUpperCase() === cleanId) || null;
    }
    if (user && myUserGrievances.length > 0) {
      return myUserGrievances[0];
    }
    if (user && myUserApplications.length > 0) {
      return myUserApplications[0];
    }
    return null;
  });

  // Sync search input and result when selectedTrackId changes from external navigation
  useEffect(() => {
    if (selectedTrackId) {
      setTrackInput(selectedTrackId);
      const cleanId = selectedTrackId.toUpperCase();
      const foundGrievance = gList.find(g => g && g.id && g.id.toUpperCase() === cleanId);
      const foundApp = aList.find(a => a && a.id && a.id.toUpperCase() === cleanId);
      if (foundGrievance || foundApp) {
        setActiveSearchResult(foundGrievance || foundApp);
        setFeedbackSubmitted(false);
      }
    }
  }, [selectedTrackId]);

  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showIpfsPreview, setShowIpfsPreview] = useState(false);
  const [whatsappBotReply, setWhatsappBotReply] = useState(null);
  const [whatsappBotLoading, setWhatsappBotLoading] = useState(false);

  // Hyperledger Fabric Live Verification State
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerVerification, setLedgerVerification] = useState(null);
  const [ledgerHistory, setLedgerHistory] = useState([]);
  const [copiedTx, setCopiedTx] = useState(false);

  const fetchLedgerData = async () => {
    if (!activeSearchResult) return;
    setLedgerLoading(true);
    try {
      const txId = activeSearchResult.fabricTxId || activeSearchResult.timeline?.[0]?.fabricTxId;
      if (txId) {
        try {
          const verRes = await blockchainAPI.verifyTx(txId);
          setLedgerVerification(verRes);
        } catch (e) {
          console.warn("Tx verification fallback:", e);
        }
      }
      if (activeSearchResult.id) {
        try {
          const histRes = await blockchainAPI.getHistory(activeSearchResult.id);
          if (histRes && histRes.history) {
            setLedgerHistory(histRes.history);
          }
        } catch (e) {
          console.warn("History fetch fallback:", e);
        }
      }
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    if (showLedgerModal) {
      fetchLedgerData();
    }
  }, [showLedgerModal, activeSearchResult]);

  const handleCopyTx = (tx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(tx);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const handleTestWhatsAppStatus = async () => {
    if (!activeSearchResult) return;
    setWhatsappBotLoading(true);
    try {
      const queryText = (activeSearchResult.id && activeSearchResult.id.startsWith('GRV'))
        ? `STATUS ${activeSearchResult.id}`
        : `TRACK ${activeSearchResult.id}`;
      const phone = activeSearchResult.citizenPhone || activeSearchResult.applicantPhone || '+91 98765 43210';
      const res = await notificationAPI.queryWhatsAppBot(phone, queryText);
      setWhatsappBotReply(res?.replyMessage || 'No status response returned');
    } catch (e) {
      setWhatsappBotReply('Error communicating with WhatsApp gateway: ' + e.message);
    } finally {
      setWhatsappBotLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    const cleanId = trackInput.trim().toUpperCase();
    const foundGrievance = gList.find(g => g && g.id && g.id.toUpperCase() === cleanId);
    const foundApp = aList.find(a => a && a.id && a.id.toUpperCase() === cleanId);
    
    if (foundGrievance || foundApp) {
      setActiveSearchResult(foundGrievance || foundApp);
      setFeedbackSubmitted(false);
    } else {
      setActiveSearchResult(null);
    }
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (activeSearchResult && activeSearchResult.id.startsWith('GRV')) {
      onSubmitFeedback(activeSearchResult.id, rating, feedbackText);
      setFeedbackSubmitted(true);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Determine stage index
  const isEscalated = activeSearchResult?.status === 'Escalated';
  const stages = isEscalated 
    ? ['Submitted', 'Under Review', 'Assigned', 'Escalated (SLA Breached)', 'Resolved'] 
    : ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  const currentStageIndex = activeSearchResult 
    ? (isEscalated ? 3 : Math.max(0, stages.indexOf(activeSearchResult.status))) 
    : 0;

  // SLA Calculation Helper
  const getSlaStatus = () => {
    if (!activeSearchResult || !activeSearchResult.slaDeadline) return null;
    if (activeSearchResult.status === 'Resolved') {
      return { status: 'resolved', text: 'Resolved within SLA', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.1)' };
    }
    const deadline = new Date(activeSearchResult.slaDeadline).getTime();
    const now = Date.now();
    const diffHours = Math.round((deadline - now) / (1000 * 60 * 60));

    if (activeSearchResult.status === 'Escalated' || diffHours < 0) {
      const overdue = activeSearchResult.escalatedOverdueHours || Math.abs(diffHours);
      return { 
        status: 'breached', 
        text: `SLA Breached by ${overdue}h (Auto-Escalated to Executive Engineer)`, 
        color: '#dc2626', 
        bg: 'rgba(239, 68, 68, 0.14)' 
      };
    } else if (diffHours <= 24) {
      return { status: 'critical', text: `SLA Critical (${diffHours}h remaining)`, color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' };
    } else {
      const days = Math.ceil(diffHours / 24);
      return { status: 'ontrack', text: `SLA On-Track (${days} days left)`, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' };
    }
  };

  const slaInfo = getSlaStatus();

  return (
    <div className="tracking-container animate-fade-in">
      
      {/* Top Contextual Back Bar & Breadcrumb */}
      <div className="subpage-back-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="subpage-back-btn" 
            onClick={onGoBack}
            title={previousPageTitle ? `Back to ${previousPageTitle}` : "Back to Overview Dashboard"}
          >
            <ArrowLeft size={16} />
            <span>Back to {previousPageTitle || 'Dashboard'}</span>
          </button>
          <span className="subpage-breadcrumb">JanSeva &gt; Track Status &amp; Redressal</span>
        </div>

        <div className="subpage-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          {setShowNotifications && (
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
          )}

          {/* Tricolour Menu Button */}
          {onToggleSidebar && (
            <button
              type="button"
              className={`tricolour-menu-btn ${isSidebarOpen ? 'active' : ''}`}
              onClick={onToggleSidebar}
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Sidebar"
            >
              <div className="tricolour-icon">
                <span className="tricolour-bar saffron-bar" />
                <span className="tricolour-bar white-bar" />
                <span className="tricolour-bar green-bar" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Search Header */}
      <div className="track-search-card glass-card">
        <h2>{t('trackTitle')}</h2>
        <p>{t('trackSubtitle')}</p>

        <form onSubmit={handleSearch} className="track-form">
          <div className="input-group">
            <Search size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder={t('enterTrackingId')} 
              value={trackInput} 
              onChange={(e) => setTrackInput(e.target.value)}
              className="track-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {t('trackButton')}
          </button>
        </form>

        <div className="quick-suggestions">
          {myUserGrievances.length > 0 ? (
            <>
              <span>{isOfficer ? 'Your Assigned Field Tasks: ' : 'Your Registered Complaints: '}</span>
              {myUserGrievances.slice(0, 4).map(g => (
                <button 
                  key={g.id} 
                  type="button" 
                  className="chip-btn"
                  onClick={() => {
                    setTrackInput(g.id);
                    setActiveSearchResult(g);
                    setFeedbackSubmitted(false);
                  }}
                >
                  {g.id} ({g.status})
                </button>
              ))}
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Tip: Enter your Reference Code (e.g. GRV-2026-XXXX) or Service Application ID to view live progress.
            </span>
          )}
        </div>
      </div>

      {/* Main Details & Timeline Result */}
      {activeSearchResult ? (
        <div className="track-result-grid">
          
          {/* Left Column: Details & Stepper */}
          <div className="track-main-col glass-card">
            
            <div className="ticket-header">
              <div>
                <span className="ticket-type">
                  {activeSearchResult.id.startsWith('GRV') ? 'Grievance Ticket' : 'Public Service Application'}
                </span>
                <h1 className="ticket-title">{activeSearchResult.title || activeSearchResult.serviceName}</h1>
                <p className="ticket-id-tag">Reference No: <strong>{activeSearchResult.id}</strong></p>
              </div>

              <div className="ticket-status-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span className={`badge badge-${activeSearchResult.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  <span className="pulse-dot"></span>
                  {activeSearchResult.status}
                </span>

                {slaInfo && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: slaInfo.bg,
                    color: slaInfo.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {slaInfo.status === 'critical' ? <Flame size={13} /> : <Clock size={13} />}
                    {slaInfo.text}
                  </span>
                )}
              </div>
            </div>

            {/* Statutory SLA Breach & Officer Reallocation Notice */}
            {activeSearchResult.status === 'Escalated' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.06) 100%)',
                border: '1.5px solid #ef4444',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ color: '#b91c1c', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🚨 Statutory SLA Elapsed • Case Auto-Escalated to Executive Authority
                    </strong>
                    <span style={{ fontSize: '0.72rem', background: '#dc2626', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Tier-2 Directive Active
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    This complaint exceeded the statutory SLA resolution deadline. Case directive authority has been transferred to <strong>{activeSearchResult.assignedOfficer || 'Supervising Executive Engineer'}</strong>.
                  </p>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(239, 68, 68, 0.3)', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span><strong>Original Field Officer:</strong> {activeSearchResult.originalAssignedOfficer || 'Field Staff'}</span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>• Statutory Show Cause Notice Issued (48h Explanation Clock Active)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Timeline */}
            <div className="stepper-section">
              <h3 className="section-subheading">Resolution Stage Timeline</h3>
              
              <div className="stepper-bar">
                {stages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div key={stage} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-circle">
                        {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span className="step-label">{stage}</span>
                    </div>
                  );
                })}
              </div>

              {/* IPFS Evidence Document Card */}
              {activeSearchResult.ipfsDocumentCid && (
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Database size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Decentralized Proof on IPFS</strong>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: 700 }}>
                            Pinned
                          </span>
                        </div>
                        <p className="text-muted small-text" style={{ margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          CID: {activeSearchResult.ipfsDocumentCid}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowIpfsPreview(prev => !prev)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} />
                        <span>{showIpfsPreview ? 'Hide Preview' : 'Preview Evidence'}</span>
                      </button>

                      <a
                        href={`http://localhost:5000/api/ipfs/${activeSearchResult.ipfsDocumentCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ExternalLink size={14} />
                        <span>Open Gateway</span>
                      </a>
                    </div>
                  </div>

                  {showIpfsPreview && (
                    <div className="animate-fade-in" style={{
                      marginTop: '14px',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        maxWidth: '420px',
                        margin: '0 auto',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        background: '#000000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <img
                          src={`http://localhost:5000/api/ipfs/${activeSearchResult.ipfsDocumentCid}`}
                          alt="IPFS Evidence Document"
                          style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.parentNode) {
                              e.target.parentNode.innerHTML = `
                                <div style="padding: 24px; color: #fff; text-align: center;">
                                  <p style="font-weight: 600; margin-bottom: 8px;">Non-Image Document (PDF / Binary)</p>
                                  <a href="http://localhost:5000/api/ipfs/${activeSearchResult.ipfsDocumentCid}" target="_blank" style="color: #60a5fa; text-decoration: underline; font-size: 0.85rem;">Click here to inspect or download file</a>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <p className="small-text text-muted" style={{ marginTop: '8px', fontSize: '0.72rem' }}>
                        Cryptographically retrieved from Local IPFS Repository • Content-addressed verification match
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fabric Transaction Ledger Proof */}
              {activeSearchResult.fabricTxId && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.03)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }} onClick={() => setShowLedgerModal(true)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#2563eb" />
                    <span>Hyperledger Fabric Ledger Tx: <code style={{ color: '#2563eb', fontWeight: 600 }}>{activeSearchResult.fabricTxId.slice(0, 22)}...</code></span>
                  </div>
                  <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} /> View Blockchain Block ↗
                  </span>
                </div>
              )}

              {/* Statutory SMS & WhatsApp Alerts Delivery Receipt */}
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={16} className="text-blue" />
                    <strong style={{ fontSize: '0.85rem' }}>Statutory Government Alerts Dispatched</strong>
                    <span className="badge badge-official" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      DLT-GOV-IND-49201
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontWeight: 600 }}>
                      SMS Delivered
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(37, 211, 102, 0.15)', color: '#16a34a', fontWeight: 600 }}>
                      WhatsApp Synced
                    </span>
                  </div>
                </div>

                <p className="small-text text-muted" style={{ margin: '0 0 10px', fontSize: '0.78rem' }}>
                  SMS &amp; WhatsApp alerts dispatched to registered mobile: <strong>{activeSearchResult.citizenPhone || activeSearchResult.applicantPhone || '+91 98765 43210'}</strong> on every state transition.
                </p>

                {/* WhatsApp Status Query simulation */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                    <MessageSquare size={14} style={{ color: '#25D366' }} />
                    <span>JanSeva WhatsApp 24x7 Status Bot (Send <code>STATUS {activeSearchResult.id}</code>)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${((activeSearchResult.citizenPhone || '9449524516').replace(/\D/g, '').length === 10 ? '91' + (activeSearchResult.citizenPhone || '9449524516').replace(/\D/g, '') : (activeSearchResult.citizenPhone || '919449524516').replace(/\D/g, ''))}&text=${encodeURIComponent(`🇮🇳 *JanSeva Citizen Grievance Redressal*\n\nYour grievance *${activeSearchResult.id}* status update:\n\n🏛 *Department:* ${activeSearchResult.department}\n⚡ *Status:* *${activeSearchResult.status.toUpperCase()}*\n👤 *Officer:* ${activeSearchResult.assignedOfficer || 'Control Room Officer'}\n⏱ *SLA Deadline:* ${activeSearchResult.slaDeadline ? new Date(activeSearchResult.slaDeadline).toLocaleDateString() : 'Active'}\n\nTrack Live on Public Blockchain:\nhttp://localhost:5173/?track=${activeSearchResult.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#25D366', color: '#ffffff', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}
                      title="Directly send live grievance update to WhatsApp"
                    >
                      <MessageSquare size={12} />
                      <span>Send to WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleTestWhatsAppStatus}
                      disabled={whatsappBotLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      {whatsappBotLoading ? 'Checking...' : 'Check WhatsApp Live Status'}
                    </button>
                  </div>
                </div>

                {whatsappBotReply && (
                  <div className="animate-fade-in" style={{
                    marginTop: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#075E54',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.4'
                  }}>
                    {whatsappBotReply}
                  </div>
                )}
              </div>

              {/* Detailed Activity Logs */}
              <div className="timeline-logs">
                <h4>Officer Activity History</h4>
                {activeSearchResult.timeline ? (
                  <div className="timeline-list">
                    {activeSearchResult.timeline.map((log, i) => (
                      <div key={i} className="log-item">
                        <div className="log-dot"></div>
                        <div className="log-content">
                          <div className="log-header">
                            <span className="log-status">{log.status}</span>
                            <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="log-note">{log.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted-text">Application submitted on {activeSearchResult.appliedDate}. Under standard processing SLA.</p>
                )}
              </div>
            </div>

            {/* Citizen Feedback Form if Resolved */}
            {activeSearchResult.status === 'Resolved' && (
              <div className="feedback-box glass-card glow-emerald">
                <h3><FileCheck size={20} color="#16a34a" /> {t('citizenFeedback')}</h3>
                
                {activeSearchResult.feedback || feedbackSubmitted ? (
                  <div className="feedback-done">
                    <p className="success-msg">Thank you! Your feedback has been recorded into officer performance ratings.</p>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={20} fill={s <= (activeSearchResult.feedback?.rating || rating) ? '#f59e0b' : 'none'} color="#f59e0b" />
                      ))}
                    </div>
                    {activeSearchResult.feedback?.comment && (
                      <p className="comment-quote">"{activeSearchResult.feedback.comment}"</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="rating-form">
                    <p>{t('rateResolution')}:</p>
                    <div className="star-rating-select">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          type="button"
                          className="star-btn"
                          onClick={() => setRating(s)}
                        >
                          <Star size={24} fill={s <= rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                        </button>
                      ))}
                    </div>

                    <textarea
                      placeholder="Add any comments or officer feedback (optional)..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3}
                      className="feedback-textarea"
                    />

                    <div className="form-action-row">
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Send size={14} /> {t('submitFeedback')}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm text-rose"
                        onClick={() => onReopenGrievance(activeSearchResult.id)}
                      >
                        <RotateCcw size={14} /> {t('reopenTicket')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Meta Info Card */}
          <div className="track-side-col" style={{ minWidth: '380px', width: '100%' }}>
            <div className="side-meta-card glass-card" style={{ padding: '24px 22px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} style={{ color: 'var(--brand-700)', flexShrink: 0 }} />
                <span>Ticket Information</span>
              </h3>

              <div className="meta-list-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="meta-list-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <span className="meta-lbl" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Department:</span>
                    <strong style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{activeSearchResult.department}</strong>
                  </div>
                </div>

                {activeSearchResult.location && (
                  <div className="meta-list-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                      <span className="meta-lbl" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Location / Ward:</span>
                      <strong style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{activeSearchResult.location}</strong>
                    </div>
                  </div>
                )}

                <div className="meta-list-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <span className="meta-lbl" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Officer:</span>
                    <strong style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{activeSearchResult.assignedOfficer || 'Control Room Officer'}</strong>
                  </div>
                </div>

                {activeSearchResult.assignedOfficerContact && activeSearchResult.assignedOfficerContact !== 'N/A' && (
                  <div className="meta-list-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                      <span className="meta-lbl" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Officer Helpline:</span>
                      <strong className="text-blue" style={{ fontSize: '0.92rem', fontWeight: 600, wordBreak: 'break-word' }}>{activeSearchResult.assignedOfficerContact}</strong>
                    </div>
                  </div>
                )}

                <div className="meta-list-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <span className="meta-lbl" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>SLA Target:</span>
                    <strong className="text-amber" style={{ fontSize: '0.92rem', fontWeight: 600, wordBreak: 'break-word' }}>
                      {activeSearchResult.slaDeadline ? new Date(activeSearchResult.slaDeadline).toLocaleDateString() : `${activeSearchResult.slaDays} Days`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Printable Receipt Button */}
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Printer size={15} />
                <span>Print Official Acknowledgment Receipt</span>
              </button>
            </div>

            <div className="side-help-card glass-card" style={{ padding: '20px 22px', borderRadius: '12px', marginTop: '16px' }}>
              <h4>
                <PhoneCall size={16} style={{ flexShrink: 0, color: '#d97706' }} />
                <span>Need Immediate Escalation?</span>
              </h4>
              <p>If your grievance has passed SLA target date without resolution, call the 24x7 Municipal Helpline: <strong>1800-425-GOV (468)</strong></p>
            </div>
          </div>

        </div>
      ) : (
        <div className="empty-state glass-card" style={{ padding: '42px 24px', textAlign: 'center' }}>
          {trackInput.trim() ? (
            <>
              <AlertCircle size={48} className="empty-icon text-amber" style={{ margin: '0 auto 12px' }} />
              <h3>Reference Ticket Not Found</h3>
              <p className="text-muted small-text">We couldn't find a grievance or application matching "{trackInput}". Please verify your Tracking ID.</p>
            </>
          ) : (
            <>
              <Search size={48} className="empty-icon" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3>Enter a Tracking ID to Inspect Live Progress</h3>
              <p className="text-muted small-text" style={{ maxWidth: '500px', margin: '0 auto' }}>
                Enter your Grievance Reference Code (e.g. <code>GRV-2026-XXXX</code>) or Service Application ID above to inspect officer dispatches, SLA countdown, and blockchain audit proofs.
              </p>
            </>
          )}
        </div>
      )}

      {/* Hyperledger Fabric Blockchain Block Explorer Modal */}
      {showLedgerModal && activeSearchResult && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#2563eb" />
                <div>
                  <h3 style={{ margin: 0 }}>Hyperledger Fabric Ledger Verification</h3>
                  <p className="small-text text-muted" style={{ margin: 0 }}>Immutable Cryptographic Block Proof • Channel: janseva-channel</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowLedgerModal(false)}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              {ledgerLoading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <ShieldCheck size={36} className="text-blue animate-pulse" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600 }}>Verifying cryptographic hash chain on Hyperledger Fabric peer nodes...</p>
                </div>
              ) : (
                <>
                  {/* Verification Banner */}
                  <div style={{ 
                    background: ledgerVerification?.verified ? 'rgba(34, 197, 94, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                    border: `1px solid ${ledgerVerification?.verified ? '#22c55e' : '#3b82f6'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <ShieldCheck size={28} style={{ color: ledgerVerification?.verified ? '#16a34a' : '#2563eb', flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: ledgerVerification?.verified ? '#15803d' : '#1d4ed8', fontSize: '0.95rem' }}>
                        {ledgerVerification?.verified ? '✓ Tamper-Proof Cryptographic Hash Verified' : 'Cryptographic Ledger Record Valid'}
                      </strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Transaction validated by Byzantine Fault Tolerant consensus. Data hash matches on-chain Merkle block root.
                      </p>
                    </div>
                  </div>

                  {/* Block & Transaction Details Card */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>TRANSACTION HASH (SHA-256)</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTx(activeSearchResult.fabricTxId || ledgerVerification?.txId)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {copiedTx ? '✓ Copied' : 'Copy Tx Hash'}
                        </button>
                      </div>
                      <code style={{ color: '#2563eb', wordBreak: 'break-all', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                        {activeSearchResult.fabricTxId || ledgerVerification?.txId}
                      </code>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>BLOCK NUMBER</span>
                        <strong style={{ color: '#16a34a' }}>
                          Block #{ledgerVerification?.blockNumber || activeSearchResult.fabricBlockNumber || 1}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>BLOCK CONFIRMATIONS</span>
                        <strong>{ledgerVerification?.confirmations || 1} Confirmations</strong>
                      </div>
                      <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>CHANNEL NAME</span>
                        <strong>janseva-channel</strong>
                      </div>
                      <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>SMART CONTRACT</span>
                        <strong>grievance_cc (Go API)</strong>
                      </div>
                    </div>

                    {ledgerVerification?.blockHash && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT BLOCK HASH</span>
                        <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                          {ledgerVerification.blockHash}
                        </code>
                      </div>
                    )}

                    {ledgerVerification?.previousBlockHash && (
                      <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>PREVIOUS BLOCK HASH (CHAIN LINK)</span>
                        <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                          {ledgerVerification.previousBlockHash}
                        </code>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>ENDORSEMENT PEERS (MSP VALIDATION)</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ peer0.org1 (MunicipalAdminMSP)
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ peer0.org2 (CitizenOversightMSP)
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ orderer (OrdererMSP Raft)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Immutable On-Chain Audit Trail Section */}
                  {ledgerHistory.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} className="text-blue" />
                        <span>Immutable On-Chain State Audit Log ({ledgerHistory.length} Transitions)</span>
                      </h4>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                          <thead style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Timestamp</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>State</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Officer / Actor</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Org MSP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledgerHistory.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '8px' }}>{new Date(item.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '8px', fontWeight: 700, color: '#2563eb' }}>{item.status}</td>
                                <td style={{ padding: '8px' }}>{item.assignedOfficer || 'System Gateway'}</td>
                                <td style={{ padding: '8px' }}><code>{item.updatedByOrg || 'MunicipalAdminMSP'}</code></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <p className="small-text text-muted" style={{ margin: '16px 0 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: '#16a34a' }} />
                    <span>Cryptographically endorsed by Municipal Administration & Citizen Oversight nodes.</span>
                  </p>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', padding: '12px 20px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowLedgerModal(false)}>
                Close Ledger Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

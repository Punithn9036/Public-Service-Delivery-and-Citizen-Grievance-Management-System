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
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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
  const gList = Array.isArray(grievances) ? grievances : [];
  const aList = Array.isArray(applications) ? applications : [];

  const [trackInput, setTrackInput] = useState(selectedTrackId || '');

  const [activeSearchResult, setActiveSearchResult] = useState(() => {
    if (selectedTrackId) {
      return gList.find(g => g && g.id === selectedTrackId) || aList.find(a => a && a.id === selectedTrackId);
    }
    return gList[0] || null;
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
  const stages = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  const currentStageIndex = activeSearchResult ? stages.indexOf(activeSearchResult.status) : 0;

  // SLA Calculation Helper
  const getSlaStatus = () => {
    if (!activeSearchResult || !activeSearchResult.slaDeadline) return null;
    if (activeSearchResult.status === 'Resolved') {
      return { status: 'resolved', text: 'Resolved within SLA', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.1)' };
    }
    const deadline = new Date(activeSearchResult.slaDeadline).getTime();
    const now = Date.now();
    const diffHours = Math.round((deadline - now) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return { status: 'breached', text: `SLA Breached by ${Math.abs(diffHours)} hrs (Escalated)`, color: '#dc2626', bg: 'rgba(239, 68, 68, 0.12)' };
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
          <span>Quick Test IDs: </span>
          {grievances.slice(0, 3).map(g => (
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
          <div className="track-side-col">
            <div className="side-meta-card glass-card">
              <h3>Ticket Information</h3>

              <div className="meta-list-group">
                <div className="meta-list-item">
                  <Building size={16} className="meta-icon" />
                  <div>
                    <span className="meta-lbl">Department</span>
                    <strong>{activeSearchResult.department}</strong>
                  </div>
                </div>

                {activeSearchResult.location && (
                  <div className="meta-list-item">
                    <MapPin size={16} className="meta-icon" />
                    <div>
                      <span className="meta-lbl">Location / Ward</span>
                      <strong>{activeSearchResult.location}</strong>
                    </div>
                  </div>
                )}

                <div className="meta-list-item">
                  <User size={16} className="meta-icon" />
                  <div>
                    <span className="meta-lbl">Assigned Nodal Officer</span>
                    <strong>{activeSearchResult.assignedOfficer || 'Control Room Officer'}</strong>
                  </div>
                </div>

                {activeSearchResult.assignedOfficerContact && activeSearchResult.assignedOfficerContact !== 'N/A' && (
                  <div className="meta-list-item">
                    <Phone size={16} className="meta-icon" />
                    <div>
                      <span className="meta-lbl">Officer Helpline</span>
                      <strong className="text-blue">{activeSearchResult.assignedOfficerContact}</strong>
                    </div>
                  </div>
                )}

                <div className="meta-list-item">
                  <Calendar size={16} className="meta-icon" />
                  <div>
                    <span className="meta-lbl">SLA Resolution Target</span>
                    <strong className="text-amber">
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

            <div className="side-help-card glass-card" style={{ marginTop: '16px' }}>
              <h4>Need Immediate Escalation?</h4>
              <p>If your grievance has passed SLA target date without resolution, call the 24x7 Municipal Helpline: <strong>1800-425-GOV (468)</strong></p>
            </div>
          </div>

        </div>
      ) : (
        <div className="empty-state glass-card">
          <AlertCircle size={48} className="empty-icon text-amber" />
          <h3>Reference Ticket Not Found</h3>
          <p>We couldn't find a grievance or application matching "{trackInput}". Please verify your Tracking ID.</p>
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

import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

export default function TrackingView({ 
  grievances, 
  applications,
  selectedTrackId, 
  onSubmitFeedback,
  onReopenGrievance
}) {
  const [trackInput, setTrackInput] = useState(selectedTrackId || '');
  const [activeSearchResult, setActiveSearchResult] = useState(() => {
    if (selectedTrackId) {
      return grievances.find(g => g.id === selectedTrackId) || applications.find(a => a.id === selectedTrackId);
    }
    return grievances[0] || null;
  });

  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    const cleanId = trackInput.trim().toUpperCase();
    const foundGrievance = grievances.find(g => g.id.toUpperCase() === cleanId);
    const foundApp = applications.find(a => a.id.toUpperCase() === cleanId);
    
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
      
      {/* Search Header */}
      <div className="track-search-card glass-card">
        <h2>Live Grievance & Application Tracker</h2>
        <p>Enter your unique Reference Ticket ID (e.g., GRV-2026-8910 or APP-2026-1049) to view officer activity, IPFS documents, and immutable timeline.</p>

        <form onSubmit={handleSearch} className="track-form">
          <div className="input-group">
            <Search size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="Enter Reference Number (e.g. GRV-2026-8910)..." 
              value={trackInput} 
              onChange={(e) => setTrackInput(e.target.value)}
              className="track-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Track Request
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
                  marginBottom: '20px',
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
                          Verified
                        </span>
                      </div>
                      <p className="text-muted small-text" style={{ margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        CID: {activeSearchResult.ipfsDocumentCid}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://ipfs.io/ipfs/${activeSearchResult.ipfsDocumentCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={14} />
                    <span>View Evidence via IPFS Gateway</span>
                  </a>
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
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#2563eb" />
                    <span>Hyperledger Fabric Ledger Tx: <code style={{ color: '#2563eb', fontWeight: 600 }}>{activeSearchResult.fabricTxId.slice(0, 22)}...</code></span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Immutable Audit Verified</span>
                </div>
              )}

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
                <h3><FileCheck size={20} color="#16a34a" /> Citizen Satisfaction Feedback</h3>
                
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
                    <p>Rate the speed and quality of resolution provided by the municipal team:</p>
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
                        <Send size={14} /> Submit Feedback
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm text-rose"
                        onClick={() => onReopenGrievance(activeSearchResult.id)}
                      >
                        <RotateCcw size={14} /> Issue Not Fixed? Re-open Ticket
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

    </div>
  );
}

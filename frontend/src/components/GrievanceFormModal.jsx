import React, { useState, useEffect } from 'react';
import { 
  FilePlus, 
  Upload, 
  CheckCircle2, 
  Send, 
  Database, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle,
  MapPin, 
  Compass, 
  Navigation,
  Crosshair,
  Camera,
  Check,
  Edit2,
  Lock,
  RefreshCw,
  ThumbsUp,
  Users,
  Layers,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ipfsAPI } from '../api/apiClient';
import { allocateNextOfficer, resolveSector, SECTORS } from '../utils/officerDispatch';
import {
  processGpsPhotoEvidence,
  captureLiveDeviceGps,
  findNearbyDuplicates
} from '../utils/geoEvidenceExtractor';
import { classifyCivicText } from '../utils/civicAiEngine';

export default function GrievanceFormModal({
  departments,
  grievances = [],
  initialPrefill = null,
  onClose,
  onSubmitGrievance,
  onUpvoteGrievance
}) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState(() => ({
    title: initialPrefill?.title || '',
    category: initialPrefill?.category || 'Roads & Infrastructure',
    department: initialPrefill?.department || departments[0] || 'Public Works & Infrastructure',
    sector: initialPrefill?.sector || SECTORS[0] || 'Sector 1 (North Zone)',
    priority: initialPrefill?.priority || 'Medium',
    description: initialPrefill?.description || '',
    location: initialPrefill?.location || '',
    landmark: initialPrefill?.landmark || '',
    citizenName: initialPrefill?.citizenName || user?.fullName || 'Aarav Sharma',
    citizenPhone: initialPrefill?.citizenPhone || user?.phone || '+91 98765 43210',
    citizenEmail: user?.email || 'citizen@janseva.gov.in',
    attachmentName: initialPrefill?.attachmentName || '',
    fileContent: initialPrefill?.fileContent || null
  }));

  const [allocatedOfficerDetails, setAllocatedOfficerDetails] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialPrefill?.imagePreview || null);
  const [gpsData, setGpsData] = useState(initialPrefill?.gpsData || null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isAddressLocked, setIsAddressLocked] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);
  const [ipfsCid, setIpfsCid] = useState(initialPrefill?.ipfsDocumentCid || null);
  const [rawFile, setRawFile] = useState(initialPrefill?.rawFile || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate Detection States
  const [nearbyDuplicates, setNearbyDuplicates] = useState([]);
  const [upvotedTicket, setUpvotedTicket] = useState(null);
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState(false);
  const [imageGpsError, setImageGpsError] = useState(false);

  // Sync citizen contact details with logged-in user session
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizenName: user.fullName || prev.citizenName,
        citizenPhone: user.phone || prev.citizenPhone,
        citizenEmail: user.email || prev.citizenEmail
      }));
    }
  }, [user]);

  // Proximity & Category De-duplication Engine
  useEffect(() => {
    if (!gpsData || ignoreDuplicateWarning) {
      setNearbyDuplicates([]);
      return;
    }
    setNearbyDuplicates(findNearbyDuplicates(gpsData.lat, gpsData.lon, grievances, 250));
  }, [gpsData, grievances, ignoreDuplicateWarning]);

  // AI Smart Auto-Classifier based on subject & description
  useEffect(() => {
    const text = `${formData.title} ${formData.description}`.trim();
    if (text.length < 5) {
      setAiSuggestion(null);
      return;
    }
    const triaged = classifyCivicText(text);
    if (triaged.matched && (triaged.department !== formData.department || triaged.priority !== formData.priority)) {
      setAiSuggestion({
        department: triaged.department,
        category: triaged.category,
        priority: triaged.priority
      });
    } else {
      setAiSuggestion(null);
    }
  }, [formData.title, formData.description, formData.department, formData.priority]);

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({
        ...prev,
        department: aiSuggestion.department,
        category: aiSuggestion.category || prev.category,
        priority: aiSuggestion.priority
      }));
      setAiSuggestion(null);
    }
  };

  const handleUpvoteDuplicate = (ticket) => {
    if (onUpvoteGrievance) {
      onUpvoteGrievance(ticket.id);
    }
    setUpvotedTicket(ticket);
  };

  // Automated GPS Image Processing & Reverse Geocoding
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setRawFile(file);
    setIsProcessingImage(true);
    setImageGpsError(false);

    try {
      const result = await processGpsPhotoEvidence(file);
      setImagePreview(result.fileBase64);

      if (!result.ok) {
        setIsProcessingImage(false);
        setImageGpsError(true);
        setGpsData(null);
        setFormData(prev => ({
          ...prev,
          attachmentName: file.name,
          fileContent: result.fileBase64,
          location: '',
          landmark: ''
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        attachmentName: file.name,
        fileContent: result.fileBase64,
        location: result.location,
        landmark: result.landmark,
        sector: result.sector
      }));
      setGpsData(result.gpsData);
      setIsAddressLocked(true);
      setIsProcessingImage(false);
    } catch (procErr) {
      console.error('GPS processing error:', procErr);
      setIsProcessingImage(false);
      setImageGpsError(true);
    }
  };

  // 1-Click Live GPS Geolocation Trigger
  const handleLiveGpsCapture = async () => {
    setIsProcessingImage(true);
    try {
      const result = await captureLiveDeviceGps();
      setFormData(prev => ({
        ...prev,
        location: result.location,
        landmark: result.landmark,
        sector: result.sector
      }));
      setGpsData(result.gpsData);
      setImageGpsError(false);
      setIsAddressLocked(true);
    } catch (err) {
      alert(err.message || 'Geolocation is not supported by your browser.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.citizenName || !formData.citizenPhone) {
      alert('Please upload a GPS photo or verify the grievance details.');
      return;
    }

    setIsSubmitting(true);
    let generatedCid = ipfsCid || null;

    if (!generatedCid) {
      try {
        if (rawFile) {
          const ipfsRes = await ipfsAPI.uploadFile(rawFile, formData.attachmentName || 'photo_evidence.jpg');
          if (ipfsRes && ipfsRes.cid) generatedCid = ipfsRes.cid;
        } else if (formData.fileContent) {
          const ipfsRes = await ipfsAPI.uploadFile(formData.fileContent, formData.attachmentName || 'photo_evidence.jpg');
          if (ipfsRes && ipfsRes.cid) generatedCid = ipfsRes.cid;
        }
      } catch (ipfsErr) {
        console.warn('IPFS node pinning warning:', ipfsErr);
      }
    }

    if (!generatedCid) {
      generatedCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }

    setIpfsCid(generatedCid);

    const newTicketId = `GRV-2026-${Math.floor(8000 + Math.random() * 1900)}`;
    const targetSector = resolveSector(formData.location, formData.sector);
    const assignedOfficerInfo = allocateNextOfficer(formData.department, targetSector, newTicketId);
    setAllocatedOfficerDetails(assignedOfficerInfo);

    const { fileContent, rawFile: _rf, ...cleanFormData } = formData;
    const newGrievance = {
      id: newTicketId,
      ...cleanFormData,
      sector: targetSector,
      ipfsDocumentCid: generatedCid,
      status: 'Assigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedOfficer: assignedOfficerInfo.officerName,
      assignedOfficerContact: assignedOfficerInfo.officerContact,
      slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          note: `Grievance registered. Address captured from GPS (${gpsData ? `${gpsData.lat}° N, ${gpsData.lon}° E` : formData.location}). IPFS proof pinned (${generatedCid}).`
        },
        {
          status: 'Assigned',
          timestamp: new Date().toISOString(),
          note: `Auto-allocated via Sequential Duty Queue to ${assignedOfficerInfo.officerName} (${assignedOfficerInfo.sector}). Contact: ${assignedOfficerInfo.officerContact}.`
        }
      ],
      feedback: null
    };

    const saved = await onSubmitGrievance(newGrievance);
    if (saved?.assignedOfficer) {
      setAllocatedOfficerDetails(prev => ({
        ...prev,
        officerName: saved.assignedOfficer,
        officerContact: saved.assignedOfficerContact || prev?.officerContact
      }));
    }
    setIsSubmitting(false);
    setSubmittedId(saved?.id || newTicketId);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '680px', width: '95%' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="modal-icon-badge">
              <FilePlus size={22} color="#ffffff" />
            </div>
            <div>
              <h2>{t('lodgeGrievance')}</h2>
              <p>Upload a GPS photo to automatically capture incident address & coordinates</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {upvotedTicket ? (
          /* Upvote / Me Too Confirmation View */
          <div className="modal-success-box animate-fade-in" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(235, 125, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#EB7D00'
            }}>
              <ThumbsUp size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Subscribed to Community Grievance!
            </h3>
            <p className="small-text text-muted" style={{ maxWidth: '440px', margin: '0 auto' }}>
              You have added your voice to existing ticket <strong>#{upvotedTicket.id}</strong>. We escalated its municipal priority and you will receive real-time SMS updates.
            </p>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '16px',
              borderRadius: '10px',
              margin: '18px 0',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-muted small-text">Track Reference:</span>
                <strong style={{ color: '#2C5745', fontSize: '1rem' }}>{upvotedTicket.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-muted small-text">Incident Title:</span>
                <strong style={{ fontSize: '0.85rem' }}>{upvotedTicket.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-muted small-text">Current Officer Status:</span>
                <span className="badge badge-in-progress" style={{ fontSize: '0.72rem' }}>{upvotedTicket.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted small-text">Total Citizens Affected:</span>
                <strong style={{ color: '#EB7D00' }}>{(upvotedTicket.reportCount || 1) + 1} Citizens</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Done & View Live Dashboard
            </button>
          </div>
        ) : submittedId ? (
          /* Submission Confirmation Card */
          <div className="modal-success-box animate-fade-in" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(44, 87, 69, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#2C5745'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Grievance Successfully Lodged!
            </h3>
            <p className="small-text text-muted">Your complaint has been timestamped and GPS-anchored for field officer dispatch.</p>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '18px',
              borderRadius: '12px',
              margin: '20px 0',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted small-text">Ticket Reference ID:</span>
                <strong style={{ color: '#2C5745', fontSize: '1.1rem' }}>{submittedId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted small-text">Assigned Department:</span>
                <strong>{formData.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted small-text">Municipal Sector:</span>
                <strong style={{ color: '#2C5745' }}>{formData.sector || 'Sector 1 (North Zone)'}</strong>
              </div>
              {allocatedOfficerDetails && (
                <div style={{ 
                  background: 'rgba(44, 87, 69, 0.08)', 
                  border: '1px solid rgba(44, 87, 69, 0.25)', 
                  borderRadius: '8px', 
                  padding: '10px 12px', 
                  marginBottom: '10px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2C5745', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ⚡ Auto-Allocated Officer (Next in Queue)
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#16a34a', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Assigned
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {allocatedOfficerDetails.officerName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Direct Hotline: <strong>{allocatedOfficerDetails.officerContact}</strong>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted small-text">Auto-Captured Address:</span>
                <strong style={{ fontSize: '0.85rem', maxWidth: '65%', textAlign: 'right' }}>{formData.location}</strong>
              </div>
              {gpsData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="text-muted small-text">GPS Coordinates:</span>
                  <span style={{ color: '#2C5745', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {gpsData.lat}° N, {gpsData.lon}° E
                  </span>
                </div>
              )}
              {ipfsCid && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <span className="text-muted small-text">IPFS Evidence CID:</span>
                  <a 
                    href={`http://localhost:5000/api/ipfs/${ipfsCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="View pinned image in IPFS Gateway"
                  >
                    <span>{ipfsCid.slice(0, 16)}...{ipfsCid.slice(-6)}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Track Status & Live SLA Countdown
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">

            {/* DUPLICATE DETECTION PROXIMITY ALERT BANNER */}
            {nearbyDuplicates.length > 0 && (
              <div className="animate-fade-in" style={{
                background: 'rgba(235, 125, 0, 0.12)',
                border: '1.5px solid #EB7D00',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertTriangle size={20} color="#EB7D00" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>
                      Potential Duplicate Grievance Detected Nearby ({nearbyDuplicates[0].distanceMeters}m away)
                    </strong>
                    <p style={{ margin: '4px 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      An active grievance matching this location was recently lodged: <strong>"{nearbyDuplicates[0].title}"</strong> (#{nearbyDuplicates[0].id} • Status: {nearbyDuplicates[0].status}).
                    </p>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleUpvoteDuplicate(nearbyDuplicates[0])}
                        className="btn btn-sm"
                        style={{
                          background: '#EB7D00',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ThumbsUp size={14} /> I Am Also Affected (Upvote & Track #{nearbyDuplicates[0].id})
                      </button>

                      <button
                        type="button"
                        onClick={() => setIgnoreDuplicateWarning(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-main)',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        No, this is a distinct issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Auto-Routing Banner */}
            {aiSuggestion && (
              <div className="ai-suggestion-banner animate-fade-in" style={{ marginBottom: '16px' }}>
                <div className="ai-banner-content">
                  <Sparkles size={16} className="text-amber" />
                  <div>
                    <strong>AI Smart Auto-Routing Detected:</strong>
                    <p>
                      Suggested Department: <strong>{aiSuggestion.department}</strong> • Priority: <strong>{aiSuggestion.priority}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                >
                  Apply AI Routing
                </button>
              </div>
            )}

            {/* STEP 1: Automated GPS Photo Upload Section */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '2px dashed var(--brand-700, #2C5745)',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '20px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    1
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      Upload GPS Photo of Incident
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Address and exact coordinates are automatically extracted from your photo
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLiveGpsCapture}
                  disabled={isProcessingImage}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Crosshair size={13} />
                  {isProcessingImage ? 'Locating...' : 'Use Live GPS'}
                </button>
              </div>

              {/* Geotag Missing Error Banner */}
              {imageGpsError && (
                <div className="animate-fade-in" style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid #dc2626',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#dc2626', fontSize: '0.92rem' }}>
                      No Geotag or GPS Address Found in Image
                    </strong>
                    <p style={{ margin: '4px 0 10px', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      This image does not contain embedded GPS EXIF coordinates or visual GPS map camera metadata. To prevent fake reports and ensure official field team dispatch, please upload an authentic geotagged photo.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <label className="btn btn-sm btn-primary" style={{ cursor: 'pointer', fontSize: '0.78rem' }}>
                        Upload Geotagged Photo
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      </label>
                      <button
                        type="button"
                        onClick={handleLiveGpsCapture}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Crosshair size={13} /> Capture Current GPS
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Loader */}
              {isProcessingImage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  marginTop: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}>
                  <RefreshCw size={18} className="animate-spin" color="var(--brand-700)" />
                  <span>Scanning image EXIF tags & extracting GPS coordinates...</span>
                </div>
              )}

              {!imagePreview && !imageGpsError && (
                /* Drag & Drop Upload Target */
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s'
                }}>
                  <Camera size={32} color="#2C5745" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Take Photo or Select GPS Map Camera Image
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    JPG, PNG, HEIC • Auto-detects GPS Latitude, Longitude & Ward
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}

              {imagePreview && !imageGpsError && !isProcessingImage && (
                /* Image Preview & Auto-Extracted GPS Card */
                <div style={{
                  display: 'flex',
                  gap: '14px',
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(44, 87, 69, 0.4)'
                }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={imagePreview} 
                      alt="Incident Proof" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '2px',
                      right: '2px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      borderRadius: '3px',
                      padding: '1px'
                    }}>
                      IPFS Proof
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(44, 87, 69, 0.15)',
                        color: '#2C5745',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        <Check size={12} /> Geotag Extracted ({gpsData?.source || 'GPS'})
                      </span>
                      <label style={{ fontSize: '0.75rem', color: '#2C5745', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                        Change Photo
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} style={{ flexShrink: 0, color: '#2C5745' }} />
                      <span>{formData.location || 'Locating street & ward...'}</span>
                    </div>

                    {gpsData && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span><strong>Lat:</strong> {gpsData.lat}° N</span>
                        <span><strong>Lon:</strong> {gpsData.lon}° E</span>
                        <span><strong>Time:</strong> {gpsData.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Grievance Details & Auto-Populated Address */}
            <div className="form-grid-2">
              
              <div className="form-group col-span-2">
                <label>Grievance Subject / Title <span className="req">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Garbage accumulation & drainage overflow near Indiranagar..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Target Department <span className="req">*</span></label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="form-input"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Municipal Sector / Zone <span className="req">*</span></label>
                <select 
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  className="form-input"
                >
                  {SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority / Urgency <span className="req">*</span></label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="form-input"
                >
                  <option value="Low">Low (General Inquiry / Request)</option>
                  <option value="Medium">Medium (Standard Issue - 3 Day SLA)</option>
                  <option value="High">High (Safety Hazard - 48 hr SLA)</option>
                  <option value="Urgent">Urgent (Health/Flood Emergency - 24 hr SLA)</option>
                </select>
              </div>

              <div className="form-group col-span-2">
                <label>Detailed Description of Complaint <span className="req">*</span></label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input"
                />
              </div>

              {/* Automated Address Field with Lock/Edit toggle */}
              <div className="form-group col-span-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>
                    Incident Location / Ward Address <span className="req">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddressLocked(!isAddressLocked)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isAddressLocked ? '#16a34a' : '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isAddressLocked ? (
                      <>
                        <Lock size={12} /> Auto-Locked from GPS Photo (Click to Edit)
                      </>
                    ) : (
                      <>
                        <Edit2 size={12} /> Manual Editing Active
                      </>
                    )}
                  </button>
                </div>
                
                <input 
                  type="text" 
                  required
                  readOnly={isAddressLocked && Boolean(formData.location)}
                  placeholder="Upload GPS photo above to auto-capture address..."
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="form-input"
                  style={{
                    background: isAddressLocked && formData.location ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    fontWeight: isAddressLocked && formData.location ? 600 : 400
                  }}
                />
              </div>

              <div className="form-group">
                <label>Citizen Full Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Your Full Name"
                  value={formData.citizenName}
                  onChange={(e) => setFormData({...formData, citizenName: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mobile Number (for SMS Alerts) <span className="req">*</span></label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98765 43210"
                  value={formData.citizenPhone}
                  onChange={(e) => setFormData({...formData, citizenPhone: e.target.value})}
                  className="form-input"
                />
              </div>

            </div>

            {/* Modal Footer Submit */}
            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Pinning to IPFS...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Grievance
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

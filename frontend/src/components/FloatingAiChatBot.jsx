import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Search,
  MessageSquare,
  RotateCcw,
  Minimize2,
  FileText,
  PlusCircle,
  Phone,
  ArrowRight,
  Mic,
  Square,
  ImagePlus,
  Crosshair,
  MapPin,
  CheckCircle2,
  Zap,
  Volume2,
  VolumeX,
  ThumbsUp,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI, ipfsAPI } from '../api/apiClient';
import { allocateNextOfficer, resolveSector } from '../utils/officerDispatch';
import {
  processGpsPhotoEvidence,
  captureLiveDeviceGps,
  findNearbyDuplicates
} from '../utils/geoEvidenceExtractor';
import {
  generateCivicAiResponse,
  extractGrievanceSlotsFromText,
  LANG_TO_SPEECH_LOCALE
} from '../utils/civicAiEngine';

function createEmptyDraft(user = null) {
  return {
    active: false,
    title: '',
    description: '',
    category: 'Roads & Infrastructure',
    department: 'Public Works & Infrastructure',
    priority: 'Medium',
    location: '',
    landmark: '',
    sector: '',
    gpsData: null,
    rawFile: null,
    fileContent: null,
    imagePreview: null,
    attachmentName: '',
    audioBlob: null,
    audioUrl: null,
    audioDurationSec: 0,
    citizenName: user?.fullName || '',
    citizenPhone: user?.phone || '',
    nearbyDuplicate: null,
    nearbyDuplicates: [],
    duplicateIgnored: false,
    extractedKeywords: [],
    step: 'idle'
  };
}

// Lightweight text and markdown line formatter
function renderFormattedContent(text) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} style={{ height: '6px' }} />;
    }

    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    const renderedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="chat-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    const isBullet =
      line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');

    return (
      <div
        key={idx}
        style={{
          marginBottom: '2px',
          paddingLeft: isBullet ? '6px' : '0',
          fontSize: '0.84rem',
          lineHeight: '1.45'
        }}
      >
        {renderedParts}
      </div>
    );
  });
}

function formatDuration(sec = 0) {
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

export default function FloatingAiChatBot({
  grievances = [],
  applications = [],
  services = [],
  user = null,
  onTrackTicket,
  onOpenGrievanceModal,
  onOpenServiceModal,
  onNavigateServices,
  onNavigateTrack,
  onOpenSubmissionsModal,
  onSubmitGrievance,
  onUpvoteGrievance
}) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Position State for Draggable Bot
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('janseva_bot_position');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { x: window.innerWidth - 90, y: window.innerHeight - 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });
  const hasMovedRef = useRef(false);

  const initialGreeting = {
    id: 1,
    sender: 'bot',
    text:
      'Namaste Citizen! I am your JanSeva Civic AI Assistant.\n' +
      '• **Step 1 — Upload GPS Image:** First upload a GPS-tagged photo so I can verify the address and check for nearby complaints.\n' +
      '• **Step 2 — Upvote or Send Audio:** Upvote a nearby complaint if it is the same issue, or send an audio description and I will extract keywords and file your grievance automatically.\n' +
      '• **Track or Ask:** Enter any Ticket ID (e.g. `GRV-2026-8910`) or ask about certificates & deadlines.',
    actions: [
      { label: 'Upload GPS Image', type: 'pick-photo', icon: 'ImagePlus' },
      { label: 'Track Ticket', type: 'navigate-track', icon: 'Search' }
    ],
    time: 'Just now'
  };

  const defaultSuggestions = [
    'Upload GPS Image',
    'Track #GRV-2026-8910',
    'Water & Drainage SLA?',
    'Birth certificate documents?'
  ];

  // Chat conversation + media state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([initialGreeting]);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [autoFileEnabled, setAutoFileEnabled] = useState(true);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(false);

  // Voice recording state & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscriptPreview, setLiveTranscriptPreview] = useState('');
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecRef = useRef(null);
  const transcriptAccRef = useRef('');
  const recordingTimerRef = useRef(null);
  const recordingStartTsRef = useRef(0);
  const speechEndedResolveRef = useRef(null);

  // Active Auto-Grievance Draft (ref keeps async photo/audio callbacks race-free)
  const [grievanceDraft, setGrievanceDraft] = useState(() => createEmptyDraft(user));
  const draftRef = useRef(grievanceDraft);
  const submittingLockRef = useRef(false);

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const autoFileEnabledRef = useRef(autoFileEnabled);

  useEffect(() => {
    autoFileEnabledRef.current = autoFileEnabled;
  }, [autoFileEnabled]);

  const updateDraft = (updater) => {
    const prev = draftRef.current;
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    draftRef.current = next;
    setGrievanceDraft(next);
    return next;
  };

  // Keep draft contact synced with logged-in user
  useEffect(() => {
    if (user) {
      updateDraft(prev => ({
        ...prev,
        citizenName: prev.citizenName || user.fullName || '',
        citizenPhone: prev.citizenPhone || user.phone || ''
      }));
    }
  }, [user]);

  function speakIfEnabled(text) {
    if (!voiceFeedbackEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const plain = String(text || '').replace(/[*`•#]/g, '').slice(0, 260);
      const utter = new SpeechSynthesisUtterance(plain);
      utter.lang = LANG_TO_SPEECH_LOCALE[lang] || 'en-IN';
      window.speechSynthesis.speak(utter);
    } catch (e) {}
  }

  function appendBotMessage(msg) {
    const full = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...msg
    };
    setMessages(prev => [...prev, full]);
    if (msg.text) speakIfEnabled(msg.text);
  }

  function appendUserMessage(msg) {
    const full = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...msg
    };
    setMessages(prev => [...prev, full]);
  }

  // Cleanup active streams on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      try {
        speechRecRef.current?.stop();
      } catch (e) {}
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, isProcessingMedia, liveTranscriptPreview]);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(Math.max(20, prev.x), window.innerWidth - 80),
        y: Math.min(Math.max(20, prev.y), window.innerHeight - 80)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('janseva_bot_position', JSON.stringify(position));
    } catch (e) {}
  }, [position]);

  // Drag handlers for Mouse
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y
    };
    e.preventDefault();
  };

  // Drag handlers for Touch
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialPosX: position.x,
      initialPosY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMovedRef.current = true;
      setPosition({
        x: Math.min(Math.max(16, dragStartRef.current.initialPosX + dx), window.innerWidth - 76),
        y: Math.min(Math.max(16, dragStartRef.current.initialPosY + dy), window.innerHeight - 76)
      });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMovedRef.current = true;
      setPosition({
        x: Math.min(Math.max(16, dragStartRef.current.initialPosX + dx), window.innerWidth - 76),
        y: Math.min(Math.max(16, dragStartRef.current.initialPosY + dy), window.innerHeight - 76)
      });
    };

    const handleTouchEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleIconClick = () => {
    if (!hasMovedRef.current) {
      setIsOpen(prev => !prev);
    }
  };

  // =========================================================================
  // AUTO-GRIEVANCE SUBMISSION & LIFECYCLE HELPERS
  // =========================================================================

  const discardDraft = (silent = false) => {
    const prevAudio = draftRef.current?.audioUrl;
    if (prevAudio) {
      try {
        URL.revokeObjectURL(prevAudio);
      } catch (e) {}
    }
    updateDraft(createEmptyDraft(user));
    if (!silent) {
      appendBotMessage({
        text: 'Draft discarded. Attach a GPS photo or tell me what you need help with whenever you are ready.'
      });
    }
  };

  const submitDraftToLedger = async (draftToSubmit = draftRef.current) => {
    if (submittingLockRef.current) return;
    if (!draftToSubmit.location || !draftToSubmit.title || !draftToSubmit.description) {
      return;
    }

    submittingLockRef.current = true;
    updateDraft(prev => ({ ...prev, step: 'submitting' }));
    setIsProcessingMedia(true);

    try {
      let generatedCid = null;
      try {
        if (draftToSubmit.rawFile) {
          const ipfsRes = await ipfsAPI.uploadFile(
            draftToSubmit.rawFile,
            draftToSubmit.attachmentName || 'voice_photo_evidence.jpg'
          );
          if (ipfsRes?.cid) generatedCid = ipfsRes.cid;
        } else if (draftToSubmit.fileContent) {
          const ipfsRes = await ipfsAPI.uploadFile(
            draftToSubmit.fileContent,
            draftToSubmit.attachmentName || 'voice_photo_evidence.jpg'
          );
          if (ipfsRes?.cid) generatedCid = ipfsRes.cid;
        }
      } catch (ipfsErr) {
        console.warn('Chatbot IPFS pin fallback notice:', ipfsErr.message);
      }

      if (!generatedCid) {
        generatedCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      }

      const fallbackId = `GRV-2026-${Math.floor(8000 + Math.random() * 1900)}`;
      const targetSector = resolveSector(draftToSubmit.location, draftToSubmit.sector);
      const localOfficer = allocateNextOfficer(draftToSubmit.department, targetSector, fallbackId);

      const citizenName = draftToSubmit.citizenName || user?.fullName || 'JanSeva Citizen';
      const citizenPhone = draftToSubmit.citizenPhone || user?.phone || '+91 98765 43210';

      const payload = {
        id: fallbackId,
        title: draftToSubmit.title,
        category: draftToSubmit.category || 'Roads & Infrastructure',
        department: draftToSubmit.department || 'Public Works & Infrastructure',
        sector: targetSector,
        priority: draftToSubmit.priority || 'Medium',
        description: draftToSubmit.description,
        location: draftToSubmit.location,
        landmark:
          draftToSubmit.landmark ||
          (draftToSubmit.gpsData
            ? `${draftToSubmit.gpsData.source} (${draftToSubmit.gpsData.lat}° N, ${draftToSubmit.gpsData.lon}° E)`
            : ''),
        citizenName,
        citizenPhone,
        citizenEmail: user?.email || 'citizen@janseva.gov.in',
        attachmentName: draftToSubmit.attachmentName || 'chatbot_evidence.jpg',
        ipfsDocumentCid: generatedCid,
        intakeChannel: 'AI_VOICE_CHATBOT',
        status: 'Assigned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedOfficer: localOfficer.officerName,
        assignedOfficerContact: localOfficer.officerContact,
        slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'Submitted',
            timestamp: new Date().toISOString(),
            note: `Registered via JanSeva AI Voice & GPS Photo Assistant (${draftToSubmit.gpsData ? `${draftToSubmit.gpsData.lat}° N, ${draftToSubmit.gpsData.lon}° E` : draftToSubmit.location})${draftToSubmit.extractedKeywords?.length ? ` | Keywords: ${draftToSubmit.extractedKeywords.join(', ')}` : ''}. IPFS CID: ${generatedCid}.`
          }
        ],
        feedback: null
      };

      const saved = onSubmitGrievance ? await onSubmitGrievance(payload) : payload;
      const finalRecord = saved || payload;
      const kwList = draftToSubmit.extractedKeywords || [];

      appendBotMessage({
        text:
          `✅ **Grievance Automatically Registered!**\n\n` +
          `• **Ticket ID:** \`${finalRecord.id}\`\n` +
          `• **Department:** ${finalRecord.department}\n` +
          `• **Priority:** **${finalRecord.priority}**\n` +
          (kwList.length > 0 ? `• **Matched Keywords:** ${kwList.slice(0, 6).join(', ')}\n` : '') +
          `• **Location:** ${finalRecord.location}\n` +
          `• **Sector:** ${finalRecord.sector || targetSector}\n` +
          `• **Assigned Officer:** ${finalRecord.assignedOfficer}\n` +
          `• **IPFS Proof:** \`${String(finalRecord.ipfsDocumentCid || generatedCid).slice(0, 18)}...\``,
        receiptCard: {
          id: finalRecord.id,
          title: finalRecord.title,
          department: finalRecord.department,
          priority: finalRecord.priority,
          officer: finalRecord.assignedOfficer,
          officerContact: finalRecord.assignedOfficerContact || localOfficer.officerContact,
          cid: finalRecord.ipfsDocumentCid || generatedCid,
          fabricTxId: finalRecord.fabricTxId || null
        },
        actions: [
          { label: `Track #${finalRecord.id}`, type: 'track', payload: finalRecord.id, icon: 'Search' }
        ]
      });

      setSuggestions([`Track #${finalRecord.id}`, 'Check SLA timelines', 'Auto-file via Photo + Mic']);
      discardDraft(true);
    } catch (err) {
      updateDraft(prev => ({ ...prev, step: 'awaiting_confirmation' }));
      appendBotMessage({
        text: `Could not auto-submit right now (${err.message || 'network notice'}). Your draft is saved below — tap **Register Grievance** to retry.`,
        draftCard: { ...draftRef.current }
      });
    } finally {
      setIsProcessingMedia(false);
      submittingLockRef.current = false;
    }
  };

  /**
   * Evaluates draft completeness and either asks for the GPS photo first, prompts
   * on nearby active complaints to upvote (or lodge a different grievance), asks for audio,
   * or auto-submits from extracted keywords.
   */
  const evaluateDraftProgress = async (nextDraft) => {
    if (!nextDraft.active) return;

    const hasLocation = Boolean(nextDraft.location);
    const hasDetails = Boolean(nextDraft.title && nextDraft.description);
    const hasContact = Boolean(
      (nextDraft.citizenName || user?.fullName) && (nextDraft.citizenPhone || user?.phone)
    );

    // 1. Nearby active complaint check (250m proximity cluster) — mirror modal's upvote flow
    const nearbyList =
      nextDraft.nearbyDuplicates?.length > 0
        ? nextDraft.nearbyDuplicates
        : nextDraft.nearbyDuplicate
          ? [nextDraft.nearbyDuplicate]
          : [];

    if (hasLocation && nearbyList.length > 0 && !nextDraft.duplicateIgnored && !hasDetails) {
      const topDup = nearbyList[0];
      updateDraft(prev => ({ ...prev, step: 'nearby_found' }));
      appendBotMessage({
        text:
          `✅ **Address Verified:** ${nextDraft.location}\n` +
          (nextDraft.sector ? `• **Zone:** ${nextDraft.sector}\n\n` : '\n') +
          `⚠️ **Potential Duplicate Grievance Detected Nearby (${topDup.distanceMeters}m away)**\n` +
          `If this matches your issue, tap **I Am Also Affected (Upvote)** instead of filing a duplicate — or choose **Lodge a Different Grievance** to send your audio.`,
        nearbyCards: nearbyList.slice(0, 3),
        actions: [
          { label: 'Lodge a Different Grievance', type: 'ignore-duplicate', icon: 'PlusCircle' },
          { label: 'Discard', type: 'discard-draft', icon: 'Trash2' }
        ]
      });
      return;
    }

    if (!hasLocation && hasDetails) {
      updateDraft(prev => ({ ...prev, step: 'awaiting_photo' }));
      appendBotMessage({
        text:
          `📝 **Complaint Details Extracted:**\n` +
          `• **Subject:** ${nextDraft.title}\n` +
          `• **Department:** ${nextDraft.department} (${nextDraft.priority} Priority)\n` +
          (nextDraft.extractedKeywords?.length
            ? `• **Keywords:** ${nextDraft.extractedKeywords.slice(0, 6).join(', ')}\n\n`
            : '\n') +
          `Now upload your **GPS Image** so I can verify the address and check for nearby complaints.`,
        actions: [
          { label: 'Upload GPS Image', type: 'pick-photo', icon: 'ImagePlus' },
          { label: 'Edit Full Form', type: 'open-prefill-modal', icon: 'Edit3' }
        ]
      });
      return;
    }

    if (hasLocation && !hasDetails) {
      updateDraft(prev => ({ ...prev, step: 'awaiting_audio' }));
      const nearbyNote = nextDraft.duplicateIgnored
        ? `📝 **Lodging a Different Grievance**\n📍 **Verified Address:** ${nextDraft.location}\n\n`
        : `✅ **Address Verified:** ${nextDraft.location}\n` +
          (nextDraft.sector ? `• **Zone:** ${nextDraft.sector}\n` : '') +
          `• **Nearby Check:** No existing active complaints found within 250m.\n\n`;

      appendBotMessage({
        text:
          nearbyNote +
          `🎙️ **Step 2 — Send Audio Description:**\n` +
          `Please record a voice message or upload an audio file explaining your complaint. I will extract the keywords from the audio and file the complaint automatically!`,
        actions: [
          { label: 'Record Audio (Mic)', type: 'start-voice', icon: 'Mic' },
          { label: 'Send Audio File', type: 'pick-audio', icon: 'Upload' },
          { label: 'Edit Full Form', type: 'open-prefill-modal', icon: 'Edit3' }
        ]
      });
      return;
    }

    if (hasLocation && hasDetails && !hasContact) {
      updateDraft(prev => ({ ...prev, step: 'awaiting_contact' }));
      appendBotMessage({
        text:
          `Almost done! Please say or type your **10-digit mobile number** (and name if guest) so SMS/WhatsApp status alerts can be linked before filing.`
      });
      return;
    }

    if (hasLocation && hasDetails && hasContact) {
      if (autoFileEnabledRef.current) {
        appendBotMessage({
          text:
            `⚡ **Auto-Filing Grievance from Keywords...**\n` +
            `• **Title:** ${nextDraft.title}\n` +
            `• **Department:** ${nextDraft.department} (**${nextDraft.priority}**)\n` +
            (nextDraft.extractedKeywords?.length
              ? `• **Keywords Extracted:** ${nextDraft.extractedKeywords.slice(0, 6).join(', ')}\n`
              : '') +
            `• **Location:** ${nextDraft.location}\n` +
            `Pinning evidence to IPFS & dispatching to ${nextDraft.sector || 'zone'} officer...`
        });
        await submitDraftToLedger(nextDraft);
      } else {
        updateDraft(prev => ({ ...prev, step: 'awaiting_confirmation' }));
        appendBotMessage({
          text: `Ready to register your grievance with all extracted details. Review below and confirm:`,
          draftCard: { ...nextDraft },
          actions: [
            { label: 'Confirm & Register', type: 'confirm-submit-draft', icon: 'CheckCircle2' },
            { label: 'Edit Full Form', type: 'open-prefill-modal', icon: 'Edit3' },
            { label: 'Discard', type: 'discard-draft', icon: 'Trash2' }
          ]
        });
      }
    }
  };

  // =========================================================================
  // PHOTO SELECTION (SAME DEVICE / THIRD-PARTY GPS CAMERA APPS)
  // =========================================================================

  const handlePhotoFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      appendBotMessage({ text: 'Please select a valid image file (JPG, PNG, HEIC, or WebP).' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    appendUserMessage({
      text: `Attached photo: ${file.name}`,
      imageUrl: previewUrl
    });

    setIsProcessingMedia(true);
    try {
      const result = await processGpsPhotoEvidence(file);

      if (!result.ok || !result.location) {
        updateDraft(prev => ({
          ...prev,
          active: true,
          step: 'awaiting_photo',
          rawFile: null,
          fileContent: null,
          imagePreview: null,
          attachmentName: '',
          gpsData: null,
          location: '',
          landmark: '',
          sector: '',
          nearbyDuplicate: null,
          nearbyDuplicates: [],
          duplicateIgnored: false
        }));
        const reasonText =
          result.errorType === 'NO_ADDRESS'
            ? `GPS coordinates were read, but a readable street/area address could not be extracted from \`${file.name}\`.`
            : `No GPS coordinates or address could be extracted from \`${file.name}\`.`;
        appendBotMessage({
          text:
            `⚠️ **Could Not Extract Address — Please Resend GPS Image**\n` +
            `${reasonText}\nPlease resend a clear photo captured with **GPS Map Camera** or with camera **Location Tags ON**.`,
          actions: [
            { label: 'Resend GPS Image', type: 'pick-photo', icon: 'ImagePlus' }
          ]
        });
        return;
      }

      const nearby = findNearbyDuplicates(result.gpsData.lat, result.gpsData.lon, grievances, 250);
      const updated = updateDraft(prev => ({
        ...prev,
        active: true,
        rawFile: file,
        fileContent: result.fileBase64,
        imagePreview: result.fileBase64,
        attachmentName: file.name,
        gpsData: result.gpsData,
        location: result.location,
        landmark: result.landmark,
        sector: result.sector,
        nearbyDuplicates: nearby,
        nearbyDuplicate: nearby.length > 0 ? nearby[0] : null,
        duplicateIgnored: false
      }));

      await evaluateDraftProgress(updated);
    } catch (err) {
      updateDraft(prev => ({ ...prev, active: true, step: 'awaiting_photo', location: '', gpsData: null }));
      appendBotMessage({
        text: `Failed to verify photo address (${err.message}). Please resend a clear GPS-tagged image.`,
        actions: [{ label: 'Resend GPS Image', type: 'pick-photo', icon: 'ImagePlus' }]
      });
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handlePhotoInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
    e.target.value = '';
  };

  const getAudioFileDuration = (file) =>
    new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const audioEl = new Audio();
        const done = (sec) => {
          try { URL.revokeObjectURL(url); } catch (e) {}
          resolve(sec);
        };
        audioEl.preload = 'metadata';
        audioEl.onloadedmetadata = () => done(Math.max(1, Math.round(audioEl.duration || 0)));
        audioEl.onerror = () => done(0);
        setTimeout(() => done(0), 1500);
        audioEl.src = url;
      } catch (e) {
        resolve(0);
      }
    });

  const handleAudioFile = async (file) => {
    if (!file || (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|webm|aac)$/i.test(file.name))) {
      appendBotMessage({ text: 'Please select a valid audio file (MP3, WAV, M4A, OGG, or WebM).' });
      return;
    }
    const durationSec = await getAudioFileDuration(file);
    await processRecordedVoice({ audioBlob: file, durationSec, transcript: '' });
  };

  const handleAudioInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleAudioFile(file);
    e.target.value = '';
  };

  const handleLiveGpsInChat = async () => {
    setIsProcessingMedia(true);
    try {
      const res = await captureLiveDeviceGps();
      const nearby = findNearbyDuplicates(res.gpsData.lat, res.gpsData.lon, grievances, 250);
      const updated = updateDraft(prev => ({
        ...prev,
        active: true,
        gpsData: res.gpsData,
        location: res.location,
        landmark: res.landmark,
        sector: res.sector,
        nearbyDuplicates: nearby,
        nearbyDuplicate: nearby.length > 0 ? nearby[0] : null,
        duplicateIgnored: false
      }));
      await evaluateDraftProgress(updated);
    } catch (err) {
      appendBotMessage({
        text: err.message || 'Unable to read browser geolocation. Please pick a geotagged GPS photo.'
      });
    } finally {
      setIsProcessingMedia(false);
    }
  };

  // =========================================================================
  // VOICE AUDIO RECORDING + LIVE SPEECH-TO-TEXT + AI EXTRACTION
  // =========================================================================

  const processRecordedVoice = async ({ audioBlob = null, durationSec = 0, transcript = '' }) => {
    const cleanTranscript = String(transcript || '').trim();
    const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null;

    if (audioBlob || cleanTranscript) {
      appendUserMessage({
        text: cleanTranscript || `Voice note recorded (${formatDuration(durationSec)})`,
        audioUrl,
        audioDurationSec: durationSec
      });
    }

    if (!audioBlob && !cleanTranscript) {
      appendBotMessage({
        text: 'No voice detected. Please hold the Mic closer and describe your civic issue or tap a photo to attach.'
      });
      return;
    }

    setIsProcessingMedia(true);
    try {
      const curDraft = draftRef.current;

      // Run backend AI extraction (supports both audio upload + transcript + optional cloud multimodal)
      let backendRes = null;
      try {
        backendRes = await aiAPI.extractGrievance({
          audioBlob,
          transcript: cleanTranscript,
          location: curDraft.location,
          ocrAddressText: curDraft.gpsData?.ocrAddressText || '',
          lang,
          citizenName: curDraft.citizenName || user?.fullName || '',
          citizenPhone: curDraft.citizenPhone || user?.phone || '',
          existingDraft: {
            active: curDraft.active,
            title: curDraft.title,
            description: curDraft.description,
            department: curDraft.department,
            category: curDraft.category,
            priority: curDraft.priority,
            location: curDraft.location,
            citizenName: curDraft.citizenName,
            citizenPhone: curDraft.citizenPhone
          }
        });
      } catch (apiErr) {
        console.warn('Backend AI extraction offline fallback notice:', apiErr.message);
      }

      if (backendRes?.needsTranscriptInput) {
        updateDraft(prev => ({
          ...prev,
          active: true,
          step: 'awaiting_audio',
          audioBlob,
          audioUrl,
          audioDurationSec: durationSec
        }));
        appendBotMessage({
          text:
            `🎙️ **Audio Attached (${formatDuration(durationSec)})**\n` +
            `To extract keywords automatically without a cloud Speech-to-Text API key, tap **Record Audio (Mic)** for live voice transcription or type your complaint description below.`,
          actions: [
            { label: 'Record Audio (Mic)', type: 'start-voice', icon: 'Mic' }
          ]
        });
        return;
      }

      const localFallback = extractGrievanceSlotsFromText(cleanTranscript, curDraft);
      const extracted = backendRes?.extracted
        ? {
            ...backendRes.extracted,
            extractedKeywords:
              backendRes.extracted.extractedKeywords?.length
                ? backendRes.extracted.extractedKeywords
                : localFallback.extractedKeywords
          }
        : localFallback;

      // Handle explicit voice confirmation/cancellation when a draft is waiting
      if (extracted.intent === 'CANCEL' && curDraft.active) {
        discardDraft();
        return;
      }
      if (extracted.intent === 'FILE_NEW' && curDraft.active && curDraft.nearbyDuplicate) {
        const next = updateDraft(prev => ({ ...prev, duplicateIgnored: true }));
        await evaluateDraftProgress(next);
        return;
      }
      if (extracted.intent === 'CONFIRM' && curDraft.active) {
        await submitDraftToLedger(curDraft);
        return;
      }

      // Update draft if voice expresses a complaint/problem or we already have an active draft/photo
      if (extracted.intent === 'AUTO_GRIEVANCE' || curDraft.active) {
        const mergedKeywords = Array.from(
          new Set([...(curDraft.extractedKeywords || []), ...(extracted.extractedKeywords || [])])
        );
        const next = updateDraft(prev => ({
          ...prev,
          active: true,
          audioBlob: audioBlob || prev.audioBlob,
          audioUrl: audioUrl || prev.audioUrl,
          audioDurationSec: durationSec || prev.audioDurationSec,
          title: extracted.title || prev.title,
          description: extracted.description || prev.description,
          department: extracted.department || prev.department,
          category: extracted.category || prev.category,
          priority: extracted.priority || prev.priority,
          extractedKeywords: mergedKeywords,
          landmark: prev.landmark || extracted.landmarkHint || '',
          citizenName: prev.citizenName || user?.fullName || 'JanSeva Citizen',
          citizenPhone: extracted.citizenPhone || prev.citizenPhone || user?.phone || ''
        }));

        await evaluateDraftProgress(next);
        return;
      }

      // Otherwise treat spoken phrase as normal Civic AI Q&A
      const qa = generateCivicAiResponse(cleanTranscript, { grievances, applications, services, user, lang });
      appendBotMessage({ text: qa.text, actions: qa.actions || [] });
      if (qa.followUps?.length) setSuggestions(qa.followUps);
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const stopVoiceRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const durationSec = Math.max(1, Math.round((Date.now() - recordingStartTsRef.current) / 1000));

    // Wait briefly for SpeechRecognition onend to flush final spoken words
    const waitForSpeechFlush = new Promise(resolve => {
      if (!speechRecRef.current) return resolve();
      speechEndedResolveRef.current = resolve;
      try {
        speechRecRef.current.stop();
      } catch (e) {
        resolve();
      }
      setTimeout(resolve, 450);
    });

    const waitForRecorderBlob = new Promise(resolve => {
      const rec = mediaRecorderRef.current;
      if (!rec || rec.state === 'inactive') return resolve(null);
      rec.onstop = () => {
        const mimeType = rec.mimeType || 'audio/webm';
        const blob = audioChunksRef.current.length
          ? new Blob(audioChunksRef.current, { type: mimeType })
          : null;
        resolve(blob);
      };
      try {
        rec.stop();
      } catch (e) {
        resolve(null);
      }
    });

    const [audioBlob] = await Promise.all([waitForRecorderBlob, waitForSpeechFlush]);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    const finalTranscript = (transcriptAccRef.current || liveTranscriptPreview || '').trim();
    transcriptAccRef.current = '';
    setLiveTranscriptPreview('');
    setRecordingSeconds(0);

    await processRecordedVoice({ audioBlob, durationSec, transcript: finalTranscript });
  };

  const startVoiceRecording = async () => {
    if (isRecording) {
      await stopVoiceRecording();
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasMediaRecorder =
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined';

    if (!SpeechRecognition && !hasMediaRecorder) {
      appendBotMessage({
        text: 'Microphone recording is not supported in this browser. Please type your grievance details or pick a GPS photo below.'
      });
      return;
    }

    transcriptAccRef.current = '';
    setLiveTranscriptPreview('');
    audioChunksRef.current = [];
    recordingStartTsRef.current = Date.now();
    setRecordingSeconds(0);

    if (hasMediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (evt) => {
          if (evt.data && evt.data.size > 0) {
            audioChunksRef.current.push(evt.data);
          }
        };
        mediaRecorderRef.current = recorder;
        recorder.start(250);
      } catch (micErr) {
        if (!SpeechRecognition) {
          appendBotMessage({
            text: `Microphone access denied or unavailable (${micErr.message}). Please allow microphone permissions in your browser.`
          });
          return;
        }
      }
    }

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = LANG_TO_SPEECH_LOCALE[lang] || 'en-IN';
        rec.continuous = true;
        rec.interimResults = true;

        rec.onresult = (event) => {
          let finalPart = '';
          let interimPart = '';
          for (let i = 0; i < event.results.length; i++) {
            const phrase = event.results[i][0]?.transcript || '';
            if (event.results[i].isFinal) finalPart += `${phrase} `;
            else interimPart += phrase;
          }
          const combined = `${finalPart}${interimPart}`.trim();
          transcriptAccRef.current = combined;
          setLiveTranscriptPreview(combined);
        };

        rec.onerror = () => {};
        rec.onend = () => {
          if (speechEndedResolveRef.current) {
            speechEndedResolveRef.current();
            speechEndedResolveRef.current = null;
          }
        };

        speechRecRef.current = rec;
        rec.start();
      } catch (recErr) {
        console.warn('SpeechRecognition notice:', recErr.message);
      }
    }

    setIsRecording(true);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  // =========================================================================
  // CHAT ACTIONS & TEXT MESSAGE HANDLERS
  // =========================================================================

  const handleActionClick = async (action) => {
    if (!action) return;
    switch (action.type) {
      case 'pick-photo':
        fileInputRef.current?.click();
        break;
      case 'pick-audio':
        audioInputRef.current?.click();
        break;
      case 'start-voice':
        await startVoiceRecording();
        break;
      case 'live-gps':
        await handleLiveGpsInChat();
        break;
      case 'confirm-submit-draft':
        await submitDraftToLedger(draftRef.current);
        break;
      case 'discard-draft':
        discardDraft();
        break;
      case 'ignore-duplicate': {
        const next = updateDraft(prev => ({ ...prev, duplicateIgnored: true }));
        await evaluateDraftProgress(next);
        break;
      }
      case 'upvote-duplicate':
        if (action.payload?.id && onUpvoteGrievance) {
          await onUpvoteGrievance(action.payload.id);
          appendBotMessage({
            text:
              `👍 **Subscribed & Upvoted #${action.payload.id}!**\n` +
              `• **Issue:** ${action.payload.title}\n` +
              `• **Status:** ${action.payload.status}\n` +
              `• **Total Citizens Affected:** ${(action.payload.reportCount || 1) + 1} Citizens\n` +
              `Its municipal priority has been escalated and you will receive SMS status updates.`,
            actions: [{ label: `Track #${action.payload.id}`, type: 'track', payload: action.payload.id, icon: 'Search' }]
          });
          discardDraft(true);
        }
        break;
      case 'open-prefill-modal': {
        const cur = draftRef.current;
        if (onOpenGrievanceModal) {
          onOpenGrievanceModal({
            title: cur.title,
            description: cur.description,
            department: cur.department,
            category: cur.category,
            priority: cur.priority,
            location: cur.location,
            landmark: cur.landmark,
            sector: cur.sector,
            gpsData: cur.gpsData,
            rawFile: cur.rawFile,
            fileContent: cur.fileContent,
            imagePreview: cur.imagePreview,
            attachmentName: cur.attachmentName,
            citizenName: cur.citizenName,
            citizenPhone: cur.citizenPhone
          });
        }
        break;
      }
      case 'track':
        if (onTrackTicket) onTrackTicket(action.payload);
        else if (onNavigateTrack) onNavigateTrack(action.payload);
        break;
      case 'navigate-track':
        if (onNavigateTrack) onNavigateTrack(action.payload);
        else if (onTrackTicket) onTrackTicket(action.payload);
        break;
      case 'service':
        if (onOpenServiceModal) onOpenServiceModal(action.payload);
        break;
      case 'navigate-services':
        if (onNavigateServices) onNavigateServices();
        break;
      case 'lodge':
        if (onOpenGrievanceModal) onOpenGrievanceModal(action.payload);
        break;
      case 'submissions-modal':
        if (onOpenSubmissionsModal) onOpenSubmissionsModal();
        break;
      case 'helpline':
        window.open(`tel:${action.payload || '1800425468'}`);
        break;
      default:
        break;
    }
  };

  const handleResetChat = () => {
    discardDraft(true);
    setMessages([initialGreeting]);
    setSuggestions(defaultSuggestions);
    setChatInput('');
  };

  const handleSendMessage = async (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : chatInput).trim();
    if (!query) return;

    const qLower = query.toLowerCase();
    if (qLower === 'upload gps image' || qLower === 'auto-file via photo + mic') {
      updateDraft(prev => ({ ...prev, active: true, step: 'awaiting_photo' }));
      appendUserMessage({ text: query });
      appendBotMessage({
        text:
          `📸 **Step 1 — Upload Your GPS Image**\n` +
          `Upload a GPS-tagged photo of the issue. I will verify its address, check for nearby complaints you can upvote, and then ask for your audio description if it is a new grievance.`,
        actions: [
          { label: 'Upload GPS Image', type: 'pick-photo', icon: 'ImagePlus' }
        ]
      });
      if (typeof textToSend !== 'string') setChatInput('');
      return;
    }

    appendUserMessage({ text: query });
    if (typeof textToSend !== 'string') {
      setChatInput('');
    }

    const curDraft = draftRef.current;

    // Handle active grievance draft conversation turns (voice/text updates, phone number, confirm/cancel)
    if (curDraft.active) {
      const slots = extractGrievanceSlotsFromText(query, curDraft);
      if (slots.intent === 'CANCEL') {
        discardDraft();
        return;
      }
      if (slots.intent === 'FILE_NEW' && curDraft.nearbyDuplicate) {
        const next = updateDraft(prev => ({ ...prev, duplicateIgnored: true }));
        await evaluateDraftProgress(next);
        return;
      }
      if (slots.intent === 'CONFIRM' && curDraft.location && curDraft.description) {
        await submitDraftToLedger(curDraft);
        return;
      }

      // Check if user is supplying contact info when asked
      if (curDraft.step === 'awaiting_contact') {
        const phoneOnly = slots.citizenPhone;
        const nameGuess = query.replace(/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/g, '').replace(/[,;-]/g, ' ').trim();
        const next = updateDraft(prev => ({
          ...prev,
          citizenPhone: phoneOnly || prev.citizenPhone,
          citizenName: nameGuess.length >= 2 ? nameGuess : (prev.citizenName || user?.fullName || 'JanSeva Citizen')
        }));
        await evaluateDraftProgress(next);
        return;
      }

      // Otherwise treat message as issue details via AI extractor
      const mergedKeywords = Array.from(
        new Set([...(curDraft.extractedKeywords || []), ...(slots.extractedKeywords || [])])
      );
      const next = updateDraft(prev => ({
        ...prev,
        active: true,
        title: slots.title || prev.title,
        description: slots.description || prev.description,
        department: slots.department || prev.department,
        category: slots.category || prev.category,
        priority: slots.priority || prev.priority,
        extractedKeywords: mergedKeywords,
        citizenPhone: slots.citizenPhone || prev.citizenPhone
      }));
      await evaluateDraftProgress(next);
      return;
    }

    // Check if citizen typed a complaint directly from idle state (except direct ticket ID tracking)
    const isTicketLookup = /\b(?:GRV|APP)[-_ ]?\d+/i.test(query);
    if (!isTicketLookup) {
      const slots = extractGrievanceSlotsFromText(query, null);
      if (slots.intent === 'AUTO_GRIEVANCE' && query.split(/\s+/).length >= 3 && slots.title) {
        const next = updateDraft(prev => ({
          ...prev,
          active: true,
          title: slots.title,
          description: slots.description,
          department: slots.department,
          category: slots.category,
          priority: slots.priority,
          extractedKeywords: slots.extractedKeywords || [],
          landmark: slots.landmarkHint || prev.landmark,
          citizenName: user?.fullName || prev.citizenName,
          citizenPhone: slots.citizenPhone || user?.phone || prev.citizenPhone
        }));
        await evaluateDraftProgress(next);
        return;
      }
    }

    // Standard Q&A / Ticket lookup / Service catalog guidance
    setIsTyping(true);
    setTimeout(() => {
      const response = generateCivicAiResponse(query, {
        grievances,
        applications,
        services,
        user,
        lang
      });

      setIsTyping(false);
      appendBotMessage({
        text: response.text,
        actions: response.actions || []
      });

      if (response.followUps && response.followUps.length > 0) {
        setSuggestions(response.followUps);
      }
    }, 350);
  };

  // Drag & drop photo or audio directly into chat window
  const handleDropPhoto = (e) => {
    e.preventDefault();
    setIsFileDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoFile(file);
    } else if (file && file.type.startsWith('audio/')) {
      handleAudioFile(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handlePhotoFile(file);
          return;
        }
      }
    }
  };

  const renderActionIcon = (iconName) => {
    switch (iconName) {
      case 'Search':
        return <Search size={13} />;
      case 'FileText':
        return <FileText size={13} />;
      case 'PlusCircle':
      case 'FilePlus':
        return <PlusCircle size={13} />;
      case 'Phone':
      case 'PhoneCall':
        return <Phone size={13} />;
      case 'MessageSquare':
        return <MessageSquare size={13} />;
      case 'ImagePlus':
        return <ImagePlus size={13} />;
      case 'Mic':
        return <Mic size={13} />;
      case 'Crosshair':
        return <Crosshair size={13} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={13} />;
      case 'ThumbsUp':
        return <ThumbsUp size={13} />;
      case 'Edit3':
        return <Edit3 size={13} />;
      case 'Trash2':
        return <Trash2 size={13} />;
      case 'Upload':
        return <Upload size={13} />;
      default:
        return <ArrowRight size={13} />;
    }
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: position.y > window.innerHeight / 2 ? 'auto' : `${window.innerHeight - position.y + 10}px`,
    top: position.y > window.innerHeight / 2 ? `${Math.max(16, position.y - 520)}px` : 'auto',
    left: position.x > window.innerWidth / 2 ? `${Math.max(16, position.x - 370)}px` : `${position.x}px`,
    width: '396px',
    maxWidth: 'calc(100vw - 24px)',
    height: '520px',
    maxHeight: 'calc(100vh - 36px)',
    zIndex: 1100
  };

  return (
    <>
      {/* Hidden photo & audio file pickers for same-device Gallery / GPS Map Camera photos & voice notes */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoInputChange}
        style={{ display: 'none' }}
        aria-label="Upload GPS Photo Evidence"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioInputChange}
        style={{ display: 'none' }}
        aria-label="Send Audio File"
      />

      {/* Floating Movable Bot Trigger Icon */}
      <div
        className={`floating-bot-badge ${isDragging ? 'dragging' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleIconClick}
        title="JanSeva AI Assistant (Drag to move, Click to chat)"
      >
        <div className="floating-bot-inner">
          <Bot size={22} color="#ffffff" />
          <span className="bot-status-beacon" />
        </div>
        <div className="bot-hover-tooltip">
          <span>AI Voice &amp; GPS Helper</span>
        </div>
      </div>

      {/* Floating Interactive Chat Window */}
      {isOpen && (
        <div
          className={`floating-chat-popup glass-card ${isFileDragOver ? 'drag-over-photo' : ''}`}
          style={chatWindowStyle}
          onDragOver={(e) => {
            e.preventDefault();
            setIsFileDragOver(true);
          }}
          onDragLeave={() => setIsFileDragOver(false)}
          onDrop={handleDropPhoto}
          onPaste={handlePaste}
        >
          {/* Header */}
          <div className="chat-popup-header">
            <div className="chat-header-info">
              <div className="chat-avatar-box">
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <h4 className="chat-title">JanSeva Civic AI</h4>
                <span className="chat-subtitle">Voice &amp; GPS Auto-Filing</span>
              </div>
            </div>

            <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                className={`chat-autofile-toggle ${autoFileEnabled ? 'active' : ''}`}
                onClick={() => setAutoFileEnabled(prev => !prev)}
                title="Toggle automatic filing once GPS photo & voice details are captured"
              >
                <Zap size={11} />
                <span>{autoFileEnabled ? 'Auto-File' : 'Review'}</span>
              </button>
              <button
                type="button"
                className="chat-action-icon-btn"
                onClick={() => setVoiceFeedbackEnabled(prev => !prev)}
                title={voiceFeedbackEnabled ? 'Mute Voice Replies' : 'Speak Bot Replies Aloud'}
              >
                {voiceFeedbackEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button
                type="button"
                className="chat-action-icon-btn"
                onClick={handleResetChat}
                title="Restart Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                className="chat-action-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Active Draft Live Status Pill Strip */}
          {grievanceDraft.active && (
            <div className="chat-draft-status-bar">
              <span className={`draft-slot-pill ${grievanceDraft.location ? 'done' : ''}`}>
                <MapPin size={11} />
                {grievanceDraft.location ? 'GPS Locked' : 'Photo/GPS Needed'}
              </span>
              <span className={`draft-slot-pill ${grievanceDraft.description ? 'done' : ''}`}>
                <Mic size={11} />
                {grievanceDraft.description ? grievanceDraft.department.split(' ')[0] : 'Voice Needed'}
              </span>
              <button
                type="button"
                className="draft-discard-mini-btn"
                onClick={() => discardDraft()}
                title="Cancel active complaint draft"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Quick Dynamic Suggestion Chips */}
          <div className="chat-chips-scroll">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-chip-btn"
                onClick={() => handleSendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-container">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                {m.sender === 'bot' && (
                  <div className="chat-msg-avatar">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  {m.imageUrl && (
                    <div className="chat-media-preview-wrap">
                      <img src={m.imageUrl} alt="Uploaded civic issue proof" className="chat-uploaded-img" />
                    </div>
                  )}

                  {m.audioUrl && (
                    <div className="chat-audio-player-wrap">
                      <audio controls src={m.audioUrl} className="chat-audio-element" />
                      <span className="chat-audio-duration">{formatDuration(m.audioDurationSec)}</span>
                    </div>
                  )}

                  {renderFormattedContent(m.text)}

                  {/* Nearby Duplicate Complaint Alert Cards (Upvote / Subscribe) */}
                  {m.nearbyCards && m.nearbyCards.length > 0 && (
                    <div className="chat-nearby-list">
                      {m.nearbyCards.map((dup) => (
                        <div key={dup.id} className="chat-nearby-card">
                          <div className="chat-nearby-top">
                            <span className="chat-nearby-dist">
                              <AlertTriangle size={12} /> {dup.distanceMeters}m away
                            </span>
                            <span className="chat-nearby-count">
                              {(dup.reportCount || 1)} Citizens
                            </span>
                          </div>
                          <div className="chat-nearby-title">
                            <strong>#{dup.id}</strong> — {dup.title}
                          </div>
                          <div className="chat-nearby-meta">
                            <span>{dup.department}</span>
                            <span className="chat-nearby-status">{dup.status}</span>
                          </div>
                          <button
                            type="button"
                            className="chat-nearby-upvote-btn"
                            onClick={() => handleActionClick({ type: 'upvote-duplicate', payload: dup })}
                          >
                            <ThumbsUp size={12} /> I Am Also Affected (Upvote #{dup.id})
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Draft Review Card */}
                  {m.draftCard && (
                    <div className="chat-summary-card">
                      <div><strong>Title:</strong> {m.draftCard.title}</div>
                      <div><strong>Dept:</strong> {m.draftCard.department} ({m.draftCard.priority})</div>
                      <div><strong>Location:</strong> {m.draftCard.location}</div>
                      {m.draftCard.sector && <div><strong>Sector:</strong> {m.draftCard.sector}</div>}
                    </div>
                  )}

                  {/* Registered Official Receipt Card */}
                  {m.receiptCard && (
                    <div className="chat-receipt-card">
                      <div className="chat-receipt-badge">OFFICIAL MUNICIPAL LEDGER</div>
                      <div><strong>Officer:</strong> {m.receiptCard.officer}</div>
                      {m.receiptCard.officerContact && (
                        <div><strong>Hotline:</strong> {m.receiptCard.officerContact}</div>
                      )}
                      {m.receiptCard.fabricTxId && (
                        <div><strong>Fabric TX:</strong> <code>{String(m.receiptCard.fabricTxId).slice(0, 18)}...</code></div>
                      )}
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="chat-msg-actions-row">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          className="chat-msg-action-btn"
                          onClick={() => handleActionClick(act)}
                        >
                          {renderActionIcon(act.icon)}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="chat-msg-time">{m.time}</span>
                </div>
              </div>
            ))}

            {(isTyping || isProcessingMedia) && (
              <div className="chat-bubble-row bot-row">
                <div className="chat-msg-avatar">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble bot-bubble typing-bubble">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={13} className="animate-spin" />
                    {isProcessingMedia
                      ? 'Extracting GPS/audio & updating civic ledger...'
                      : 'Assistant is analyzing municipal ledger...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Live Voice Recording Indicator */}
          {isRecording && (
            <div className="chat-recording-banner">
              <div className="chat-recording-left">
                <span className="chat-rec-dot" />
                <span className="chat-rec-timer">Listening ({formatDuration(recordingSeconds)})</span>
                <span className="chat-rec-live-text">
                  {liveTranscriptPreview || 'Speak your issue clearly...'}
                </span>
              </div>
              <button
                type="button"
                className="chat-rec-stop-btn"
                onClick={stopVoiceRecording}
              >
                <Square size={11} /> Stop
              </button>
            </div>
          )}

          {/* Input Box with Photo Picker + Voice Mic + Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(chatInput);
            }}
            className="chat-input-form"
          >
            <button
              type="button"
              className="chat-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingMedia}
              title="Upload GPS Image (Gallery or GPS Camera App)"
              aria-label="Upload GPS Image"
            >
              <ImagePlus size={16} />
            </button>

            <button
              type="button"
              className={`chat-tool-btn ${isRecording ? 'recording' : ''}`}
              onClick={startVoiceRecording}
              disabled={isProcessingMedia}
              title={isRecording ? 'Stop Recording & Extract Complaint' : 'Record Voice Audio'}
              aria-label={isRecording ? 'Stop Recording' : 'Record Voice Audio'}
            >
              {isRecording ? <Square size={15} /> : <Mic size={16} />}
            </button>

            <button
              type="button"
              className="chat-tool-btn"
              onClick={() => audioInputRef.current?.click()}
              disabled={isProcessingMedia || isRecording}
              title="Send Pre-Recorded Audio File"
              aria-label="Send Audio File"
            >
              <Upload size={15} />
            </button>

            <input
              type="text"
              className="chat-text-input"
              placeholder={
                isRecording
                  ? 'Listening to voice...'
                  : 'Speak, attach GPS photo, or ask...'
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={!chatInput.trim() || isProcessingMedia}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

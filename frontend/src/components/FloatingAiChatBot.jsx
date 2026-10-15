import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Search, 
  MessageSquare, 
  RotateCcw, 
  HelpCircle, 
  ExternalLink,
  Minimize2,
  Move,
  FileText,
  PlusCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { generateCivicAiResponse } from '../utils/civicAiEngine';

// Lightweight text and markdown line formatter
function renderFormattedContent(text) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} style={{ height: '6px' }} />;
    }

    // Split bold **phrase**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');

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
  onOpenSubmissionsModal
}) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Position State for Draggable Bot
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('janseva_bot_position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { x: window.innerWidth - 90, y: window.innerHeight - 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });
  const hasMovedRef = useRef(false);

  const initialGreeting = {
    id: 1,
    sender: 'bot',
    text: "Namaste Citizen! I am your JanSeva Civic AI Assistant. Ask me to track any ticket ID (e.g. GRV-2026-8910), check statutory SLA timelines, diagnose civic problems (water, road, electricity), or view required documents for government certificates.",
    actions: [
      { label: 'Track Ticket', type: 'navigate-track', icon: 'Search' },
      { label: 'Explore Services', type: 'navigate-services', icon: 'FileText' },
      { label: 'Lodge Grievance', type: 'lodge', icon: 'PlusCircle' }
    ],
    time: 'Just now'
  };

  const defaultSuggestions = [
    'Track #GRV-2026-8910',
    'Water & Drainage SLA?',
    'Birth certificate documents?',
    'Pothole on main road',
    'Emergency safety helpline?'
  ];

  // Chat conversation state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([initialGreeting]);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Keep bot within screen bounds on resize
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

  // Save bot position
  useEffect(() => {
    localStorage.setItem('janseva_bot_position', JSON.stringify(position));
  }, [position]);

  // Drag handlers for Mouse
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
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

  // Drag handlers for Touch (mobile/tablet)
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

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(16, dragStartRef.current.initialPosX + dx), window.innerWidth - 76);
      const newY = Math.min(Math.max(16, dragStartRef.current.initialPosY + dy), window.innerHeight - 76);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(16, dragStartRef.current.initialPosX + dx), window.innerWidth - 76);
      const newY = Math.min(Math.max(16, dragStartRef.current.initialPosY + dy), window.innerHeight - 76);

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
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

  const handleActionClick = (action) => {
    if (!action) return;
    switch (action.type) {
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
    setMessages([initialGreeting]);
    setSuggestions(defaultSuggestions);
    setChatInput('');
  };

  const handleSendMessage = (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : chatInput).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (typeof textToSend !== 'string') {
      setChatInput('');
    }

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
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.text,
          actions: response.actions || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (response.followUps && response.followUps.length > 0) {
        setSuggestions(response.followUps);
      }
    }, 450);
  };

  const renderActionIcon = (iconName) => {
    switch (iconName) {
      case 'Search':
        return <Search size={13} />;
      case 'FileText':
        return <FileText size={13} />;
      case 'PlusCircle':
        return <PlusCircle size={13} />;
      case 'Phone':
        return <Phone size={13} />;
      case 'MessageSquare':
        return <MessageSquare size={13} />;
      default:
        return <ArrowRight size={13} />;
    }
  };

  // Calculate chat window position to stay on screen
  const chatWindowStyle = {
    position: 'fixed',
    bottom: position.y > window.innerHeight / 2 ? 'auto' : `${window.innerHeight - position.y + 10}px`,
    top: position.y > window.innerHeight / 2 ? `${Math.max(16, position.y - 490)}px` : 'auto',
    left: position.x > window.innerWidth / 2 ? `${Math.max(16, position.x - 360)}px` : `${position.x}px`,
    width: '380px',
    maxWidth: 'calc(100vw - 32px)',
    height: '490px',
    maxHeight: 'calc(100vh - 40px)',
    zIndex: 1100
  };

  return (
    <>
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
          <span>AI Help (Movable)</span>
        </div>
      </div>

      {/* Floating Interactive Chat Window */}
      {isOpen && (
        <div className="floating-chat-popup glass-card" style={chatWindowStyle}>
          {/* Header */}
          <div className="chat-popup-header">
            <div className="chat-header-info">
              <div className="chat-avatar-box">
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <h4 className="chat-title">JanSeva Civic AI</h4>
                <span className="chat-subtitle">Context-Aware Triage & SLA Engine</span>
              </div>
            </div>

            <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  {renderFormattedContent(m.text)}

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

            {isTyping && (
              <div className="chat-bubble-row bot-row">
                <div className="chat-msg-avatar">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble bot-bubble typing-bubble">
                  <span>Assistant is analyzing municipal ledger...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(chatInput);
            }} 
            className="chat-input-form"
          >
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask anything or enter Ticket ID (e.g. GRV-2026-8910)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={!chatInput.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

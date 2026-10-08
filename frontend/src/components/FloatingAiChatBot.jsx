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
  Move
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FloatingAiChatBot({ onTrackTicket, onOpenGrievanceModal }) {
  const { t } = useLanguage();
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

  // Chat conversation state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello Citizen! I am your JanSeva Civic Assistant. Ask any question, track your ticket status, check required certificate documents, or know SLA timelines.',
      time: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
      let reply = "I can guide you with ticket tracking, municipal services, or SLA escalation policies. Could you provide your Ticket Reference ID or department name?";
      const lower = query.toLowerCase();

      if (lower.includes('grv-2026-8910')) {
        reply = "Ticket #GRV-2026-8910 Status: In Progress. Assigned Officer: Er. Rajesh Varma (Sanitation). Action: Field dredging team dispatched to 100 Feet Road, Ward 14. Target SLA: 24 Hours.";
      } else if (lower.includes('grv-2026-8904')) {
        reply = "Ticket #GRV-2026-8904 Status: Assigned. Assigned Officer: Vikram Singh (Public Works). Action: Field technician team dispatched for streetlight LED repair. Target SLA: 48 Hours.";
      } else if (lower.includes('grv-') || lower.includes('app-')) {
        reply = `Searching official ledger for ${query.toUpperCase()}... The ticket is registered in the municipal database. You can track full timeline details in the 'Track Status' tab.`;
      } else if (lower.includes('water') || lower.includes('drain') || lower.includes('sewer') || lower.includes('पानी') || lower.includes('ನೀರು')) {
        reply = "Water & Drainage Redressal: Statutory SLA resolution time is 24 to 48 hours. When lodging a complaint, upload a GPS geotagged photo for automated field dispatch.";
      } else if (lower.includes('birth') || lower.includes('certificate') || lower.includes('जन्म') || lower.includes('ಜನನ')) {
        reply = "Birth Certificate Application: Process takes 7 statutory working days. Required documents: (1) Hospital discharge slip, (2) Parents' Aadhaar identification, (3) Address proof.";
      } else if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('hazard') || lower.includes('आपात') || lower.includes('ತುರ್ತು')) {
        reply = "For urgent public safety hazards (live electrical wires, open manholes, flood logging), mark Priority as 'Urgent' or call the 24x7 Municipal Control Room at 1800-425-GOV.";
      } else if (lower.includes('reopen') || lower.includes('not fixed') || lower.includes('unsatisfied')) {
        reply = "If an issue was closed without proper resolution, you have a 7-day statutory window. Go to 'Track Status', enter your ticket ID, and click 'Issue Not Fixed? Re-open Ticket' for supervisory escalation.";
      } else if (lower.includes('helpline') || lower.includes('phone') || lower.includes('contact') || lower.includes('number')) {
        reply = "Official 24x7 Citizen Grievance Helpline: 1800-425-GOV. Nodal Officer Desk: Available Monday to Saturday 9:00 AM - 6:00 PM.";
      } else if (lower.includes('sla') || lower.includes('timeline') || lower.includes('time')) {
        reply = "Statutory SLA Timelines: Urgent Hazards (24h), Water/Drainage (48h), Streetlights (48h), Public Works (72h), Birth/Death Certificates (7-14 days).";
      }

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  // Quick suggestion chips
  const suggestions = [
    'Track #GRV-2026-8910',
    'Water & Drainage SLA?',
    'Birth certificate documents?',
    'Emergency safety helpline?',
    'How to reopen a ticket?'
  ];

  // Calculate chat window position to stay on screen
  const chatWindowStyle = {
    position: 'fixed',
    bottom: position.y > window.innerHeight / 2 ? 'auto' : `${window.innerHeight - position.y + 10}px`,
    top: position.y > window.innerHeight / 2 ? `${Math.max(16, position.y - 480)}px` : 'auto',
    left: position.x > window.innerWidth / 2 ? `${Math.max(16, position.x - 340)}px` : `${position.x}px`,
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    height: '470px',
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
                <h4 className="chat-title">JanSeva Assistant</h4>
                <span className="chat-subtitle">Live Citizen Redressal & SLA Guide</span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button 
                type="button" 
                className="chat-action-icon-btn" 
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
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
                  <p>{m.text}</p>
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
                  <span>Assistant is typing...</span>
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
              placeholder="Ask anything or enter Ticket ID..."
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

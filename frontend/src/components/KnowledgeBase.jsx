import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Bot, 
  Send, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Bell, 
  Globe,
  FileText,
  PlusCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  RotateCcw
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
          marginBottom: '3px', 
          paddingLeft: isBullet ? '6px' : '0',
          fontSize: '0.86rem',
          lineHeight: '1.45'
        }}
      >
        {renderedParts}
      </div>
    );
  });
}

export default function KnowledgeBase({ 
  faqs = [], 
  grievances = [],
  applications = [],
  services = [],
  user = null,
  searchQuery, 
  onGoBack, 
  canGoBack, 
  previousPageTitle,
  unreadNotifications,
  setShowNotifications,
  isSidebarOpen,
  onToggleSidebar,
  onTrackTicket,
  onOpenGrievanceModal,
  onOpenServiceModal,
  onNavigateServices,
  onNavigateTrack
}) {
  const { lang, setLang, t } = useLanguage();
  const [openFaqId, setOpenFaqId] = useState(faqs[0]?.id || null);
  
  const initialBotGreeting = {
    sender: 'bot',
    text: t('aiGreeting'),
    actions: [
      { label: 'Track Status', type: 'navigate-track', icon: 'Search' },
      { label: 'Lodge Grievance', type: 'lodge', icon: 'PlusCircle' },
      { label: 'Explore Services', type: 'navigate-services', icon: 'FileText' }
    ]
  };

  const defaultPrompts = [
    t('quickPrompt1'),
    t('quickPrompt2'),
    t('quickPrompt3'),
    t('quickPrompt4')
  ];

  const [chatMessages, setChatMessages] = useState([initialBotGreeting]);
  const [activePrompts, setActivePrompts] = useState(defaultPrompts);
  const [userChatInput, setUserChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // Auto-scroll chat drawer
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const filteredFaqs = faqs.filter(f => 
    !searchQuery || 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      case 'helpline':
        window.open(`tel:${action.payload || '1800425468'}`);
        break;
      default:
        break;
    }
  };

  const handleResetChat = () => {
    setChatMessages([initialBotGreeting]);
    setActivePrompts(defaultPrompts);
    setUserChatInput('');
  };

  const handleSendMessage = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : userChatInput).trim();
    if (!text) return;

    const newMessages = [...chatMessages, { sender: 'user', text }];
    setChatMessages(newMessages);
    if (typeof textToSend !== 'string') {
      setUserChatInput('');
    }

    setIsTyping(true);

    setTimeout(() => {
      const response = generateCivicAiResponse(text, {
        grievances,
        applications,
        services,
        user,
        lang
      });

      setIsTyping(false);
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: response.text,
          actions: response.actions || []
        }
      ]);

      if (response.followUps && response.followUps.length > 0) {
        setActivePrompts(response.followUps);
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

  return (
    <div className="knowledge-container animate-fade-in">
      
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
            <span>{t('Back to')} {previousPageTitle || t('Dashboard')}</span>
          </button>
          <span className="subpage-breadcrumb">JanSeva &gt; {t('Knowledge Base & FAQs')}</span>
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

      <div className="kb-grid">
        
        {/* FAQs Left Section */}
        <div className="faqs-section glass-card">
          <div className="section-title-row">
            <BookOpen size={24} className="text-blue" />
            <div>
              <h2>{t('kbTitle')}</h2>
              <p>{t('kbSubtitle')}</p>
            </div>
          </div>

          <div className="faq-list">
            {filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    className="faq-question" 
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isOpen && (
                    <div className="faq-answer animate-fade-in">
                      <p>{faq.answer}</p>
                      <span className="faq-cat-tag">Category: {faq.category}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Right Chat Drawer */}
        <div className="ai-chat-section glass-card">
          <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="ai-title-row">
              <div className="ai-avatar" style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h3>{t('aiBotTitle')}</h3>
                <span className="ai-online-tag"><Sparkles size={12} /> {t('aiBotSub')}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleResetChat}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Reset Chat"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Quick Dynamic Prompt Chips */}
          <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {activePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="chat-messages-box">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                {msg.sender === 'bot' && <Bot size={14} className="msg-bot-icon" />}
                <div>
                  {renderFormattedContent(msg.text)}

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="chat-msg-actions-row">
                      {msg.actions.map((act, aIdx) => (
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
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble bot-msg" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                <Bot size={14} className="msg-bot-icon" />
                <span>JanSeva AI is analyzing...</span>
              </div>
            )}

            <div ref={chatMessagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-input-form">
            <input 
              type="text" 
              placeholder={t('askAiPlaceholder')}
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!userChatInput.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

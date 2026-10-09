import React, { useState } from 'react';
import { BookOpen, Bot, Send, Search, ChevronDown, ChevronUp, Sparkles, HelpCircle, CheckCircle2, ArrowLeft, Bell, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function KnowledgeBase({ 
  faqs, 
  searchQuery, 
  onGoBack, 
  canGoBack, 
  previousPageTitle,
  unreadNotifications,
  setShowNotifications,
  isSidebarOpen,
  onToggleSidebar
}) {
  const { lang, setLang, t } = useLanguage();
  const [openFaqId, setOpenFaqId] = useState(faqs[0]?.id || null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: t('aiGreeting')
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  const quickPrompts = [
    t('quickPrompt1'),
    t('quickPrompt2'),
    t('quickPrompt3'),
    t('quickPrompt4')
  ];

  const filteredFaqs = faqs.filter(f => 
    !searchQuery || 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : userChatInput).trim();
    if (!text) return;

    const newMessages = [...chatMessages, { sender: 'user', text }];
    setChatMessages(newMessages);
    if (typeof textToSend !== 'string') {
      setUserChatInput('');
    }

    // Generate intelligent AI Response simulation
    setTimeout(() => {
      let botResponse = "For specific ticket tracking, please copy your Ticket ID (e.g. GRV-2026-8910) into the 'Track Status' tab.";
      const lower = text.toLowerCase();

      if (lower.includes('grv-2026-8910')) {
        botResponse = "Ticket #GRV-2026-8910 Status: 'In Progress'. Assigned to Er. Rajesh Varma (Sanitation). Dredging team dispatched. SLA Target: 24 Hours.";
      } else if (lower.includes('grv-2026-8904')) {
        botResponse = "Ticket #GRV-2026-8904 Status: 'Assigned'. Assigned to Vikram Singh (Public Works). Field technician team dispatched for streetlight LED repair.";
      } else if (lower.includes('water') || lower.includes('sewer') || lower.includes('drain') || lower.includes('पानी') || lower.includes('ನೀರು')) {
        botResponse = "Water & Drainage issues: Standard SLA is 24-48 hours. Please lodge a complaint under 'Water Supply & Sanitation' with Ward details.";
      } else if (lower.includes('birth') || lower.includes('certificate') || lower.includes('जन्म') || lower.includes('ಜನನ')) {
        botResponse = "Birth Certificates take 7 SLA working days. Documents needed: (1) Hospital birth card, (2) Parents' Aadhaar Card, (3) Address proof.";
      } else if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('आपात') || lower.includes('ತುರ್ತು')) {
        botResponse = "For urgent public safety hazards (flooding, exposed high-voltage cables), set Priority to 'Urgent' or call 24x7 Helpline: 1800-425-GOV.";
      } else if (lower.includes('reopen') || lower.includes('not fixed')) {
        botResponse = "If your ticket was marked resolved but the problem persists, go to 'Track Status', enter your ticket ID, and click 'Issue Not Fixed? Re-open Ticket'.";
      } else if (lower.includes('track')) {
        botResponse = "To track any request, navigate to the 'Track Status & Resolution' tab and enter your Ticket Reference ID.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 500);
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
            <span>Back to {previousPageTitle || 'Dashboard'}</span>
          </button>
          <span className="subpage-breadcrumb">JanSeva &gt; Knowledge Base &amp; FAQs</span>
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
          <div className="ai-header">
            <div className="ai-title-row">
              <div className="ai-avatar" style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h3>{t('aiBotTitle')}</h3>
                <span className="ai-online-tag"><Sparkles size={12} /> {t('aiBotSub')}</span>
              </div>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
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
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-input-form">
            <input 
              type="text" 
              placeholder={t('askAiPlaceholder')}
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

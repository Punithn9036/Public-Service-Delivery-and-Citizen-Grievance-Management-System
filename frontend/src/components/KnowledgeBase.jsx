import React, { useState } from 'react';
import { BookOpen, Bot, Send, Search, ChevronDown, ChevronUp, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function KnowledgeBase({ faqs, searchQuery }) {
  const [openFaqId, setOpenFaqId] = useState(faqs[0]?.id || null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am JanSeva AI Assistant. Ask me anything about citizen service SLAs, required documents, or paste your Ticket ID (e.g. GRV-2026-8910) to look up live status!'
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  const quickPrompts = [
    'How do I track my grievance?',
    'What documents are needed for a Birth Certificate?',
    'What is the SLA deadline for Drainage overflow?',
    'How do I re-open an unresolved ticket?'
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
        botResponse = "📋 Ticket #GRV-2026-8910 Status: 'In Progress'. Assigned to Er. Rajesh Varma (Sanitation). Dredging team dispatched. SLA Target: 24 Hours.";
      } else if (lower.includes('grv-2026-8904')) {
        botResponse = "📋 Ticket #GRV-2026-8904 Status: 'Assigned'. Assigned to Vikram Singh (Public Works). Field technician team dispatched for streetlight LED repair.";
      } else if (lower.includes('water') || lower.includes('sewer') || lower.includes('drain')) {
        botResponse = "💧 For Water & Drainage issues: Standard SLA is 24-48 hours. Please lodge a complaint under 'Water Supply & Sanitation' with Ward details.";
      } else if (lower.includes('birth') || lower.includes('certificate') || lower.includes('document')) {
        botResponse = "📜 Birth Certificates take 7 SLA working days. Documents needed: (1) Hospital birth card, (2) Parents' Aadhaar Card, (3) Address proof.";
      } else if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('danger')) {
        botResponse = "🚨 For urgent public safety hazards (flooding, exposed high-voltage cables), set Priority to 'Urgent' or call 24x7 Helpline: 1800-425-GOV.";
      } else if (lower.includes('reopen') || lower.includes('not fixed')) {
        botResponse = "🔄 If your ticket was marked resolved but the problem persists, go to 'Track Status', enter your ticket ID, and click 'Issue Not Fixed? Re-open Ticket'.";
      } else if (lower.includes('track')) {
        botResponse = "🔍 To track any request, navigate to the 'Track Status & Resolution' tab and enter your Ticket Reference ID.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 500);
  };

  return (
    <div className="knowledge-container animate-fade-in">
      
      <div className="kb-grid">
        
        {/* FAQs Left Section */}
        <div className="faqs-section glass-card">
          <div className="section-title-row">
            <BookOpen size={24} className="text-blue" />
            <div>
              <h2>Citizen Knowledge Base & FAQs</h2>
              <p>Official guidelines, SLA timelines, and procedure documents</p>
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
                <h3>JanSeva AI Assistant</h3>
                <span className="ai-online-tag"><Sparkles size={12} /> Instant 24x7 Help Bot</span>
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
              placeholder="Ask AI e.g. How long does a birth certificate take?"
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

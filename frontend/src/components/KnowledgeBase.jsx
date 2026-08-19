import React, { useState } from 'react';
import { HelpCircle, Bot, Send, Search, ChevronDown, ChevronUp, Sparkles, BookOpen, ShieldAlert } from 'lucide-react';

export default function KnowledgeBase({ faqs, searchQuery }) {
  const [openFaqId, setOpenFaqId] = useState(faqs[0]?.id || null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am JanSeva AI Assistant. Ask me anything about citizen service SLAs, required documents, or how to lodge grievances!'
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  const filteredFaqs = faqs.filter(f => 
    !searchQuery || 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userText = userChatInput.trim();
    const newMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newMessages);
    setUserChatInput('');

    // Generate intelligent AI Response simulation
    setTimeout(() => {
      let botResponse = "For specific ticket tracking, please copy your Ticket ID (e.g. GRV-2026-8910) into the 'Track Status' tab.";
      const lower = userText.toLowerCase();

      if (lower.includes('water') || lower.includes('sewer') || lower.includes('drain')) {
        botResponse = "For Water & Drainage issues: Standard SLA is 24-48 hours. Please lodge a complaint under 'Water Supply & Sanitation' department with your ward details.";
      } else if (lower.includes('birth') || lower.includes('certificate') || lower.includes('document')) {
        botResponse = "Birth Certificates take 7 SLA working days. Documents needed: (1) Hospital discharge card, (2) Parents' Aadhaar Card, (3) Residence proof.";
      } else if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('danger')) {
        botResponse = "🚨 For urgent public safety hazards (flooding, exposed high-voltage cables, major sewer breach), please set Priority to 'Urgent' or call 24x7 Helpline: 1800-425-GOV (468).";
      } else if (lower.includes('reopen') || lower.includes('not fixed')) {
        botResponse = "If your ticket was marked resolved but the problem persists, go to 'Track Status', enter your ticket ID, and click 'Re-open Ticket' within 7 days.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
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
              <div className="ai-avatar">
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h3>JanSeva AI Assistant</h3>
                <span className="ai-online-tag"><Sparkles size={12} /> Instant Help Bot</span>
              </div>
            </div>
          </div>

          <div className="chat-messages-box">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                {msg.sender === 'bot' && <Bot size={14} className="msg-bot-icon" />}
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
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

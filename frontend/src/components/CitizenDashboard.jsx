import React, { useState } from 'react';
import { 
  FilePlus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Filter, 
  Zap, 
  FileText, 
  Droplets, 
  Building2, 
  Award, 
  Home, 
  ExternalLink, 
  MessageSquareCheck,
  Database,
  Flame,
  UserCheck,
  Calendar,
  Globe,
  HelpCircle,
  Eye,
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import govHeroBg from '../assets/gov-hero-bg.png';

const ICON_MAP = {
  FileText: FileText,
  Droplets: Droplets,
  Building2: Building2,
  Award: Award,
  Home: Home,
  Zap: Zap
};

// Majestic Vector Representation of State Emblem of India (Ashoka Lion Capital & Satyameva Jayate)
function NationalEmblem({ size = 72, className = '' }) {
  return (
    <div className={`national-emblem-wrap ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 1.15} viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="State Emblem of India">
        <defs>
          <linearGradient id="emblemGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4C2" />
            <stop offset="50%" stopColor="#E6C665" />
            <stop offset="100%" stopColor="#C49A2D" />
          </linearGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(235, 125, 0, 0.45)" />
          </filter>
        </defs>

        {/* Outer Glow Halo */}
        <circle cx="50" cy="46" r="38" fill="url(#emblemGoldGrad)" opacity="0.12" />

        {/* Center Lion Head */}
        <path d="M42 20C42 15 45 10 50 10C55 10 58 15 58 20C58 24 55 27 50 27C45 27 42 24 42 20Z" fill="url(#emblemGoldGrad)" filter="url(#goldGlow)" />
        <path d="M44 26C38 28 36 34 38 41C40 46 45 48 50 48C55 48 60 46 62 41C64 34 62 28 56 26" stroke="url(#emblemGoldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        
        {/* Left Lion Profile */}
        <path d="M28 26C24 28 22 34 25 40C28 45 34 47 38 45" stroke="url(#emblemGoldGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M31 22C28 22 25 24 25 28C25 31 28 33 32 32" stroke="url(#emblemGoldGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Right Lion Profile */}
        <path d="M72 26C76 28 78 34 75 40C72 45 66 47 62 45" stroke="url(#emblemGoldGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M69 22C72 22 75 24 75 28C75 31 72 33 68 32" stroke="url(#emblemGoldGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Lion Chest & Manes */}
        <path d="M46 36L44 44M54 36L56 44M50 34V46M35 34L32 42M65 34L68 42" stroke="url(#emblemGoldGrad)" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Abacus Platform Base */}
        <rect x="20" y="52" width="60" height="12" rx="3" fill="url(#emblemGoldGrad)" opacity="0.9" />
        
        {/* Central Ashoka Chakra in Abacus */}
        <circle cx="50" cy="58" r="4.5" stroke="#1E293B" strokeWidth="1.2" fill="#FFFFFF" />
        <circle cx="50" cy="58" r="1.2" fill="#1E293B" />
        {/* Chakra Spokes */}
        <path d="M50 53.5V62.5M45.5 58H54.5M47 55L53 61M47 61L53 55" stroke="#1E293B" strokeWidth="0.8" />

        {/* Bull on Left, Horse on Right (Stylized) */}
        <circle cx="32" cy="58" r="2.2" fill="#1E293B" />
        <circle cx="68" cy="58" r="2.2" fill="#1E293B" />

        {/* Lotus Bell Pedestal Base */}
        <path d="M25 64C28 72 38 75 50 75C62 75 72 72 75 64H25Z" fill="url(#emblemGoldGrad)" opacity="0.85" />
        <path d="M30 75H70L66 79H34L30 75Z" fill="url(#emblemGoldGrad)" />

        {/* Satyameva Jayate Banner */}
        <rect x="16" y="84" width="68" height="12" rx="2" fill="#111827" stroke="url(#emblemGoldGrad)" strokeWidth="1" />
        <text x="50" y="93" fill="#FFF4C2" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="0.8" fontFamily="'Plus Jakarta Sans', sans-serif">
          सत्यमेव जयते
        </text>
      </svg>
    </div>
  );
}

export default function CitizenDashboard({
  grievances,
  services,
  applications,
  openGrievanceModal,
  openServiceModal,
  setActiveTab,
  selectGrievanceToTrack,
  searchQuery,
  setSearchQuery,
  isSidebarOpen,
  onToggleSidebar
}) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [viewScope, setViewScope] = useState('all'); // 'all' | 'my'
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  // Compute Statistics
  const totalGrievances = grievances.length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress' || g.status === 'Assigned').length;
  const urgentCount = grievances.filter(g => g.priority === 'Urgent' && g.status !== 'Resolved').length;
  const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;

  // Filtered grievances list
  const filteredGrievances = grievances.filter(item => {
    if (viewScope === 'my' && user) {
      const matchName = item.citizenName && user.fullName && item.citizenName.toLowerCase().includes(user.fullName.toLowerCase());
      const matchPhone = item.citizenPhone && user.phone && item.citizenPhone === user.phone;
      if (!matchName && !matchPhone) return false;
    }
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || item.department === departmentFilter;
    const effectiveSearch = searchQuery || localSearch;
    const matchesSearch = !effectiveSearch || 
      item.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.department.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.location.toLowerCase().includes(effectiveSearch.toLowerCase());
    return matchesStatus && matchesDepartment && matchesSearch;
  });

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery(localSearch);
    }
    // Scroll down smoothly to search results if searching
    if (localSearch.trim()) {
      const resultsElem = document.getElementById('citizen-grievances-section');
      if (resultsElem) {
        resultsElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTrendingClick = (term, directAction = null) => {
    if (directAction === 'modal-grievance') {
      openGrievanceModal();
      return;
    }
    if (directAction === 'tab-track') {
      setActiveTab('track');
      return;
    }
    if (directAction === 'tab-services') {
      setActiveTab('services');
      return;
    }
    if (directAction === 'modal-birth') {
      const birthService = services.find(s => s.id === 'srv-1');
      if (birthService) {
        openServiceModal(birthService);
        return;
      }
    }
    setLocalSearch(term);
    if (setSearchQuery) {
      setSearchQuery(term);
    }
    const resultsElem = document.getElementById('citizen-grievances-section');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getSlaBadge = (item) => {
    if (!item.slaDeadline) return null;
    if (item.status === 'Resolved') return null;
    const deadline = new Date(item.slaDeadline).getTime();
    const diffHours = Math.round((deadline - Date.now()) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return (
        <span style={{ fontSize: '0.7rem', color: '#dc2626', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <AlertTriangle size={11} /> Overdue by {Math.abs(diffHours)}h
        </span>
      );
    } else if (diffHours <= 24) {
      return (
        <span style={{ fontSize: '0.7rem', color: '#ea580c', background: 'rgba(234,88,12,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Flame size={11} /> {diffHours}h left
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.7rem', color: '#2563eb', background: 'rgba(37,99,235,0.08)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
        {Math.ceil(diffHours / 24)}d left
      </span>
    );
  };

  return (
    <div className="dashboard-content animate-fade-in" style={{ padding: 0 }}>

      {/* ========================================================================= */}
      {/* 1. GRAND GOVERNMENT HERO BANNER (INDIA.GOV.IN STYLE WITH RASHTRAPATI BG) */}
      {/* ========================================================================= */}
      <div 
        className="india-gov-hero-section"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 18, 35, 0.25) 0%, rgba(10, 18, 35, 0.42) 50%, rgba(10, 18, 35, 0.70) 100%), url(${govHeroBg})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat'
        }}
      >

        {/* Hero Main Core Content */}
        <div className="hero-center-content">
          
          {/* Emblem of India */}
          <div className="hero-emblem-container animate-float-subtle">
            <NationalEmblem size={72} />
          </div>

          {/* Majestic Portal Title */}
          <h1 className="hero-portal-title">
            janseva<span className="hero-gov-dot">.gov.in</span>
          </h1>

          {/* Central India.gov.in Style Search Bar */}
          <form onSubmit={handleHeroSearchSubmit} className="hero-search-wrapper">
            <div className="hero-search-input-box">
              <Search size={18} className="hero-search-icon" />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder') || 'Search for public services, schemes, ticket status, or municipal wards...'} 
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  if (setSearchQuery) setSearchQuery(e.target.value);
                }}
                className="hero-search-input"
              />
            </div>

            <div className="hero-search-cat-dropdown">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="hero-category-select"
              >
                <option value="All Categories">All Categories</option>
                <option value="Grievances">Citizen Grievances</option>
                <option value="Public Services">Public Services</option>
                <option value="Certificates">Certificates & Revenue</option>
                <option value="Municipal">Municipal & Roads</option>
                <option value="Health">Water & Sanitation</option>
              </select>
            </div>

            <button type="submit" className="hero-search-submit-btn">
              <span>Search</span>
            </button>
          </form>

          {/* Trending / Fast-Track Searches Row */}
          <div className="hero-trending-row">
            <span className="trending-label">Trending Searches:</span>
            <div className="trending-chips-wrap">
              <button 
                type="button" 
                className="trending-chip highlight-chip"
                onClick={() => handleTrendingClick('', 'modal-grievance')}
              >
                <FilePlus size={12} />
                <span>+ Lodge Grievance</span>
              </button>

              <button 
                type="button" 
                className="trending-chip"
                onClick={() => handleTrendingClick('', 'tab-track')}
              >
                <Clock size={12} />
                <span>Track Ticket</span>
              </button>

              <button 
                type="button" 
                className="trending-chip"
                onClick={() => handleTrendingClick('pothole')}
              >
                <span>Pothole Repair</span>
              </button>

              <button 
                type="button" 
                className="trending-chip"
                onClick={() => handleTrendingClick('water')}
              >
                <span>Water Supply</span>
              </button>

              <button 
                type="button" 
                className="trending-chip"
                onClick={() => handleTrendingClick('', 'modal-birth')}
              >
                <span>Birth Certificate</span>
              </button>

              <button 
                type="button" 
                className="trending-chip"
                onClick={() => handleTrendingClick('streetlight')}
              >
                <span>Streetlight Outage</span>
              </button>
            </div>
          </div>

        </div>

        {/* Scroll Down Arrow Indicator Button */}
        <div className="hero-scroll-down-container">
          <button 
            type="button" 
            className="hero-scroll-down-btn"
            onClick={() => {
              const target = document.getElementById('citizen-services-section') || document.getElementById('citizen-grievances-section');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="Scroll down to services and grievance registry"
            title="Scroll down to explore services & grievances"
          >
            <div className="scroll-arrow-circle">
              <ChevronDown size={26} className="bouncing-arrow" />
            </div>
            <span className="scroll-arrow-label">Explore Services & Grievances</span>
          </button>
        </div>

      </div>

      {/* Main Inner Container for Dashboard Sections */}
      <div className="dashboard-inner-wrap" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Quick Statutory SLA Compliance Alert Card */}
        <div className="gov-sla-bar-strip">
          <div className="gov-sla-strip-left">
            <ShieldCheck size={20} className="text-brand-green" />
            <div>
              <strong>Time-Bound Public Service Delivery Act (GIGW 3.0 Standard)</strong>
              <p className="text-muted small-text" style={{ margin: 0 }}>
                Every grievance is assigned a statutory SLA deadline. Breached cases auto-escalate directly to Senior Zonal Commissioners.
              </p>
            </div>
          </div>
          <div className="gov-sla-strip-right">
            <div className="sla-rate-pill">
              <span className="small-text">SLA Redressal Rate:</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--brand-700)' }}>{resolutionRate}%</strong>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openGrievanceModal}>
              <FilePlus size={15} />
              <span>{t('lodgeGrievance')}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. POPULAR PUBLIC SERVICES CATALOG */}
        {/* ========================================================================= */}
        <div className="section-block" id="citizen-services-section" style={{ marginTop: '28px' }}>
          <div className="section-header">
            <div>
              <h2>{t('popularServices')}</h2>
              <p>Direct online applications with guaranteed Service Level Agreements (SLAs)</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('services')}>
              View All Services ({services.length})
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="services-grid">
            {services.filter(s => s.popular).map(service => {
              const IconComponent = ICON_MAP[service.icon] || FileText;
              return (
                <div key={service.id} className="service-card glass-card">
                  <div className="service-header">
                    <div className="service-icon-box">
                      <IconComponent size={22} />
                    </div>
                    <span className="sla-pill">{service.slaDays} Days SLA</span>
                  </div>
                  <h3>{service.name}</h3>
                  <p className="service-dept">{service.department}</p>
                  <p className="service-desc">{service.description}</p>
                  <div className="service-footer">
                    <span className="service-fee">Fee: <strong>{service.fee}</strong></span>
                    <button className="btn btn-primary btn-sm" onClick={() => openServiceModal(service)}>
                      {t('applyNow')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. RECENT CITIZEN GRIEVANCES & LIVE RESOLUTION REGISTRY */}
        {/* ========================================================================= */}
        <div className="section-block" id="citizen-grievances-section" style={{ marginTop: '36px' }}>
          <div className="section-header">
            <div>
              <h2>{t('recentSubmissions')}</h2>
              <p>Track grievances submitted across municipal wards and inspect officer resolution updates</p>
            </div>

            {/* Scope Toggle: All Wards vs My Grievances */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className={`btn-sm ${viewScope === 'all' ? 'btn btn-primary' : 'btn'}`}
                  style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '4px 10px', border: 'none' }}
                  onClick={() => setViewScope('all')}
                >
                  {t('allWards')} ({grievances.length})
                </button>
                <button
                  type="button"
                  className={`btn-sm ${viewScope === 'my' ? 'btn btn-primary' : 'btn'}`}
                  style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '4px 10px', border: 'none' }}
                  onClick={() => setViewScope('my')}
                >
                  {t('mySubmissions')}
                </button>
              </div>

              {/* Status Filter */}
              <div className="filter-controls">
                <div className="select-wrapper">
                  <Filter size={14} className="select-icon" />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">{t('allStatuses')}</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Table / Cards */}
          {filteredGrievances.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '36px', textAlign: 'center' }}>
              <FileText size={48} className="empty-icon" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3>No matching grievances found</h3>
              <p className="text-muted small-text">Try adjusting your search query or status filters above.</p>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setLocalSearch('');
                  if (setSearchQuery) setSearchQuery('');
                  setStatusFilter('All');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grievance-cards-list">
              {filteredGrievances.map(item => (
                <div key={item.id} className="grievance-card glass-card">
                  <div className="g-card-header">
                    <div className="g-id-badge">
                      <span className="g-id-bold">{item.id}</span>
                      <span className={`priority-tag priority-${item.priority.toLowerCase()}`}>
                        {item.priority} Priority
                      </span>
                      {getSlaBadge(item)}
                      {item.reportCount > 1 && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(235,125,0,0.12)', color: '#eb7d00', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          +{item.reportCount - 1} Citizens Affected
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.ipfsDocumentCid && (
                        <span style={{ fontSize: '0.7rem', color: '#2563eb', background: 'rgba(37,99,235,0.08)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Database size={11} /> IPFS Proof
                        </span>
                      )}
                      <span className={`badge badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        <span className="pulse-dot" />
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="g-title">{item.title}</h3>
                  <p className="g-desc">{item.description}</p>

                  <div className="g-meta-grid">
                    <div>
                      <span className="meta-label">Department</span>
                      <span className="meta-value">{item.department}</span>
                    </div>
                    <div>
                      <span className="meta-label">Location / Ward</span>
                      <span className="meta-value">{item.location}</span>
                    </div>
                    <div>
                      <span className="meta-label">Officer Assigned</span>
                      <span className="meta-value">{item.assignedOfficer || 'Pending Dispatch'}</span>
                    </div>
                    <div>
                      <span className="meta-label">Submitted On</span>
                      <span className="meta-value">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="g-card-footer">
                    {item.feedback ? (
                      <span className="feedback-done-tag">
                        <MessageSquareCheck size={14} /> Citizen Feedback Submitted ({item.feedback.rating}/5 Stars)
                      </span>
                    ) : (
                      <span className="g-sla-info">SLA Target Date: <strong>{new Date(item.slaDeadline).toLocaleDateString()}</strong></span>
                    )}

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        selectGrievanceToTrack(item.id);
                        setActiveTab('track');
                      }}
                    >
                      {t('trackProgress')}
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

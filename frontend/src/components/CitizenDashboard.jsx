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
  ChevronDown,
  TrendingUp,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import govHeroBg from '../assets/gov-hero-bg.png';
import nationalEmblemImg from '../assets/national-emblem.webp';

const ICON_MAP = {
  FileText: FileText,
  Droplets: Droplets,
  Building2: Building2,
  Award: Award,
  Home: Home,
  Zap: Zap
};

// High-Fidelity Vector Representation of State Emblem of India (Ashoka Lion Capital & Satyameva Jayate)
function NationalEmblem({ size = 84, className = '' }) {
  return (
    <div className={`national-emblem-wrap ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg 
        width={size} 
        height={size * 1.25} 
        viewBox="0 0 120 150" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        role="img"
        aria-label="State Emblem of India"
      >
        <defs>
          {/* Rich Regal Gold Gradients */}
          <linearGradient id="emblemGoldRegal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="25%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#E5B842" />
            <stop offset="75%" stopColor="#C89620" />
            <stop offset="100%" stopColor="#8C6007" />
          </linearGradient>

          <linearGradient id="emblemGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5B842" />
            <stop offset="100%" stopColor="#684203" />
          </linearGradient>

          <linearGradient id="chakraBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0B192C" />
          </linearGradient>

          <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0, 0, 0, 0.6)" />
          </filter>
        </defs>

        <g filter="url(#emblemGlow)">
          {/* Subtle Ambient Radial Backlight */}
          <circle cx="60" cy="50" r="42" fill="url(#emblemGoldRegal)" opacity="0.16" />

          {/* ================= 1. CENTRAL LION (FRONT) ================= */}
          {/* Crown & Forehead */}
          <path d="M50 14C50 8 55 5 60 5C65 5 70 8 70 14C70 18 67 21 60 21C53 21 50 18 50 14Z" fill="url(#emblemGoldRegal)" />
          {/* Ears */}
          <path d="M48 10C44 7 42 12 46 15" stroke="url(#emblemGoldRegal)" strokeWidth="2.5" strokeLinecap="round" fill="url(#emblemGoldDark)" />
          <path d="M72 10C76 7 78 12 74 15" stroke="url(#emblemGoldRegal)" strokeWidth="2.5" strokeLinecap="round" fill="url(#emblemGoldDark)" />
          {/* Eyes & Brow Arch */}
          <path d="M52 18Q60 22 68 18" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="55" cy="18.5" r="1.3" fill="#451A03" />
          <circle cx="65" cy="18.5" r="1.3" fill="#451A03" />
          {/* Snout & Muzzle */}
          <path d="M57 20H63L61 24H59L57 20Z" fill="#5C2605" />
          <path d="M56 24Q60 28 64 24" stroke="url(#emblemGoldRegal)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Open Jaws & Whiskers */}
          <path d="M57 26H63V28C63 29.5 61.5 31 60 31C58.5 31 57 29.5 57 28V26Z" fill="#8C3A00" stroke="url(#emblemGoldRegal)" strokeWidth="1" />
          {/* Mane Curls (Front Lion) */}
          <path d="M50 23C44 26 42 34 45 42C47 48 53 52 60 52C67 52 73 48 75 42C78 34 76 26 70 23" stroke="url(#emblemGoldRegal)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M53 32L49 42M67 32L71 42M57 32V47M63 32V47M60 30V49" stroke="url(#emblemGoldRegal)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M46 36Q52 44 60 44Q68 44 74 36" stroke="url(#emblemGoldDark)" strokeWidth="1.5" fill="none" />

          {/* ================= 2. LEFT LION (PROFILE) ================= */}
          {/* Head & Ear */}
          <path d="M33 16C28 16 25 21 27 26C29 30 35 32 39 29" stroke="url(#emblemGoldRegal)" strokeWidth="2.5" strokeLinecap="round" fill="url(#emblemGoldDark)" />
          <path d="M28 14C25 12 22 17 25 19" stroke="url(#emblemGoldRegal)" strokeWidth="2" fill="none" />
          {/* Eye & Snout */}
          <circle cx="29" cy="21" r="1.2" fill="#451A03" />
          <path d="M24 23L21 26L25 27" stroke="url(#emblemGoldRegal)" strokeWidth="1.8" strokeLinecap="round" fill="url(#emblemGoldDark)" />
          {/* Mane Profile */}
          <path d="M37 28C31 32 28 38 31 46C33 50 39 53 45 52" stroke="url(#emblemGoldRegal)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M30 35L38 43M33 42L42 47" stroke="url(#emblemGoldRegal)" strokeWidth="1.5" strokeLinecap="round" />

          {/* ================= 3. RIGHT LION (PROFILE) ================= */}
          {/* Head & Ear */}
          <path d="M87 16C92 16 95 21 93 26C91 30 85 32 81 29" stroke="url(#emblemGoldRegal)" strokeWidth="2.5" strokeLinecap="round" fill="url(#emblemGoldDark)" />
          <path d="M92 14C95 12 98 17 95 19" stroke="url(#emblemGoldRegal)" strokeWidth="2" fill="none" />
          {/* Eye & Snout */}
          <circle cx="91" cy="21" r="1.2" fill="#451A03" />
          <path d="M96 23L99 26L95 27" stroke="url(#emblemGoldRegal)" strokeWidth="1.8" strokeLinecap="round" fill="url(#emblemGoldDark)" />
          {/* Mane Profile */}
          <path d="M83 28C89 32 92 38 89 46C87 50 81 53 75 52" stroke="url(#emblemGoldRegal)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M90 35L82 43M87 42L78 47" stroke="url(#emblemGoldRegal)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Pillars & Forelegs Support */}
          <path d="M42 52L40 68M78 52L80 68M52 53L51 68M68 53L69 68" stroke="url(#emblemGoldRegal)" strokeWidth="2.2" strokeLinecap="round" />

          {/* ================= 4. CIRCULAR ABACUS PLATFORM ================= */}
          {/* Upper Trim */}
          <path d="M18 68H102L98 72H22L18 68Z" fill="url(#emblemGoldRegal)" />
          {/* Main Abacus Frieze Band */}
          <rect x="16" y="72" width="88" height="18" rx="2" fill="url(#emblemGoldRegal)" />
          <rect x="18" y="74" width="84" height="14" rx="1.5" fill="url(#emblemGoldDark)" opacity="0.6" />

          {/* Galloping Horse on Left (High-detail Stylized) */}
          <path d="M28 84C27 80 30 76 34 77C38 78 39 82 36 85M31 82L25 86M35 83L39 87" stroke="url(#emblemGoldRegal)" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* CENTRAL ASHOKA CHAKRA (24 SPOKES) */}
          <circle cx="60" cy="81" r="7.5" fill="#FFFFFF" stroke="url(#chakraBlue)" strokeWidth="1.6" />
          <circle cx="60" cy="81" r="2" fill="url(#chakraBlue)" />
          {/* Precise 24-Spoke Radial Wheel */}
          <path d="M60 74.5V87.5M53.5 81H66.5M55.4 76.4L64.6 85.6M55.4 85.6L64.6 76.4" stroke="url(#chakraBlue)" strokeWidth="0.8" />
          <path d="M57.8 74.9L62.2 87.1M54.9 77.8L65.1 84.2M54.9 84.2L65.1 77.8M57.8 87.1L62.2 74.9" stroke="url(#chakraBlue)" strokeWidth="0.6" />

          {/* Charging Bull on Right (High-detail Stylized) */}
          <path d="M86 84C89 80 93 79 95 82C96 85 91 86 88 85M87 84L84 87M93 84L96 87" stroke="url(#emblemGoldRegal)" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* Lower Abacus Beading */}
          <path d="M16 90H104L100 94H20L16 90Z" fill="url(#emblemGoldRegal)" />

          {/* ================= 5. BELL-SHAPED LOTUS PEDESTAL ================= */}
          <path d="M24 94C28 107 42 112 60 112C78 112 92 107 96 94H24Z" fill="url(#emblemGoldRegal)" opacity="0.95" />
          {/* Lotus Petal Ridges */}
          <path d="M34 94C38 104 46 109 60 109C74 109 82 104 86 94" stroke="url(#emblemGoldDark)" strokeWidth="1.5" fill="none" />
          <path d="M44 94Q50 106 60 106Q70 106 76 94" stroke="url(#emblemGoldDark)" strokeWidth="1.2" fill="none" />
          <path d="M60 94V111M48 94L52 108M72 94L68 108" stroke="url(#emblemGoldDark)" strokeWidth="1" />

          {/* Lotus Base Step */}
          <rect x="28" y="112" width="64" height="4" rx="1.5" fill="url(#emblemGoldRegal)" />

          {/* ================= 6. SATYAMEVA JAYATE BANNER ================= */}
          <rect x="10" y="122" width="100" height="19" rx="3" fill="#0B132B" stroke="url(#emblemGoldRegal)" strokeWidth="1.6" />
          <rect x="12" y="124" width="96" height="15" rx="2" fill="rgba(245, 215, 127, 0.08)" />

          {/* Satyameva Jayate (सत्यमेव जयते) Inscription */}
          <text 
            x="60" 
            y="135" 
            fill="#FFF9E6" 
            fontSize="9" 
            fontWeight="900" 
            textAnchor="middle" 
            letterSpacing="1.2" 
            fontFamily="'Noto Sans Devanagari', 'Yatra One', 'Mukta', 'Plus Jakarta Sans', sans-serif"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            सत्यमेव जयते
          </text>
        </g>
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
  activeTab,
  setActiveTab,
  selectGrievanceToTrack,
  searchQuery,
  setSearchQuery,
  isSidebarOpen,
  onToggleSidebar,
  onGoBack,
  canGoBack
}) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [viewScope, setViewScope] = useState('all'); // 'all' | 'my'
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  // Compute Statistics safely
  const grievanceList = Array.isArray(grievances) ? grievances : [];
  const serviceList = Array.isArray(services) ? services : [];
  const totalGrievances = grievanceList.length;
  const resolvedCount = grievanceList.filter(g => g && g.status === 'Resolved').length;
  const inProgressCount = grievanceList.filter(g => g && (g.status === 'In Progress' || g.status === 'Assigned')).length;
  const urgentCount = grievanceList.filter(g => g && g.priority === 'Urgent' && g.status !== 'Resolved').length;
  const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;

  // Filtered grievances list safely
  const filteredGrievances = grievanceList.filter(item => {
    if (!item) return false;
    if (viewScope === 'my' && user) {
      const matchName = item.citizenName && user.fullName && item.citizenName.toLowerCase().includes(user.fullName.toLowerCase());
      const matchPhone = item.citizenPhone && user.phone && item.citizenPhone === user.phone;
      if (!matchName && !matchPhone) return false;
    }
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || item.department === departmentFilter;
    const effectiveSearch = (searchQuery || localSearch || '').toLowerCase().trim();
    if (!effectiveSearch) return matchesStatus && matchesDepartment;

    const matchId = item.id ? String(item.id).toLowerCase().includes(effectiveSearch) : false;
    const matchTitle = item.title ? String(item.title).toLowerCase().includes(effectiveSearch) : false;
    const matchCategory = item.category ? String(item.category).toLowerCase().includes(effectiveSearch) : false;
    const matchDept = item.department ? String(item.department).toLowerCase().includes(effectiveSearch) : false;
    const matchLoc = item.location ? String(item.location).toLowerCase().includes(effectiveSearch) : false;
    const matchDesc = item.description ? String(item.description).toLowerCase().includes(effectiveSearch) : false;

    return matchesStatus && matchesDepartment && (matchId || matchTitle || matchCategory || matchDept || matchLoc || matchDesc);
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
      openGrievanceModal && openGrievanceModal();
      return;
    }
    if (directAction === 'tab-track') {
      setActiveTab && setActiveTab('track');
      return;
    }
    if (directAction === 'tab-services') {
      setActiveTab && setActiveTab('services');
      return;
    }
    if (directAction === 'modal-birth') {
      const birthService = serviceList.find(s => s && s.id === 'srv-1');
      if (birthService) {
        openServiceModal && openServiceModal(birthService);
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
    if (!item || !item.slaDeadline) return null;
    if (item.status === 'Resolved') return null;
    const deadline = new Date(item.slaDeadline).getTime();
    if (isNaN(deadline)) return null;
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
          backgroundAttachment: 'scroll',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat'
        }}
      >

        {/* Hero Main Core Content */}
        <div className="hero-center-content">
          
          {/* State Emblem of India (Uploaded Official Lion Capital & Satyameva Jayate) */}
          <div className="hero-emblem-container animate-float-subtle">
            <img 
              src={nationalEmblemImg} 
              alt="State Emblem of India" 
              className="hero-emblem-img"
            />
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

        {/* Top Contextual Back Bar & Breadcrumb (when on Services Tab) */}
        {canGoBack && activeTab === 'services' && (
          <div className="subpage-back-bar" style={{ marginBottom: '20px' }}>
            <button 
              type="button" 
              className="subpage-back-btn" 
              onClick={onGoBack}
              title="Return to Overview Dashboard"
            >
              <ArrowLeft size={16} />
              <span>Back to Overview Dashboard</span>
            </button>
            <span className="subpage-breadcrumb">JanSeva &gt; Public Services Catalog</span>
          </div>
        )}

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
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab && setActiveTab('services')}>
              View All Services ({serviceList.length})
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="services-grid">
            {serviceList.filter(s => s && s.popular).map(service => {
              const IconComponent = (service && service.icon && ICON_MAP[service.icon]) || FileText;
              return (
                <div key={service.id || Math.random()} className="service-card glass-card">
                  <div className="service-header">
                    <div className="service-icon-box">
                      <IconComponent size={22} />
                    </div>
                    <span className="sla-pill">{service.slaDays || 3} Days SLA</span>
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

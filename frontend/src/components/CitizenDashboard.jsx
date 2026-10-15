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
  Building,
  Building2, 
  Award, 
  Home, 
  ExternalLink, 
  MessageSquareCheck,
  Database,
  Flame,
  Car,
  FileCheck2,
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
  ArrowLeft,
  Bell,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import govHeroBg from '../assets/gov-hero-bg.png';
import nationalEmblemImg from '../assets/national-emblem.webp';
import birthCertImg from '../assets/service-birth-cert.jpg';
import waterConnectionImg from '../assets/service-water-connection.jpg';
import casteIncomeImg from '../assets/service-caste-income.jpg';
import tradeLicenseImg from '../assets/service-trade-license.jpg';
import propertyTaxImg from '../assets/service-property-tax.jpg';
import streetLightImg from '../assets/service-street-light.jpg';
import electricityMeterImg from '../assets/service-electricity-meter.jpg';
import lpgGasImg from '../assets/service-lpg-gas.jpg';
import seniorCitizenImg from '../assets/service-senior-citizen.jpg';
import deathCertImg from '../assets/service-death-cert.jpg';
import drivingLicenseImg from '../assets/service-driving-license.jpg';
import eKhataImg from '../assets/service-e-khata.jpg';

const ICON_MAP = {
  FileText: FileText,
  Droplets: Droplets,
  Building2: Building2,
  Building: Building,
  Award: Award,
  Home: Home,
  Zap: Zap,
  Flame: Flame,
  Car: Car,
  FileCheck2: FileCheck2
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
  canGoBack,
  unreadNotifications,
  setShowNotifications
}) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  // Dedicated "My Submissions" Viewer Modal States
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsTab, setSubmissionsTab] = useState('grievances'); // 'grievances' | 'applications'
  const [submissionsSearch, setSubmissionsSearch] = useState('');
  const [submissionsStatusFilter, setSubmissionsStatusFilter] = useState('All');

  const isCitizen = !user || user.role === 'CITIZEN';
  const isOfficer = user?.role === 'OFFICER';
  const isAdmin = user?.role === 'ADMIN';

  // Compute Statistics safely
  const grievanceList = Array.isArray(grievances) ? grievances : [];
  const serviceList = Array.isArray(services) ? services : [];
  const applicationList = Array.isArray(applications) ? applications : [];

  // Strictly identify complaints belonging to the currently logged-in citizen
  const cleanUserPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const cleanUserEmail = (user?.email || '').toLowerCase().trim();
  const cleanUserName = (user?.fullName || '').toLowerCase().trim();
  const cleanUserEmpId = (user?.employeeId || user?.userId || '').toLowerCase().trim();

  // Citizen submissions match
  const isUserGrievance = (item) => {
    if (!user || !item) return false;
    const cleanItemPhone = (item.citizenPhone || '').replace(/\D/g, '').slice(-10);
    const matchPhone = cleanUserPhone && cleanItemPhone && cleanUserPhone === cleanItemPhone;
    const matchEmail = item.citizenEmail && cleanUserEmail && item.citizenEmail.toLowerCase().trim() === cleanUserEmail;
    const matchName = item.citizenName && cleanUserName && item.citizenName.toLowerCase().trim() === cleanUserName;
    const matchUserId = item.userId && user.id && String(item.userId) === String(user.id);
    return Boolean(matchPhone || matchEmail || matchName || matchUserId);
  };

  // Citizen service applications match
  const isUserApplication = (app) => {
    if (!user || !app) return false;
    const cleanAppPhone = (app.applicantPhone || '').replace(/\D/g, '').slice(-10);
    const matchPhone = cleanUserPhone && cleanAppPhone && cleanUserPhone === cleanAppPhone;
    const matchEmail = app.applicantEmail && cleanUserEmail && app.applicantEmail.toLowerCase().trim() === cleanUserEmail;
    const matchName = app.applicantName && cleanUserName && app.applicantName.toLowerCase().trim() === cleanUserName;
    return Boolean(matchPhone || matchEmail || matchName);
  };

  const myApplications = applicationList.filter(isUserApplication);

  // Officer assignments match (only tickets assigned to THIS officer)
  const isOfficerGrievance = (item) => {
    if (!user || !item) return false;
    const assigned = (item.assignedOfficer || '').toLowerCase();
    const assignedContact = (item.assignedOfficerContact || '').replace(/\D/g, '').slice(-10);
    const matchName = cleanUserName && assigned.includes(cleanUserName);
    const matchEmpId = cleanUserEmpId && assigned.includes(cleanUserEmpId);
    const matchPhone = cleanUserPhone && assignedContact && cleanUserPhone === assignedContact;
    return Boolean(matchName || matchEmpId || matchPhone);
  };

  // Strictly partition list based on role:
  // - Citizen sees ONLY their submitted grievances (no leakage of other citizens or other officers)
  // - Officer sees ONLY their assigned workload
  // - Admin sees municipal oversight
  const currentList = isOfficer 
    ? grievanceList.filter(isOfficerGrievance)
    : isCitizen 
      ? grievanceList.filter(isUserGrievance)
      : grievanceList;

  const totalGrievances = currentList.length;
  const resolvedCount = currentList.filter(g => g && g.status === 'Resolved').length;
  const inProgressCount = currentList.filter(g => g && (g.status === 'In Progress' || g.status === 'Assigned')).length;
  const urgentCount = currentList.filter(g => g && g.priority === 'Urgent' && g.status !== 'Resolved').length;
  const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;

  // Filtered grievances list safely
  const filteredGrievances = currentList.filter(item => {
    if (!item) return false;
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

  const scrollToCard = (elementId, offset = 70) => {
    const el = document.getElementById(elementId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      el.classList.add('card-highlight-pulse');
      setTimeout(() => {
        el.classList.remove('card-highlight-pulse');
      }, 2400);
    }
  };

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    const q = localSearch.toLowerCase().trim();
    if (setSearchQuery) {
      setSearchQuery(localSearch);
    }
    if (!q) return;

    if (q.includes('birth')) {
      scrollToCard('service-card-birth-cert');
    } else if (q.includes('water') || q.includes('sewer') || q.includes('drain')) {
      scrollToCard('service-card-water');
    } else if (q.includes('caste') || q.includes('income')) {
      scrollToCard('service-card-caste-income');
    } else if (q.includes('trade') || q.includes('shop') || q.includes('license') || q.includes('business')) {
      scrollToCard('service-card-trade-license');
    } else if (q.includes('tax') || q.includes('property') || q.includes('khata') || q.includes('house')) {
      scrollToCard('service-card-property-tax');
    } else if (q.includes('light') || q.includes('street') || q.includes('lamp') || q.includes('dark')) {
      scrollToCard('service-card-street-light');
    } else if (q.includes('track') || q.includes('status') || q.includes('my submission') || q.includes('complaint')) {
      scrollToCard('citizen-grievances-section');
    } else {
      scrollToCard('citizen-services-section');
    }
  };

  const handleTrendingClick = (targetCardId, directAction = null) => {
    if (directAction === 'modal-grievance') {
      openGrievanceModal && openGrievanceModal();
      return;
    }
    if (directAction === 'tab-track') {
      scrollToCard('citizen-grievances-section');
      setShowSubmissionsModal(true);
      return;
    }
    if (targetCardId) {
      scrollToCard(targetCardId);
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
      {/* 1. GRAND GOVERNMENT HERO BANNER (ONLY ON MAIN OVERVIEW DASHBOARD) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="india-gov-hero-section">
          {/* Overhanging Hero Background Layer (Overhangs by 2cm to prevent any white edge gap when shifted) */}
          <div 
            className="hero-bg-layer"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(10, 18, 35, 0.25) 0%, rgba(10, 18, 35, 0.42) 50%, rgba(10, 18, 35, 0.70) 100%), url(${govHeroBg})`
            }}
          />

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
                  <option value="All Categories">{t('All Categories')}</option>
                  <option value="Grievances">{t('Citizen Grievances')}</option>
                  <option value="Public Services">{t('Public Services')}</option>
                  <option value="Certificates">{t('Certificates & Revenue')}</option>
                  <option value="Municipal">{t('Municipal & Roads')}</option>
                  <option value="Health">{t('Water & Sanitation')}</option>
                </select>
              </div>

              <button type="submit" className="hero-search-submit-btn">
                <span>{t('Search')}</span>
              </button>
            </form>

            {/* Trending / Fast-Track Searches Row */}
            <div className="hero-trending-row">
              <span className="trending-label">{t('Trending Searches:')}</span>
              <div className="trending-chips-wrap">
                <button 
                  type="button" 
                  className="trending-chip highlight-chip"
                  onClick={() => handleTrendingClick('', 'modal-grievance')}
                  title={t('Lodge Grievance')}
                >
                  <FilePlus size={12} />
                  <span>+ {t('Lodge Grievance')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('citizen-grievances-section', 'tab-track')}
                  title={t('Track Ticket')}
                >
                  <Clock size={12} />
                  <span>{t('Track Ticket')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('', 'modal-grievance')}
                  title={t('Pothole Repair')}
                >
                  <span>{t('Pothole Repair')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('service-card-water')}
                  title={t('Water Supply')}
                >
                  <span>{t('Water Supply')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('service-card-birth-cert')}
                  title={t('Birth Certificate')}
                >
                  <span>{t('Birth Certificate')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('service-card-street-light')}
                  title={t('Streetlight Outage')}
                >
                  <span>{t('Streetlight Outage')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('service-card-trade-license')}
                  title={t('Trade License')}
                >
                  <span>{t('Trade License')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('service-card-property-tax')}
                  title={t('Property Tax')}
                >
                  <span>{t('Property Tax')}</span>
                </button>

                <button 
                  type="button" 
                  className="trending-chip"
                  onClick={() => handleTrendingClick('service-card-caste-income')}
                  title={t('Caste Certificate')}
                >
                  <span>{t('Caste Certificate')}</span>
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
              aria-label={t('Explore More Services')}
              title={t('Explore More Services')}
            >
              <div className="scroll-arrow-circle">
                <ChevronDown size={26} className="bouncing-arrow" />
              </div>
              <span className="scroll-arrow-label">{t('Explore More Services')}</span>
            </button>
          </div>

        </div>
      )}

      {/* Main Inner Container for Dashboard Sections */}
      <div className="dashboard-inner-wrap" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Top Contextual Back Bar & Breadcrumb (when on Services Tab) */}
        {activeTab === 'services' && (
          <div className="subpage-back-bar" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="subpage-back-btn" 
                onClick={onGoBack}
                title={t('Return to Overview Dashboard')}
              >
                <ArrowLeft size={16} />
                <span>{t('Back to Overview Dashboard')}</span>
              </button>
              <span className="subpage-breadcrumb">{t('JanSeva')} &gt; {t('Public Services Catalog')}</span>
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
        )}

        {/* ========================================================================= */}
        {/* 2. POPULAR PUBLIC SERVICES CATALOG */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 2. POPULAR PUBLIC SERVICES CATALOG - FULL-WIDTH BLENDED IMAGE BANNERS */}
        {/* ========================================================================= */}
        <div className="section-block" id="citizen-services-section" style={{ marginTop: '32px' }}>
          <div className="section-header">
            <div>
              <h2>{activeTab === 'services' ? t('All Statutory Public Services Catalog') : t('popularServices')}</h2>
              <p>
                {activeTab === 'services' 
                  ? t('Complete catalog of statutory citizen services, utility connections, certificates, and welfare programs.') 
                  : t('Direct online statutory applications with guaranteed Service Level Agreements (SLAs) & instant digital delivery')}
              </p>
            </div>
            {activeTab !== 'services' && (
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTab && setActiveTab('services')}>
                {t('View All Services')} ({serviceList.length})
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="featured-services-container">
            
            {/* SERVICE 1: ISSUE OF BIRTH CERTIFICATE (IMAGE LEFT, BLENDS TO RIGHT) */}
            {(() => {
              const srv = serviceList.find(s => s && s.id === 'srv-1') || {
                id: 'srv-1',
                name: 'Issue of Birth Certificate',
                department: 'Revenue & Vital Statistics',
                slaDays: 7,
                fee: '₹50'
              };
              return (
                <div className="featured-service-card image-left" id="service-card-birth-cert">
                  <div className="service-image-backdrop">
                    <img 
                      src={birthCertImg} 
                      alt="New Birth Certificate Registration" 
                      className="service-banner-img" 
                    />
                    <div className="service-blend-gradient-overlay" />
                  </div>

                  <div className="service-info-panel">
                    <div className="service-badges-row">
                      <span className="service-badge-pill service-badge-dept">{t('Vital Statistics & Public Health')}</span>
                      <span className="service-badge-pill service-badge-sla">
                        <Clock size={12} /> {srv.slaDays || 7} {t('Days Statutory SLA')}
                      </span>
                      <span className="service-badge-pill service-badge-fee">{t('Statutory Fee')}: {srv.fee || '₹50'}</span>
                    </div>

                    <h3 className="service-banner-title">{t('Issue of Official Birth Certificate')}</h3>
                    <p className="service-banner-desc">
                      {t('Official legal birth registration and instant QR-verifiable certificate issuance under the Registration of Births and Deaths Act.')}
                    </p>

                    <div className="service-structured-data-grid">
                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <Building size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Service Highlights & Scope')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Direct Hospital & Municipal Vital Statistics Synchronisation')}</li>
                            <li>{t('Legally Authenticated Biometric Hologram & Digital Seal')}</li>
                            <li>{t('Lifelong Civic Proof for School Admissions & Passports')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <TrendingUp size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Statutory SLA & Key Data')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('7 Days Guaranteed SLA Delivery (GIGW 3.0 Standard)')}</li>
                            <li>{t('₹50 Nominal Municipal Treasury Application Fee')}</li>
                            <li>{t('Instant DigiLocker Push Upon Approval by Chief Registrar')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Mandatory Enclosures & Verification')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Hospital Birth Discharge Slip / Form-1 Report')}</li>
                            <li>{t("Parents' Aadhaar ID & Marriage Registration Proof")}</li>
                            <li>{t('Residential Address Document / Ration Card')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="service-action-row">
                      <button 
                        type="button" 
                        className="service-apply-btn" 
                        onClick={() => openServiceModal(srv)}
                        title="Apply Online for Birth Certificate"
                      >
                        <FilePlus size={16} />
                        <span>{t('Apply for Birth Certificate')}</span>
                        <ArrowRight size={15} />
                      </button>
                      <span className="service-footer-note">
                        <CheckCircle size={14} color="#16a34a" /> {t('100% Paperless • UIDAI & DigiLocker Integrated')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SERVICE 2: NEW WATER & SEWERAGE CONNECTION (IMAGE RIGHT, BLENDS TO LEFT) */}
            {(() => {
              const srv = serviceList.find(s => s && s.id === 'srv-2') || {
                id: 'srv-2',
                name: 'New Water & Sewerage Connection',
                department: 'Water Supply & Sanitation',
                slaDays: 14,
                fee: '₹1,200'
              };
              return (
                <div className="featured-service-card image-right" id="service-card-water">
                  <div className="service-image-backdrop">
                    <img 
                      src={waterConnectionImg} 
                      alt="New Water and Sewerage Connection" 
                      className="service-banner-img" 
                    />
                    <div className="service-blend-gradient-overlay" />
                  </div>

                  <div className="service-info-panel">
                    <div className="service-badges-row">
                      <span className="service-badge-pill service-badge-dept">{t('Water Supply & Sanitation Board')}</span>
                      <span className="service-badge-pill service-badge-sla">
                        <Clock size={12} /> {srv.slaDays || 14} {t('Days Statutory SLA')}
                      </span>
                      <span className="service-badge-pill service-badge-fee">{t('Connection Charge')}: {srv.fee || '₹1,200'}</span>
                    </div>

                    <h3 className="service-banner-title">{t('New Water & Sewerage Connection')}</h3>
                    <p className="service-banner-desc">
                      {t('Sanction of piped potable drinking water tap connection and underground domestic drainage lines for residential & commercial properties.')}
                    </p>

                    <div className="service-structured-data-grid">
                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <Droplets size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Network Highlights & Infrastructure')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('High-Pressure Potable Municipal Drinking Water Supply')}</li>
                            <li>{t('Scientific Underground Sewerage & Stormwater Grid Link')}</li>
                            <li>{t('AMR Smart Electronic Water Metering Allotment')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <TrendingUp size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Technical SLA & Inspection Data')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('14 Days Statutory SLA with On-Site Verification within 48h')}</li>
                            <li>{t('₹1,200 Standard Residential Tap Connection & Testing Fee')}</li>
                            <li>{t('Direct Real-Time GPS Feasibility Mapping & Engineer Dispatch')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Required Property Documents')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Property Ownership Sale Deed or Building Allotment Letter')}</li>
                            <li>{t('Latest Municipal Property Tax Paid Receipt / Khata Extract')}</li>
                            <li>{t('Site Plan Blueprint Showing Nearest Municipal Main Line')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="service-action-row">
                      <button 
                        type="button" 
                        className="service-apply-btn" 
                        onClick={() => openServiceModal(srv)}
                        title="Apply Online for Water Connection"
                      >
                        <FilePlus size={16} />
                        <span>{t('Apply for Water Connection')}</span>
                        <ArrowRight size={15} />
                      </button>
                      <span className="service-footer-note">
                        <CheckCircle size={14} color="#16a34a" /> {t('Statutory Guarantee • Smart Metering Included')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SERVICE 3: CASTE & INCOME CERTIFICATE (IMAGE LEFT, BLENDS TO RIGHT) */}
            {(() => {
              const srv = serviceList.find(s => s && s.id === 'srv-4') || {
                id: 'srv-4',
                name: 'Income & Caste Certificate',
                department: 'Revenue & Land Records',
                slaDays: 10,
                fee: '₹30'
              };
              return (
                <div className="featured-service-card image-left" id="service-card-caste-income">
                  <div className="service-image-backdrop">
                    <img 
                      src={casteIncomeImg} 
                      alt="Caste and Income Certificate Form" 
                      className="service-banner-img" 
                    />
                    <div className="service-blend-gradient-overlay" />
                  </div>

                  <div className="service-info-panel">
                    <div className="service-badges-row">
                      <span className="service-badge-pill service-badge-dept">{t('Revenue & Land Administration')}</span>
                      <span className="service-badge-pill service-badge-sla">
                        <Clock size={12} /> {srv.slaDays || 10} {t('Days Statutory SLA')}
                      </span>
                      <span className="service-badge-pill service-badge-fee">{t('Treasury Fee')}: {srv.fee || '₹30'}</span>
                    </div>

                    <h3 className="service-banner-title">{t('Caste & Annual Income Certificate')}</h3>
                    <p className="service-banner-desc">
                      {t('Issuance of authenticated caste (SC/ST/OBC/EWS) and family income certificate for educational scholarships, welfare schemes, and quotas.')}
                    </p>

                    <div className="service-structured-data-grid">
                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <Award size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Statutory Purpose & Citizen Benefits')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Formal Category Verification (SC / ST / OBC / General-EWS)')}</li>
                            <li>{t('Certified Family Annual Income for State & Central Schemes')}</li>
                            <li>{t('Tuition Fee Waivers, Competitive Exam Quotas & Grants')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <TrendingUp size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Statutory SLA & Revenue Data')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('10 Days Statutory Delivery SLA with Revenue Field Scrutiny')}</li>
                            <li>{t('₹30 Subsidized Treasury Processing Charge (GIGW Compliant)')}</li>
                            <li>{t('Tamper-Proof 2D QR Code & Nadakacheri Portal Verification')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Required Enclosures & Affidavit')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Family BPL Ration Card / Antyodaya Anna Yojana Card Copy')}</li>
                            <li>{t('Salary Slip or Agricultural RTC Land Record / Income Affidavit')}</li>
                            <li>{t('School Leaving Certificate / Ancestral Caste Record')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="service-action-row">
                      <button 
                        type="button" 
                        className="service-apply-btn" 
                        onClick={() => openServiceModal(srv)}
                        title="Apply Online for Caste & Income Certificate"
                      >
                        <FilePlus size={16} />
                        <span>{t('Apply for Caste & Income Certificate')}</span>
                        <ArrowRight size={15} />
                      </button>
                      <span className="service-footer-note">
                        <CheckCircle size={14} color="#16a34a" /> {t('Revenue Tahsildar Verified • Valid for 5 Years')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SERVICE 4: TRADE LICENSE REGISTRATION & RENEWAL (IMAGE RIGHT, BLENDS TO LEFT) */}
            {(() => {
              const srv = serviceList.find(s => s && s.id === 'srv-3') || {
                id: 'srv-3',
                name: 'Trade License Renewal',
                department: 'Commercial & Trade Licensing',
                slaDays: 5,
                fee: '₹850'
              };
              return (
                <div className="featured-service-card image-right" id="service-card-trade-license">
                  <div className="service-image-backdrop">
                    <img 
                      src={tradeLicenseImg} 
                      alt="Trade License Registration and Renewal" 
                      className="service-banner-img" 
                    />
                    <div className="service-blend-gradient-overlay" />
                  </div>

                  <div className="service-info-panel">
                    <div className="service-badges-row">
                      <span className="service-badge-pill service-badge-dept">{t('Commercial & Trade Licensing Authority')}</span>
                      <span className="service-badge-pill service-badge-sla">
                        <Clock size={12} /> {srv.slaDays || 5} {t('Days Statutory SLA')}
                      </span>
                      <span className="service-badge-pill service-badge-fee">{t('Statutory Fee')}: {srv.fee || '₹850'}</span>
                    </div>

                    <h3 className="service-banner-title">{t('Municipal Trade License & Business Permit')}</h3>
                    <p className="service-banner-desc">
                      {t('Statutory commercial operating license issuance and paperless annual renewals for retail, MSMEs, manufacturing, and food business establishments.')}
                    </p>

                    <div className="service-structured-data-grid">
                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <Building2 size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Business Scope & Trade Clearances')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Commercial, Retail, Warehouse & Manufacturing Permissibility')}</li>
                            <li>{t('Integrated Municipal Health & Sanitary Fitness Clearances')}</li>
                            <li>{t('Single-Window Ease of Doing Business (EoDB) Fast-Track')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <TrendingUp size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Statutory SLA & Tariffs')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('5 Days Statutory Guarantee under State Right to Services')}</li>
                            <li>{t('₹850 Transparent Treasury Fee with Instant Digital Receipt')}</li>
                            <li>{t('Real-Time DigiLocker Push & QR-Secured Trade Certificate')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Mandatory Business Enclosures')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('GSTIN Certificate / Udyam MSME Registration Copy')}</li>
                            <li>{t('Shop Commercial Lease Agreement / Property Tax Receipt')}</li>
                            <li>{t('Fire Safety NOC & Pollution Consent (if applicable)')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="service-action-row">
                      <button 
                        type="button" 
                        className="service-apply-btn" 
                        onClick={() => openServiceModal(srv)}
                        title="Apply Online for Trade License"
                      >
                        <FilePlus size={16} />
                        <span>{t('Apply for Trade License')}</span>
                        <ArrowRight size={15} />
                      </button>
                      <span className="service-footer-note">
                        <CheckCircle size={14} color="#16a34a" /> {t('Ease of Doing Business • Ministry of Corporate Affairs Aligned')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SERVICE 5: PROPERTY TAX ASSESSMENT & TRANSFER (IMAGE LEFT, BLENDS TO RIGHT) */}
            {(() => {
              const srv = serviceList.find(s => s && s.id === 'srv-5') || {
                id: 'srv-5',
                name: 'Property Tax Assessment & Transfer',
                department: 'Revenue & Taxation',
                slaDays: 15,
                fee: '₹500'
              };
              return (
                <div className="featured-service-card image-left" id="service-card-property-tax">
                  <div className="service-image-backdrop">
                    <img 
                      src={propertyTaxImg} 
                      alt="Property Tax Assessment and Khata Transfer" 
                      className="service-banner-img" 
                    />
                    <div className="service-blend-gradient-overlay" />
                  </div>

                  <div className="service-info-panel">
                    <div className="service-badges-row">
                      <span className="service-badge-pill service-badge-dept">{t('Municipal Revenue & Taxation Division')}</span>
                      <span className="service-badge-pill service-badge-sla">
                        <Clock size={12} /> {srv.slaDays || 15} {t('Days Statutory SLA')}
                      </span>
                      <span className="service-badge-pill service-badge-fee">{t('Assessment Charge')}: {srv.fee || '₹500'}</span>
                    </div>

                    <h3 className="service-banner-title">{t('Property Tax Assessment & Khata Mutation')}</h3>
                    <p className="service-banner-desc">
                      {t('GIS-mapped self-assessment of annual property tax liabilities, municipal Khata transfer, title mutation post-sale deed, and clearance certificate issuance.')}
                    </p>

                    <div className="service-structured-data-grid">
                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <Home size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Assessment Scope & Mutation')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('A-Khata / B-Khata Digital Name Transfer on Registered Sale Deeds')}</li>
                            <li>{t('Unit Area Value (UAV) Scientific Property Tax Self-Calculation')}</li>
                            <li>{t('Official Nil-Encumbrance Tax Clearance Certificate (Form-3)')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <TrendingUp size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Statutory SLA & Revenue Verification')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('15 Days Statutory Delivery SLA with Revenue Inspector Field Survey')}</li>
                            <li>{t('₹500 Subsidized Title Registry & Khata Mutation Fee')}</li>
                            <li>{t('Direct Linkage with Sub-Registrar Electronic Deeds Database')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Required Property Records')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Registered Sale Deed / Partition Deed / Gift Deed Document')}</li>
                            <li>{t('Latest Municipal Property Tax Paid Challan & Khata Extract')}</li>
                            <li>{t('Approved Building Plan Blueprint or Encumbrance Certificate')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="service-action-row">
                      <button 
                        type="button" 
                        className="service-apply-btn" 
                        onClick={() => openServiceModal(srv)}
                        title="Apply Online for Property Tax / Mutation"
                      >
                        <FilePlus size={16} />
                        <span>{t('Apply for Property Tax / Mutation')}</span>
                        <ArrowRight size={15} />
                      </button>
                      <span className="service-footer-note">
                        <CheckCircle size={14} color="#16a34a" /> {t('Sub-Registrar Linked • Kaveri / Bhoomi Land Registry Synchronised')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SERVICE 6: STREET LIGHT & INFRASTRUCTURE MAINTENANCE (IMAGE RIGHT, BLENDS TO LEFT) */}
            {(() => {
              const srv = serviceList.find(s => s && s.id === 'srv-6') || {
                id: 'srv-6',
                name: 'Street Light & Infrastructure Maintenance',
                department: 'Public Works & Infrastructure',
                slaDays: 3,
                fee: 'Free'
              };
              return (
                <div className="featured-service-card image-right" id="service-card-street-light">
                  <div className="service-image-backdrop">
                    <img 
                      src={streetLightImg} 
                      alt="Public Street Lighting and Infrastructure Maintenance" 
                      className="service-banner-img" 
                    />
                    <div className="service-blend-gradient-overlay" />
                  </div>

                  <div className="service-info-panel">
                    <div className="service-badges-row">
                      <span className="service-badge-pill service-badge-dept">{t('Public Works & Electrical Infrastructure')}</span>
                      <span className="service-badge-pill service-badge-sla">
                        <Clock size={12} /> {srv.slaDays || 3} {t('Days Statutory SLA')}
                      </span>
                      <span className="service-badge-pill service-badge-fee" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                        {t('100% Free Civic Service')}
                      </span>
                    </div>

                    <h3 className="service-banner-title">{t('Public Street Lighting & Civic Electrical Maintenance')}</h3>
                    <p className="service-banner-desc">
                      {t('Fast-track municipal service for smart LED street lamp installations, pole replacements, dark-spot elimination, and rapid electrical grid repair across wards.')}
                    </p>

                    <div className="service-structured-data-grid">
                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <Zap size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Civic Grid Scope & Public Safety')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Energy-Efficient Centralized CCMS Smart LED Street Lights')}</li>
                            <li>{t('Targeted Dark-Spot Rectification for Pedestrian & Women Safety')}</li>
                            <li>{t('Automated Sunrise-to-Sunset Timer & Cable Network Upgrades')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <TrendingUp size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Rapid Field Redressal SLA')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('72 Hours (3 Days) Guaranteed SLA for Civic Repair & Bulb Swap')}</li>
                            <li>{t('Zero Statutory Application Fee (100% Public Funded Amenity)')}</li>
                            <li>{t('Automated SMS Dispatch to Ward Junior Electrical Engineer')}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="service-data-section">
                        <div className="service-section-icon-box">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="service-section-content">
                          <div className="service-section-heading">{t('Locality Details & Geo-Information')}</div>
                          <ul className="service-bullets-list">
                            <li>{t('Street / Cross-Road Landmark, Ward & House Number')}</li>
                            <li>{t('Electrical Pole Serial Number / Transformer Tag (if visible)')}</li>
                            <li>{t('Optional Mobile Photo / Geotagged Location Upload')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="service-action-row">
                      <button 
                        type="button" 
                        className="service-apply-btn" 
                        onClick={() => openServiceModal(srv)}
                        title="Request Street Light Service / Maintenance"
                      >
                        <FilePlus size={16} />
                        <span>{t('Request Street Light Service')}</span>
                        <ArrowRight size={15} />
                      </button>
                      <span className="service-footer-note">
                        <CheckCircle size={14} color="#16a34a" /> {t('72-Hour Rapid Response • National LED Street Lighting Programme')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* EXTENDED SERVICES CATALOG (SHOWN EXCLUSIVELY ON VIEW ALL SERVICES PAGE) */}
            {/* ========================================================================= */}
            {activeTab === 'services' && (
              <>
                {/* SERVICE 7: NEW DOMESTIC LPG GAS CONNECTION (IMAGE LEFT, BLENDS TO RIGHT) */}
                {(() => {
                  const srv = serviceList.find(s => s && s.id === 'srv-7') || {
                    id: 'srv-7',
                    name: 'New Domestic LPG Gas Connection (PMUY / City Gas)',
                    department: 'Food, Civil Supplies & Consumer Affairs',
                    slaDays: 7,
                    fee: '₹1,600'
                  };
                  return (
                    <div className="featured-service-card image-left" id="service-card-lpg">
                      <div className="service-image-backdrop">
                        <img 
                          src={lpgGasImg} 
                          alt="New Domestic LPG Gas Connection" 
                          className="service-banner-img" 
                        />
                        <div className="service-blend-gradient-overlay" />
                      </div>

                      <div className="service-info-panel">
                        <div className="service-badges-row">
                          <span className="service-badge-pill service-badge-dept">{t('Food, Civil Supplies & Consumer Affairs')}</span>
                          <span className="service-badge-pill service-badge-sla">
                            <Clock size={12} /> {srv.slaDays || 7} {t('Days Statutory SLA')}
                          </span>
                          <span className="service-badge-pill service-badge-fee">{t('Statutory Fee')}: {srv.fee || '₹1,600'}</span>
                        </div>

                        <h3 className="service-banner-title">{t('New Domestic LPG Gas Connection (PMUY / City Gas)')}</h3>
                        <p className="service-banner-desc">
                          {t('Application for new subsidized or general domestic LPG cylinder connection with gas stove, regulator, steel-braided hose pipe, and mandatory safety inspection.')}
                        </p>

                        <div className="service-structured-data-grid">
                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <Flame size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('LPG Distribution Scope & Equipment')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('14.2 kg Subsidized Domestic Cylinder + Safety Valve Regulator')}</li>
                                <li>{t('100% Free Cylinder Deposit & Stove under Pradhan Mantri Ujjwala Yojana (PMUY)')}</li>
                                <li>{t('Piped Natural Gas (PNG) / City Gas Network Option (Where Available)')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <TrendingUp size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Statutory SLA & DBTL Subsidy')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('7 Days Delivery SLA from Application to Kitchen Installation')}</li>
                                <li>{t('Direct Cash Subsidy (PAHAL/DBTL) into Aadhaar-Linked Bank Account')}</li>
                                <li>{t('24x7 Toll-Free Emergency Gas Leakage Support (1906)')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <ShieldCheck size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Required Documents & Proofs')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Aadhaar Card of Applicant & All Adult Family Members')}</li>
                                <li>{t('Ration Card / BPL Certificate (Mandatory for PMUY Subsidy)')}</li>
                                <li>{t('Bank Account Passbook Copy with IFSC & Address Proof')}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="service-action-row">
                          <button 
                            type="button" 
                            className="service-apply-btn" 
                            onClick={() => openServiceModal(srv)}
                            title="Apply Online for New Domestic LPG Connection"
                          >
                            <FilePlus size={16} />
                            <span>{t('Apply for LPG Connection')}</span>
                            <ArrowRight size={15} />
                          </button>
                          <span className="service-footer-note">
                            <CheckCircle size={14} color="#16a34a" /> {t('Ministry of Petroleum & Natural Gas • PAHAL (DBTL) Integrated')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SERVICE 8: NEW DOMESTIC ELECTRICITY CONNECTION (IMAGE RIGHT, BLENDS TO LEFT) */}
                {(() => {
                  const srv = serviceList.find(s => s && s.id === 'srv-8') || {
                    id: 'srv-8',
                    name: 'New Domestic Electricity Connection & Smart Meter',
                    department: 'Energy & Power Distribution (DISCOM)',
                    slaDays: 5,
                    fee: '₹750'
                  };
                  return (
                    <div className="featured-service-card image-right" id="service-card-electricity">
                      <div className="service-image-backdrop">
                        <img 
                          src={electricityMeterImg} 
                          alt="New Domestic Electricity Connection and Smart Meter" 
                          className="service-banner-img" 
                        />
                        <div className="service-blend-gradient-overlay" />
                      </div>

                      <div className="service-info-panel">
                        <div className="service-badges-row">
                          <span className="service-badge-pill service-badge-dept">{t('Energy & Power Distribution (DISCOM)')}</span>
                          <span className="service-badge-pill service-badge-sla">
                            <Clock size={12} /> {srv.slaDays || 5} {t('Days Statutory SLA')}
                          </span>
                          <span className="service-badge-pill service-badge-fee">{t('Statutory Fee')}: {srv.fee || '₹750'}</span>
                        </div>

                        <h3 className="service-banner-title">{t('New Domestic Electricity Connection & Smart Meter')}</h3>
                        <p className="service-banner-desc">
                          {t('Statutory DISCOM application for domestic LT single-phase or three-phase power supply connection, digital smart meter installation, and computerized load sanction.')}
                        </p>

                        <div className="service-structured-data-grid">
                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <Zap size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Power Supply Scope & Load Category')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Single-Phase (Up to 5kW) or Three-Phase Domestic Power Supply')}</li>
                                <li>{t('Smart Tamper-Proof Prepaid/Postpaid Digital Electronic Meter')}</li>
                                <li>{t('Direct Central Substation & Feeder Grid Interconnection')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <TrendingUp size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Statutory Delivery SLA & Tariffs')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Guaranteed 5 Working Days SLA for Site Inspection & Energization')}</li>
                                <li>{t('Subsidized Connection Fee with Transparent Security Deposit')}</li>
                                <li>{t('Automated SMS Updates on Lineman Dispatch & Meter Setup')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <ShieldCheck size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Required Documents & Safety Check')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Registered Property Ownership Deed / Rent Agreement Copy')}</li>
                                <li>{t('Latest Municipal Property Tax Paid Receipt & E-Khata Extract')}</li>
                                <li>{t('Wiring Safety Certificate & Applicant Aadhaar Card')}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="service-action-row">
                          <button 
                            type="button" 
                            className="service-apply-btn" 
                            onClick={() => openServiceModal(srv)}
                            title="Apply Online for New Electricity Connection"
                          >
                            <FilePlus size={16} />
                            <span>{t('Apply for Electricity Connection')}</span>
                            <ArrowRight size={15} />
                          </button>
                          <span className="service-footer-note">
                            <CheckCircle size={14} color="#16a34a" /> {t('National Electricity Grid Synchronised • DISCOM Verified')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SERVICE 9: SENIOR CITIZEN IDENTITY CARD (IMAGE LEFT, BLENDS TO RIGHT) */}
                {(() => {
                  const srv = serviceList.find(s => s && s.id === 'srv-12') || {
                    id: 'srv-12',
                    name: 'Senior Citizen Identity Card & Pension Enrollment',
                    department: 'Social Welfare & Empowerment',
                    slaDays: 10,
                    fee: 'Free'
                  };
                  return (
                    <div className="featured-service-card image-left" id="service-card-senior-citizen">
                      <div className="service-image-backdrop">
                        <img 
                          src={seniorCitizenImg} 
                          alt="Senior Citizen Identity Card and Pension Enrollment" 
                          className="service-banner-img" 
                        />
                        <div className="service-blend-gradient-overlay" />
                      </div>

                      <div className="service-info-panel">
                        <div className="service-badges-row">
                          <span className="service-badge-pill service-badge-dept">{t('Social Welfare & Empowerment')}</span>
                          <span className="service-badge-pill service-badge-sla">
                            <Clock size={12} /> {srv.slaDays || 10} {t('Days Statutory SLA')}
                          </span>
                          <span className="service-badge-pill service-badge-fee" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                            {t('100% Free Civic Welfare Scheme')}
                          </span>
                        </div>

                        <h3 className="service-banner-title">{t('Senior Citizen Identity Card & Pension Enrollment')}</h3>
                        <p className="service-banner-desc">
                          {t('Issuance of National Senior Citizen Smart Identity Card for travel fare concessions, medical subsidies, priority public services, and Old Age Pension enrollment.')}
                        </p>

                        <div className="service-structured-data-grid">
                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <Award size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Statutory Concessions & Welfare Scope')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Up to 50% Concession on State Road Transport (RTC) & Railways')}</li>
                                <li>{t('Priority Counters at Government Hospitals, Banks & Courts')}</li>
                                <li>{t('Monthly Direct Benefit Old Age Pension (IGNOAPS Integration)')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <TrendingUp size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Statutory Delivery SLA & Card Dispatch')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('10 Days Statutory Delivery SLA with Ward Welfare Scrutiny')}</li>
                                <li>{t('100% Free Application Processing (Zero State Treasury Fee)')}</li>
                                <li>{t('Tamper-Proof QR Smart PVC Identity Card Dispatched to Doorstep')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <ShieldCheck size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Required Documents & Age Proof')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Age Proof (Aadhaar / Voter ID / 10th TC showing 60+ Years)')}</li>
                                <li>{t('Residential Address Proof (Electricity / Water Bill / Ration Card)')}</li>
                                <li>{t('Passport Size Photographs & Bank Passbook Copy (for Pension)')}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="service-action-row">
                          <button 
                            type="button" 
                            className="service-apply-btn" 
                            onClick={() => openServiceModal(srv)}
                            title="Enroll Online for Senior Citizen Identity Card"
                          >
                            <FilePlus size={16} />
                            <span>{t('Enroll for Senior Citizen Benefits')}</span>
                            <ArrowRight size={15} />
                          </button>
                          <span className="service-footer-note">
                            <CheckCircle size={14} color="#16a34a" /> {t('Ministry of Social Justice & Empowerment • Valid Pan-India')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SERVICE 10: DEATH & LEGAL HEIR SUCCESSION CERTIFICATE (IMAGE RIGHT, BLENDS TO LEFT) */}
                {(() => {
                  const srv = serviceList.find(s => s && s.id === 'srv-10') || {
                    id: 'srv-10',
                    name: 'Death & Legal Heir Succession Certificate',
                    department: 'Revenue & Vital Statistics',
                    slaDays: 7,
                    fee: '₹50'
                  };
                  return (
                    <div className="featured-service-card image-right" id="service-card-death-cert">
                      <div className="service-image-backdrop">
                        <img 
                          src={deathCertImg} 
                          alt="Official Death and Legal Heir Succession Certificate" 
                          className="service-banner-img" 
                        />
                        <div className="service-blend-gradient-overlay" />
                      </div>

                      <div className="service-info-panel">
                        <div className="service-badges-row">
                          <span className="service-badge-pill service-badge-dept">{t('Revenue & Vital Statistics')}</span>
                          <span className="service-badge-pill service-badge-sla">
                            <Clock size={12} /> {srv.slaDays || 7} {t('Days Statutory SLA')}
                          </span>
                          <span className="service-badge-pill service-badge-fee">{t('Statutory Fee')}: {srv.fee || '₹50'}</span>
                        </div>

                        <h3 className="service-banner-title">{t('Death & Legal Heir Succession Certificate')}</h3>
                        <p className="service-banner-desc">
                          {t('Official legal registration of death under the Registration of Births and Deaths Act and computerized issuance of statutory family member survivor and succession certificate.')}
                        </p>

                        <div className="service-structured-data-grid">
                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <FileCheck2 size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Legal Purpose & Inheritance Claims')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Essential Document for Settling Bank Accounts, PF & LIC Claims')}</li>
                                <li>{t('Statutory Legal Heir Verification for Real Estate & Vehicle Transfer')}</li>
                                <li>{t('Pension Family Succession & Compassionate Appointment Processing')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <TrendingUp size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Time-Bound SLA & Verification')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('7 Days Statutory SLA with Digitally Signed Sub-Registrar Seal')}</li>
                                <li>{t('₹50 Subsidized Treasury Fee with Direct CRS Synchronisation')}</li>
                                <li>{t('Tamper-Proof 2D QR Verification Valid across Indian Courts & Banks')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <ShieldCheck size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Required Documents & Enclosures')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Hospital Death Summary Slip or Medical Attendant Certificate')}</li>
                                <li>{t('Crematorium / Burial Ground Receipt & Deceased Aadhaar Copy')}</li>
                                <li>{t('Aadhaar ID of Applicant / Legal Heirs & Family Affidavit')}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="service-action-row">
                          <button 
                            type="button" 
                            className="service-apply-btn" 
                            onClick={() => openServiceModal(srv)}
                            title="Apply Online for Death & Legal Heir Certificate"
                          >
                            <FilePlus size={16} />
                            <span>{t('Apply for Death & Legal Heir Certificate')}</span>
                            <ArrowRight size={15} />
                          </button>
                          <span className="service-footer-note">
                            <CheckCircle size={14} color="#16a34a" /> {t('Civil Registration System (CRS) • Registrar General of India Synchronised')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SERVICE 11: DIGITIZED E-KHATA & PROPERTY TITLE MUTATION (IMAGE LEFT, BLENDS TO RIGHT) */}
                {(() => {
                  const srv = serviceList.find(s => s && s.id === 'srv-11') || {
                    id: 'srv-11',
                    name: 'Digitized E-Khata & Property Title Mutation',
                    department: 'Revenue & Municipal Land Records',
                    slaDays: 15,
                    fee: '₹500'
                  };
                  return (
                    <div className="featured-service-card image-left" id="service-card-e-khata">
                      <div className="service-image-backdrop">
                        <img 
                          src={eKhataImg} 
                          alt="Digitized E-Khata and Municipal Property Title Mutation" 
                          className="service-banner-img" 
                        />
                        <div className="service-blend-gradient-overlay" />
                      </div>

                      <div className="service-info-panel">
                        <div className="service-badges-row">
                          <span className="service-badge-pill service-badge-dept">{t('Revenue & Municipal Land Records')}</span>
                          <span className="service-badge-pill service-badge-sla">
                            <Clock size={12} /> {srv.slaDays || 15} {t('Days Statutory SLA')}
                          </span>
                          <span className="service-badge-pill service-badge-fee">{t('Mutation Fee')}: {srv.fee || '₹500'}</span>
                        </div>

                        <h3 className="service-banner-title">{t('Digitized E-Khata & Property Title Mutation')}</h3>
                        <p className="service-banner-desc">
                          {t('Statutory digital transfer of municipal property title, revenue register mutation, and issuance of tamper-proof 24-digit digital E-Khata certificate for secure real-estate ownership.')}
                        </p>

                        <div className="service-structured-data-grid">
                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <Building size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Municipal Scope & Title Authenticity')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Computerized Digitized E-Khata Extract with Geotagged GIS Identifier')}</li>
                                <li>{t('Elimination of Fake B-Khata / Unsanctioned Layout Revenue Entries')}</li>
                                <li>{t('Mandatory Document for Home Loans, Property Sale & Utility Sanction')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <TrendingUp size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Revenue Redressal SLA')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('15 Days Statutory SLA under Right to Public Service Delivery Act')}</li>
                                <li>{t('Automated Dual Notice to Previous Owner with 30-Day Objection Window')}</li>
                                <li>{t('₹500 Fixed Government Mutation Fee Linked to Digital Treasury Challan')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <ShieldCheck size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Required Legal Enclosures')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Registered Sale Deed / Gift Deed / Partition Deed Copy')}</li>
                                <li>{t('Latest 15-Year Encumbrance Certificate (EC - Form 15)')}</li>
                                <li>{t('Up-to-Date Municipal Property Tax Paid Challan & Building Plan')}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="service-action-row">
                          <button 
                            type="button" 
                            className="service-apply-btn" 
                            onClick={() => openServiceModal(srv)}
                            title="Apply Online for Digitized E-Khata & Mutation"
                          >
                            <FilePlus size={16} />
                            <span>{t('Apply for Digitized E-Khata')}</span>
                            <ArrowRight size={15} />
                          </button>
                          <span className="service-footer-note">
                            <CheckCircle size={14} color="#16a34a" /> {t('Bhoomi & Kaveri 2.0 Integration • 100% Tamper-Proof Digital Revenue Record')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SERVICE 12: DRIVING LICENSE LL/DL (IMAGE RIGHT, BLENDS TO LEFT) */}
                {(() => {
                  const srv = serviceList.find(s => s && s.id === 'srv-9') || {
                    id: 'srv-9',
                    name: "Learner's License & Driving License (LL/DL)",
                    department: 'Transport & Road Safety',
                    slaDays: 7,
                    fee: '₹350'
                  };
                  return (
                    <div className="featured-service-card image-right" id="service-card-driving-license">
                      <div className="service-image-backdrop">
                        <img 
                          src={drivingLicenseImg} 
                          alt="Learner's License and Driving License Application" 
                          className="service-banner-img" 
                        />
                        <div className="service-blend-gradient-overlay" />
                      </div>

                      <div className="service-info-panel">
                        <div className="service-badges-row">
                          <span className="service-badge-pill service-badge-dept">{t('Transport & Road Safety (RTO)')}</span>
                          <span className="service-badge-pill service-badge-sla">
                            <Clock size={12} /> {srv.slaDays || 7} {t('Days Statutory SLA')}
                          </span>
                          <span className="service-badge-pill service-badge-fee">{t('Statutory Fee')}: {srv.fee || '₹350'}</span>
                        </div>

                        <h3 className="service-banner-title">{t("Learner's License & Driving License (LL/DL)")}</h3>
                        <p className="service-banner-desc">
                          {t('Online application for computerized Learner’s License test slot and permanent biometric driving license issuance under the Motor Vehicles Act.')}
                        </p>

                        <div className="service-structured-data-grid">
                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <Car size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('License Categories & Facilities')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Motor Cycle with Gear (MCWG), Without Gear & Light Motor Vehicle (LMV)')}</li>
                                <li>{t('Contactless Online Computerized Traffic Sign & Regulation Test')}</li>
                                <li>{t('Sarathi Parivahan Database Integration with DigiLocker Synchronization')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <TrendingUp size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Statutory Delivery SLA')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Instant Contactless Electronic Learner’s License (Same Day Issuance)')}</li>
                                <li>{t('7 Days Statutory SLA for Automated Driving Track Test & Card')}</li>
                                <li>{t('₹350 Fixed Government Fee without Middlemen or Intermediaries')}</li>
                              </ul>
                            </div>
                          </div>

                          <div className="service-data-section">
                            <div className="service-section-icon-box">
                              <ShieldCheck size={17} />
                            </div>
                            <div className="service-section-content">
                              <div className="service-section-heading">{t('Required Documents & Fitness')}</div>
                              <ul className="service-bullets-list">
                                <li>{t('Aadhaar Card for Online Authentication & Address Verification')}</li>
                                <li>{t('Age Proof (Class 10th Marks Card / Birth Certificate / Passport)')}</li>
                                <li>{t('Form 1A Medical Fitness Certificate (For Commercial or Age 40+)')}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="service-action-row">
                          <button 
                            type="button" 
                            className="service-apply-btn" 
                            onClick={() => openServiceModal(srv)}
                            title="Apply Online for Driving License"
                          >
                            <FilePlus size={16} />
                            <span>{t('Apply for Driving License')}</span>
                            <ArrowRight size={15} />
                          </button>
                          <span className="service-footer-note">
                            <CheckCircle size={14} color="#16a34a" /> {t('Ministry of Road Transport & Highways • Sarathi 4.0 Platform Synchronised')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MY SUBMISSIONS SUMMARY CARD (CITIZEN PORTAL - HIDDEN ON SERVICES VIEW) */}
        {/* ========================================================================= */}
        {activeTab !== 'services' && (
          <>
            <div className="section-block" id="citizen-grievances-section" style={{ marginTop: '36px' }}>
              <div 
                className="my-submissions-banner-card glass-card"
                onClick={() => setShowSubmissionsModal(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowSubmissionsModal(true); }}
                title="Click to view all your submissions"
              >
                <div className="submissions-card-header">
                  <div className="submissions-card-title-group">
                    <div className="submissions-icon-badge">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="submissions-tag-pill">
                        <span className="pulse-dot-green" /> {t('Authenticated Submissions Registry')}
                      </div>
                      <h2 className="submissions-card-title">
                        {isOfficer ? t('My Assigned Grievance Queue & Field Redressal') : t('My Registered Grievances & Service Submissions')}
                      </h2>
                      <p className="submissions-card-subtitle">
                        {isOfficer 
                          ? t('Inspect complaints allocated to your department queue, update site inspection notes, and clear SLA deadlines.')
                          : t('Access your submitted complaints, track real-time statutory SLA countdowns, and inspect verified officer redressal reports.')}
                      </p>
                    </div>
                  </div>

                  <div className="submissions-card-actions">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSubmissionsModal(true);
                      }}
                      title="View My Submissions"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Eye size={16} />
                      <span>{t('View My Submissions')} ({currentList.length + myApplications.length})</span>
                      <ArrowRight size={15} />
                    </button>
                    {isCitizen && (
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGrievanceModal();
                        }}
                        title="Lodge New Grievance"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FilePlus size={15} />
                        <span>+ Lodge Grievance</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="submissions-metrics-grid">
                  <div className="sub-metric-item">
                    <span className="sub-metric-label">{t('Total Submissions')}</span>
                    <span className="sub-metric-val">{currentList.length + myApplications.length}</span>
                  </div>
                  <div className="sub-metric-item">
                    <span className="sub-metric-label">{t('In Progress / Review')}</span>
                    <span className="sub-metric-val val-progress">{inProgressCount}</span>
                  </div>
                  <div className="sub-metric-item">
                    <span className="sub-metric-label">{t('Resolved / Delivered')}</span>
                    <span className="sub-metric-val val-resolved">{resolvedCount}</span>
                  </div>
                  <div className="sub-metric-item">
                    <span className="sub-metric-label">{t('Statutory SLA Compliance')}</span>
                    <span className="sub-metric-val val-sla">{resolutionRate}%</span>
                  </div>
                </div>

                {/* Quick Preview or Prompt */}
                {currentList.length > 0 || myApplications.length > 0 ? (
                  <div className="submissions-preview-bar">
                    <div className="preview-label">
                      <Clock size={14} /> <strong>{t('Latest Activity:')}</strong>
                    </div>
                    <div className="preview-content">
                      {currentList[0] ? (
                        <span>
                          <strong className="preview-id">#{currentList[0].id}</strong> - {currentList[0].title}
                          <span className={`badge badge-sm badge-${(currentList[0].status || '').toLowerCase().replace(/\s+/g, '-')}`} style={{ marginLeft: '8px' }}>
                            {currentList[0].status}
                          </span>
                        </span>
                      ) : (
                        <span>
                          <strong className="preview-id">#{myApplications[0].id}</strong> - {myApplications[0].serviceName}
                          <span className="badge badge-sm badge-info" style={{ marginLeft: '8px' }}>
                            {myApplications[0].status}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="preview-action-hint">
                      <span>{t('Click card to inspect full list & timeline')}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ) : (
                  <div className="submissions-empty-preview">
                    <CheckCircle size={16} color="#16a34a" />
                    <span>{t('You currently have zero pending complaints. Click here or use \'+ Lodge Grievance\' to report an issue.')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Statutory SLA Compliance Alert Card (Shifted to Bottom) */}
            <div className="gov-sla-bar-strip" style={{ marginTop: '36px', marginBottom: '16px' }}>
              <div className="gov-sla-strip-left">
                <ShieldCheck size={20} className="text-brand-green" />
                <div>
                  <strong>{t('Time-Bound Public Service Delivery Act (GIGW 3.0 Standard)')}</strong>
                  <p className="text-muted small-text" style={{ margin: 0 }}>
                    {t('Every grievance is assigned a statutory SLA deadline. Breached cases auto-escalate directly to Senior Zonal Commissioners.')}
                  </p>
                </div>
              </div>
              <div className="gov-sla-strip-right">
                <div className="sla-rate-pill">
                  <span className="small-text">{t('SLA Redressal Rate:')}</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--brand-700)' }}>{resolutionRate}%</strong>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openGrievanceModal}>
                  <FilePlus size={15} />
                  <span>{t('lodgeGrievance')}</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DEDICATED "MY SUBMISSIONS" VIEWER MODAL */}
      {/* ========================================================================= */}
      {showSubmissionsModal && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1200 }} 
          onClick={() => setShowSubmissionsModal(false)}
        >
          <div 
            className="modal-content animate-slide-up" 
            style={{ 
              maxWidth: '960px', 
              width: '95%', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: 0, 
              overflow: 'hidden',
              borderRadius: '16px' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ background: 'var(--brand-700, #2c5745)', color: '#ffffff', padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.25rem', fontWeight: 800 }}>
                    {isOfficer ? t('My Assigned Duty Queue & Field Inspections') : t('My Registered Grievances & Service Submissions')}
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>
                    Citizen: {user?.fullName || 'Verified Citizen'} • National JanSeva Governance Registry
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="close-btn" 
                onClick={() => setShowSubmissionsModal(false)}
                style={{ color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Close Submissions Modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Sub-tabs: Grievance Complaints vs Service Applications */}
            <div className="submissions-modal-tabs">
              <button
                type="button"
                className={`submissions-tab-btn ${submissionsTab === 'grievances' ? 'active' : ''}`}
                onClick={() => setSubmissionsTab('grievances')}
              >
                <FileText size={16} />
                <span>{t('Grievance Complaints')} ({currentList.length})</span>
              </button>
              <button
                type="button"
                className={`submissions-tab-btn ${submissionsTab === 'applications' ? 'active' : ''}`}
                onClick={() => setSubmissionsTab('applications')}
              >
                <Layers size={16} />
                <span>{t('Service Applications')} ({myApplications.length})</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ padding: '14px 24px', background: 'var(--bg-card-subtle, rgba(0,0,0,0.02))', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder={t('Search by ID, keyword, department, or location...')}
                  value={submissionsSearch}
                  onChange={(e) => setSubmissionsSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={submissionsStatusFilter}
                  onChange={(e) => setSubmissionsStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">{t('All Statuses')}</option>
                  <option value="Submitted">{t('Submitted')}</option>
                  <option value="Under Review">{t('Under Review')}</option>
                  <option value="Assigned">{t('Assigned')}</option>
                  <option value="In Progress">{t('In Progress')}</option>
                  <option value="Resolved">{t('Resolved')}</option>
                </select>
              </div>
            </div>

            {/* Modal Body / Submissions List */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: '58vh' }}>
              {submissionsTab === 'grievances' ? (
                (() => {
                  const filtered = currentList.filter(item => {
                    if (!item) return false;
                    const matchesStatus = submissionsStatusFilter === 'All' || item.status === submissionsStatusFilter;
                    const q = submissionsSearch.toLowerCase().trim();
                    if (!q) return matchesStatus;
                    const matchesText = (item.id || '').toLowerCase().includes(q) ||
                                        (item.title || '').toLowerCase().includes(q) ||
                                        (item.description || '').toLowerCase().includes(q) ||
                                        (item.department || '').toLowerCase().includes(q) ||
                                        (item.location || '').toLowerCase().includes(q);
                    return matchesStatus && matchesText;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="empty-state glass-card" style={{ padding: '36px', textAlign: 'center' }}>
                        <FileText size={44} className="empty-icon" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {isOfficer ? t('No assigned tickets found') : t('No matching grievances found')}
                        </h4>
                        <p className="text-muted small-text" style={{ margin: 0 }}>
                          {isCitizen 
                            ? t('You have not submitted any complaints matching this filter.')
                            : t('Zero assignments matching this search criteria in your queue.')}
                        </p>
                        {isCitizen && (
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => {
                              setShowSubmissionsModal(false);
                              openGrievanceModal();
                            }}
                          >
                            <FilePlus size={15} /> {t('lodgeGrievance')}
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="grievance-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {filtered.map(item => (
                        <div key={item.id} className="grievance-card glass-card" style={{ padding: '16px 20px' }}>
                          <div className="g-card-header">
                            <div className="g-id-badge">
                              <span className="g-id-bold">{item.id}</span>
                              <span className={`priority-tag priority-${(item.priority || 'Medium').toLowerCase()}`}>
                                {item.priority || 'Medium'} Priority
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
                              <span className={`badge badge-${(item.status || 'Submitted').toLowerCase().replace(/\s+/g, '-')}`}>
                                <span className="pulse-dot" />
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <h3 className="g-title" style={{ fontSize: '1.05rem', margin: '8px 0 4px' }}>{item.title}</h3>
                          <p className="g-desc" style={{ fontSize: '0.84rem', margin: '0 0 12px' }}>{item.description}</p>

                          <div className="g-meta-grid" style={{ marginBottom: '12px' }}>
                            <div>
                              <span className="meta-label">{t('Department')}</span>
                              <span className="meta-value">{item.department}</span>
                            </div>
                            <div>
                              <span className="meta-label">{t('Location / Ward')}</span>
                              <span className="meta-value">{item.location}</span>
                            </div>
                            <div>
                              <span className="meta-label">{t('Officer Assigned')}</span>
                              <span className="meta-value">{item.assignedOfficer || 'Pending Dispatch'}</span>
                            </div>
                            <div>
                              <span className="meta-label">{t('Submitted On')}</span>
                              <span className="meta-value">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="g-card-footer" style={{ paddingTop: '10px' }}>
                            {item.feedback ? (
                              <span className="feedback-done-tag">
                                <MessageSquareCheck size={14} /> Citizen Feedback Submitted ({item.feedback.rating}/5 Stars)
                              </span>
                            ) : (
                              <span className="g-sla-info">SLA Target Date: <strong>{new Date(item.slaDeadline).toLocaleDateString()}</strong></span>
                            )}

                            <button 
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setShowSubmissionsModal(false);
                                selectGrievanceToTrack(item.id);
                                setActiveTab('track');
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>{t('trackProgress')}</span>
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const filtered = myApplications.filter(app => {
                    if (!app) return false;
                    const matchesStatus = submissionsStatusFilter === 'All' || app.status === submissionsStatusFilter;
                    const q = submissionsSearch.toLowerCase().trim();
                    if (!q) return matchesStatus;
                    const matchesText = (app.id || '').toLowerCase().includes(q) ||
                                        (app.serviceName || '').toLowerCase().includes(q) ||
                                        (app.department || '').toLowerCase().includes(q);
                    return matchesStatus && matchesText;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="empty-state glass-card" style={{ padding: '36px', textAlign: 'center' }}>
                        <Layers size={44} className="empty-icon" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {t('No service applications found')}
                        </h4>
                        <p className="text-muted small-text" style={{ margin: 0 }}>
                          {t('You have not applied for any official public certificates or municipal connections yet.')}
                        </p>
                        <button 
                          type="button" 
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '16px' }}
                          onClick={() => {
                            setShowSubmissionsModal(false);
                            const target = document.getElementById('citizen-services-section');
                            if (target) target.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {t('Explore Public Services Catalog')}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grievance-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {filtered.map(app => (
                        <div key={app.id} className="grievance-card glass-card" style={{ padding: '16px 20px' }}>
                          <div className="g-card-header">
                            <div className="g-id-badge">
                              <span className="g-id-bold">#{app.id}</span>
                              <span className="badge badge-info">{app.serviceName}</span>
                            </div>
                            <span className={`badge badge-${(app.status || 'Submitted').toLowerCase().replace(/\s+/g, '-')}`}>
                              <span className="pulse-dot" />
                              {app.status || 'Submitted'}
                            </span>
                          </div>

                          <div className="g-meta-grid" style={{ margin: '12px 0' }}>
                            <div>
                              <span className="meta-label">{t('Department')}</span>
                              <span className="meta-value">{app.department}</span>
                            </div>
                            <div>
                              <span className="meta-label">{t('Applicant Name')}</span>
                              <span className="meta-value">{app.applicantName}</span>
                            </div>
                            <div>
                              <span className="meta-label">{t('Fee Paid')}</span>
                              <span className="meta-value">{app.fee || '₹50'}</span>
                            </div>
                            <div>
                              <span className="meta-label">{t('Applied On')}</span>
                              <span className="meta-value">{new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="g-card-footer" style={{ paddingTop: '10px' }}>
                            <span className="small-text text-muted">
                              <CheckCircle size={14} color="#16a34a" /> {t('UIDAI Verified & DigiLocker Linked')}
                            </span>
                            <button 
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setShowSubmissionsModal(false);
                                selectGrievanceToTrack(app.id);
                                setActiveTab('track');
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>{t('Track Application')}</span>
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span className="small-text text-muted">
                {t('Showing submissions authenticated under JanSeva National Grievance Redressal Registry')}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {isCitizen && (
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setShowSubmissionsModal(false);
                      openGrievanceModal();
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FilePlus size={14} /> + Lodge New Grievance
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSubmissionsModal(false)}
                >
                  {t('Close')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

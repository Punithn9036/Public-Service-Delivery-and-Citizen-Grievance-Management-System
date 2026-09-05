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
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ICON_MAP = {
  FileText: FileText,
  Droplets: Droplets,
  Building2: Building2,
  Award: Award,
  Home: Home,
  Zap: Zap
};

export default function CitizenDashboard({
  grievances,
  services,
  applications,
  openGrievanceModal,
  openServiceModal,
  setActiveTab,
  selectGrievanceToTrack,
  searchQuery
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [viewScope, setViewScope] = useState('all'); // 'all' | 'my'
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

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
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDepartment && matchesSearch;
  });

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
    <div className="dashboard-content animate-fade-in">

      {/* Hero Welcome Banner */}
      <div className="hero-banner glass-card">
        <div className="hero-text">
          <span className="hero-pill">Official Public Governance Portal</span>
          <h1>Citizen Service Delivery & Grievance Redressal</h1>
          <p>
            Transparent, accountable, and SLA-bound public service fulfillment for every citizen.
            Lodge complaints, apply for official certificates, and monitor real-time officer progress.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={openGrievanceModal}>
              <FilePlus size={18} />
              {t('lodgeGrievance')}
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('services')}>
              {t('popularServices')}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-badge-art">
          <div className="glass-stat-chip">
            <span className="chip-num">{resolutionRate}%</span>
            <span className="chip-label">{t('slaCompliance')}</span>
          </div>
          <div className="glass-stat-chip glow">
            <span className="chip-num">{resolvedCount}</span>
            <span className="chip-label">{t('resolvedThisMonth')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-blue">
            <FileText size={22} color="#2563eb" />
          </div>
          <div>
            <span className="stat-title">{t('totalLodged')}</span>
            <h3 className="stat-value">{totalGrievances}</h3>
            <span className="stat-sub">Across all municipal wards</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-amber">
            <Clock size={22} color="#d97706" />
          </div>
          <div>
            <span className="stat-title">{t('inProgress')}</span>
            <h3 className="stat-value">{inProgressCount}</h3>
            <span className="stat-sub">Assigned to field officers</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-emerald">
            <CheckCircle size={22} color="#16a34a" />
          </div>
          <div>
            <span className="stat-title">{t('resolvedCases')}</span>
            <h3 className="stat-value">{resolvedCount}</h3>
            <span className="stat-sub">{resolutionRate}% resolution efficiency</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-rose">
            <AlertTriangle size={22} color="#e11d48" />
          </div>
          <div>
            <span className="stat-title">{t('urgentAlerts')}</span>
            <h3 className="stat-value">{urgentCount}</h3>
            <span className="stat-sub">High priority intervention</span>
          </div>
        </div>
      </div>

      {/* Popular Public Services Section */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <h2>{t('popularServices')}</h2>
            <p>Direct online applications with guaranteed Service Level Agreements (SLAs)</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('services')}>
            View All Services ({services.length})
          </button>
        </div>

        <div className="services-grid">
          {services.filter(s => s.popular).map(service => {
            const IconComponent = ICON_MAP[service.icon] || FileText;
            return (
              <div key={service.id} className="service-card glass-card">
                <div className="service-header">
                  <div className="service-icon-box">
                    <IconComponent size={24} />
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

      {/* Recent Grievances List & Filter */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <h2>{t('recentSubmissions')}</h2>
            <p>Track grievances submitted by citizens and monitor action taken by department officers</p>
          </div>

          {/* Scope Toggle: All Wards vs My Grievances */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

            {/* Filters */}
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
          <div className="empty-state glass-card">
            <FileText size={48} className="empty-icon" />
            <h3>No grievances found</h3>
            <p>Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="grievance-cards-list">
            {filteredGrievances.map(item => (
              <div key={item.id} className="grievance-card glass-card">
                <div className="g-card-header">
                  <div className="g-id-badge">
                    <span>{item.id}</span>
                    <span className={`priority-tag priority-${item.priority.toLowerCase()}`}>
                      {item.priority} Priority
                    </span>
                    {getSlaBadge(item)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.ipfsDocumentCid && (
                      <span style={{ fontSize: '0.7rem', color: '#2563eb', background: 'rgba(37,99,235,0.08)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Database size={11} /> IPFS Proof
                      </span>
                    )}
                    <span className={`badge badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="pulse-dot"></span>
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
                      <MessageSquareCheck size={14} /> Citizen Feedback Submitted ({item.feedback.rating}/5 ★)
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
  );
}

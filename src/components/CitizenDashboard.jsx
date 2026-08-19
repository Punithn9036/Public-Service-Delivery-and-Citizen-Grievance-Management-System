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
  Bot,
  ExternalLink,
  MessageSquareCheck
} from 'lucide-react';

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
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || item.department === departmentFilter;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDepartment && matchesSearch;
  });

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
              Lodge New Grievance
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('services')}>
              Browse Public Services
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-badge-art">
          <div className="glass-stat-chip">
            <span className="chip-num">{resolutionRate}%</span>
            <span className="chip-label">SLA Compliance Rate</span>
          </div>
          <div className="glass-stat-chip glow">
            <span className="chip-num">{resolvedCount}</span>
            <span className="chip-label">Cases Resolved This Month</span>
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
            <span className="stat-title">Total Lodged</span>
            <h3 className="stat-value">{totalGrievances}</h3>
            <span className="stat-sub">Across all municipal wards</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-amber">
            <Clock size={22} color="#d97706" />
          </div>
          <div>
            <span className="stat-title">In Progress</span>
            <h3 className="stat-value">{inProgressCount}</h3>
            <span className="stat-sub">Assigned to field officers</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-emerald">
            <CheckCircle size={22} color="#16a34a" />
          </div>
          <div>
            <span className="stat-title">Successfully Resolved</span>
            <h3 className="stat-value">{resolvedCount}</h3>
            <span className="stat-sub">{resolutionRate}% resolution efficiency</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-box bg-rose">
            <AlertTriangle size={22} color="#e11d48" />
          </div>
          <div>
            <span className="stat-title">Urgent Alerts</span>
            <h3 className="stat-value">{urgentCount}</h3>
            <span className="stat-sub">High priority intervention</span>
          </div>
        </div>
      </div>

      {/* Popular Public Services Section */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <h2>Popular Public Services</h2>
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
                    Apply Now
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
            <h2>Recent Grievance Submissions</h2>
            <p>Track grievances submitted by citizens and monitor action taken by department officers</p>
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
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
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
                  </div>
                  <span className={`badge badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    <span className="pulse-dot"></span>
                    {item.status}
                  </span>
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
                    <span className="meta-value">{item.assignedOfficer}</span>
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
                    <span className="g-sla-info">SLA Deadline: <strong>{new Date(item.slaDeadline).toLocaleDateString()}</strong></span>
                  )}

                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      selectGrievanceToTrack(item.id);
                      setActiveTab('track');
                    }}
                  >
                    Track Progress & Timeline
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

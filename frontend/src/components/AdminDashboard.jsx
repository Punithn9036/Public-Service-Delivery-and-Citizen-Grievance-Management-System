import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileSpreadsheet, 
  UserPlus, 
  Filter, 
  Edit3, 
  BarChart2, 
  PieChart, 
  Send,
  Building
} from 'lucide-react';

export default function AdminDashboard({
  grievances,
  applications,
  departments,
  onUpdateGrievanceStatus,
  onAssignOfficer
}) {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  // Metrics
  const total = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Submitted' || g.status === 'Under Review').length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress' || g.status === 'Assigned').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const urgentCount = grievances.filter(g => g.priority === 'Urgent').length;

  const filteredList = grievances.filter(g => {
    const matchDept = selectedDept === 'All' || g.department === selectedDept;
    const matchStatus = selectedStatus === 'All' || g.status === selectedStatus;
    return matchDept && matchStatus;
  });

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setNewStatus(item.status);
    setOfficerName(item.assignedOfficer || '');
    setResolutionNote('');
  };

  const handleSaveUpdate = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateGrievanceStatus(
      editingItem.id, 
      newStatus, 
      officerName || 'Municipal Nodal Officer', 
      resolutionNote || `Status updated to ${newStatus} by Admin Controller.`
    );
    setEditingItem(null);
  };

  const exportCSV = () => {
    const headers = "ID,Title,Department,Priority,Status,Citizen,Location,SubmittedDate\n";
    const rows = grievances.map(g => 
      `"${g.id}","${g.title.replace(/"/g, '""')}","${g.department}","${g.priority}","${g.status}","${g.citizenName}","${g.location}","${g.createdAt}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JanSeva_Grievances_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="admin-container animate-fade-in">
      
      {/* Officer Header */}
      <div className="admin-header glass-card">
        <div className="admin-header-title">
          <div className="badge-official">
            <ShieldCheck size={18} />
            <span>Nodal Officer Control Dashboard</span>
          </div>
          <h1>Public Service Delivery Governance Center</h1>
          <p>Real-time grievance routing, officer dispatch, SLA tracking, and resolution oversight.</p>
        </div>

        <div className="admin-actions">
          <button className="btn btn-primary" onClick={exportCSV}>
            <FileSpreadsheet size={18} />
            Export CSV Summary Report
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="admin-kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-top">
            <span>Total Lodged</span>
            <Building size={20} className="text-blue" />
          </div>
          <h2>{total}</h2>
          <span className="kpi-foot">All Municipal Wards</span>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-top">
            <span>Awaiting Review</span>
            <Clock size={20} className="text-amber" />
          </div>
          <h2>{pendingCount}</h2>
          <span className="kpi-foot text-amber">Needs Routing & Assignment</span>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-top">
            <span>Active In Field</span>
            <UserCheck size={20} className="text-blue" />
          </div>
          <h2>{inProgressCount}</h2>
          <span className="kpi-foot">Officers dispatched</span>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-top">
            <span>Resolved Cases</span>
            <CheckCircle size={20} className="text-emerald" />
          </div>
          <h2>{resolvedCount}</h2>
          <span className="kpi-foot text-emerald">{Math.round((resolvedCount/total)*100)}% SLA Compliance</span>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-top">
            <span>Urgent Escalations</span>
            <AlertTriangle size={20} className="text-rose" />
          </div>
          <h2>{urgentCount}</h2>
          <span className="kpi-foot text-rose">&lt; 24 hr SLA Limit</span>
        </div>
      </div>

      {/* Department Breakdown Bar Graph Visualizer */}
      <div className="admin-analytics-card glass-card">
        <h3><BarChart2 size={20} /> Department Grievance Workload Breakdown</h3>
        <div className="dept-bars-list">
          {departments.slice(0, 5).map(dept => {
            const count = grievances.filter(g => g.department === dept).length;
            const pct = Math.min(100, Math.round((count / total) * 100) || 5);
            return (
              <div key={dept} className="dept-bar-item">
                <div className="bar-info">
                  <span className="dept-name">{dept}</span>
                  <span className="dept-count">{count} Tickets ({pct}%)</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grievance Management Table */}
      <div className="admin-table-card glass-card">
        <div className="table-header-controls">
          <div>
            <h2>Manage Grievance Tickets</h2>
            <p>Assign officers, update status, and attach official resolution notes</p>
          </div>

          <div className="filter-row">
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
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

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title & Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Assigned Officer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(item => (
                <tr key={item.id}>
                  <td className="td-id">
                    <strong>{item.id}</strong>
                    <span className="td-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div className="td-title">{item.title}</div>
                    <div className="td-sub">{item.location}</div>
                  </td>
                  <td>{item.department}</td>
                  <td>
                    <span className={`priority-pill priority-${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <div className="officer-cell">
                      <UserCheck size={14} className="text-muted" />
                      <span>{item.assignedOfficer || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit3 size={14} /> Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h2>Update Ticket #{editingItem.id}</h2>
              <button className="close-btn" onClick={() => setEditingItem(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveUpdate} className="modal-form">
              <div className="form-info-box">
                <h4>{editingItem.title}</h4>
                <p><strong>Citizen:</strong> {editingItem.citizenName} ({editingItem.citizenPhone})</p>
                <p><strong>Location:</strong> {editingItem.location}</p>
              </div>

              <div className="form-group">
                <label>Change Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign Field Officer / Supervisor</label>
                <input 
                  type="text" 
                  value={officerName} 
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Er. Rajesh Varma (Sanitation Inspector)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Add Official Action / Resolution Note</label>
                <textarea 
                  value={resolutionNote} 
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe action taken, machinery dispatched, or resolution report..."
                  rows={4}
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

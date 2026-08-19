import React from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

export default function NotificationsDrawer({ notifications, onClose, onClearAll }) {
  return (
    <div className="notifications-drawer glass-card animate-slide-left">
      <div className="drawer-header">
        <div className="flex-align-center gap-2">
          <Bell size={18} className="text-blue" />
          <h3>Portal Activity Alerts</h3>
        </div>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="drawer-body">
        {notifications.length === 0 ? (
          <div className="empty-notif text-center">
            <p className="muted-text">No unread notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="notif-item">
              <div className="notif-icon">
                {n.type === 'resolved' ? <CheckCircle size={16} color="#16a34a" /> : <Clock size={16} color="#2563eb" />}
              </div>
              <div className="notif-text">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="notif-time">{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="drawer-footer">
          <button className="btn btn-secondary btn-sm full-width" onClick={onClearAll}>
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
}

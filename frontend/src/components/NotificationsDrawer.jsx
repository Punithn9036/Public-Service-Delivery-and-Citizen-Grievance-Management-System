import React from 'react';
import { Bell, CheckCircle, Clock, ExternalLink } from 'lucide-react';

export default function NotificationsDrawer({ notifications, onClose, onClearAll, onSelectNotification }) {
  return (
    <div className="notifications-drawer glass-card animate-slide-left" style={{
      position: 'fixed',
      top: '70px',
      right: '20px',
      width: '360px',
      maxHeight: '480px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 15px 35px rgba(0,0,0,0.18)',
      borderRadius: '12px'
    }}>
      <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex-align-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} className="text-blue" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Portal Activity Alerts</h3>
        </div>
        <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
      </div>

      <div className="drawer-body" style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.length === 0 ? (
          <div className="empty-notif text-center" style={{ padding: '24px 0' }}>
            <p className="small-text text-muted" style={{ margin: 0 }}>No unread notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className="notif-item"
              onClick={() => {
                if (onSelectNotification) onSelectNotification(n);
                onClose();
              }}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--bg-tertiary)',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              <div className="notif-icon" style={{ marginTop: '2px' }}>
                {n.type === 'resolved' ? <CheckCircle size={16} color="#16a34a" /> : <Clock size={16} color="#2563eb" />}
              </div>
              <div className="notif-text" style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '2px' }}>{n.title}</strong>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{n.message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span className="notif-time" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                  <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Track <ExternalLink size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="drawer-footer" style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.8rem' }} onClick={onClearAll}>
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
}

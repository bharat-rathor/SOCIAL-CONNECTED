import React from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAllRead, clearNotifications, unreadCount } = useNotification();

  return (
    <div className="notif-dropdown" role="menu" aria-label="Notifications">
      <div className="notif-dropdown-header">
        <span className="notif-dropdown-title">
          Notifications {unreadCount > 0 && <span style={{ color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>({unreadCount} new)</span>}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead} title="Mark all as read">
              <CheckCheck size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearNotifications} title="Clear all">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 20).map(n => (
            <NotificationItem key={n.id} notif={n} onClose={onClose} />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

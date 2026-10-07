import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Eye, Crown, Check, CheckCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/dateUtils';

const TYPE_CONFIG = {
  like: { icon: Heart, color: 'var(--error)', bg: '#fef2f2' },
  message: { icon: MessageSquare, color: 'var(--primary)', bg: 'var(--primary-subtle)' },
  view: { icon: Eye, color: 'var(--gray-500)', bg: 'var(--gray-100)' },
  premium: { icon: Crown, color: 'var(--gold)', bg: 'var(--accent-subtle)' },
  system: { icon: Check, color: 'var(--success)', bg: 'var(--success-subtle)' },
};

const NotificationItem = ({ notif, onClose }) => {
  const { markNotifRead } = useNotification();
  const navigate = useNavigate();
  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
  const Icon = config.icon;

  const handleClick = () => {
    markNotifRead(notif.id);
    if (notif.targetRoute) navigate(notif.targetRoute);
    if (onClose) onClose();
  };

  return (
    <div
      className={`notif-item ${!notif.read ? 'unread' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: config.bg
        }}
      >
        <Icon size={16} style={{ color: config.color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="notif-item-text">{notif.text}</div>
        <div className="notif-item-time">{timeAgo(notif.timestamp)}</div>
      </div>
      {!notif.read && <div className="notif-dot" />}
    </div>
  );
};

export default NotificationItem;

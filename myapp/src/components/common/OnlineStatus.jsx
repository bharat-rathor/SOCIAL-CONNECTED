import React from 'react';
import { timeAgo } from '../../utils/dateUtils';

const OnlineStatus = ({ user, showLabel = true }) => {
  if (!user) return null;
  return (
    <span className="flex items-center gap-xs" style={{ gap: '5px' }}>
      <span className={`online-dot ${user.online ? 'online' : 'offline'}`} />
      {showLabel && (
        <span className="text-xs text-muted">
          {user.online ? 'Online' : user.lastSeen ? `Last seen ${timeAgo(user.lastSeen)}` : 'Offline'}
        </span>
      )}
    </span>
  );
};

export default OnlineStatus;

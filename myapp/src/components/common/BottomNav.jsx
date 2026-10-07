import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, MessageSquare, User } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const BottomNav = () => {
  const { totalUnread } = useChat();
  const location = useLocation();
  const unread = totalUnread();

  // Hide bottom nav on full-screen chat view to provide maximum screen height
  if (location.pathname.startsWith('/chat/')) {
    return null;
  }

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/likes', icon: Heart, label: 'Likes' },
    { to: '/messages', icon: MessageSquare, label: 'Messages', badge: unread },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div className="bottom-nav-inner">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={label}
          >
            <div className="bottom-nav-icon-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} />
              {badge > 0 && (
                <span className="bottom-nav-badge">{badge > 9 ? '9+' : badge}</span>
              )}
            </div>
            <span className="bottom-nav-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

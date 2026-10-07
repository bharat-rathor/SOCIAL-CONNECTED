import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Users, Home, Compass, Heart, MessageSquare, User, Bell, LogOut, Crown, ChevronDown, Star, Wifi, Laptop } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { usePeer } from '../../context/PeerContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Modal from './Modal';
import P2PModal from './P2PModal';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { totalUnread } = useChat();
  const { unreadCount } = useNotification();
  const { isPeerReady, connectedPeers } = usePeer();
  const navigate = useNavigate();

  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showP2PModal, setShowP2PModal] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const unread = totalUnread();

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to={currentUser ? '/home' : '/'} className="navbar-brand">
            <div className="navbar-logo-icon">
              <i className="fa-solid fa-users"></i>
            </div>
            Social Connect
          </Link>

          {/* Desktop Nav Links */}
          {currentUser && (
            <nav className="navbar-nav">
              <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fa-solid fa-house" style={{ fontSize: '14px' }}></i>
                Home
              </NavLink>
              <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fa-solid fa-compass" style={{ fontSize: '14px' }}></i>
                Discover
              </NavLink>
              <NavLink to="/likes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fa-solid fa-heart" style={{ fontSize: '14px' }}></i>
                Likes
              </NavLink>
              <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
                <i className="fa-solid fa-comment-dots" style={{ fontSize: '14px' }}></i>
                Messages
                {unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fa-solid fa-user" style={{ fontSize: '14px' }}></i>
                Profile
              </NavLink>
            </nav>
          )}

          {/* Right Actions */}
          <div className="navbar-actions">
            {currentUser ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    className="btn btn-icon"
                    onClick={() => { setShowNotif(p => !p); setShowUserMenu(false); }}
                    aria-label="Notifications"
                    style={{ position: 'relative', fontSize: '15px' }}
                  >
                    <i className="fa-solid fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </button>
                  {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
                </div>

                {/* User Avatar Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center gap-xs"
                    style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '4px 10px 4px 4px', cursor: 'pointer', gap: '6px' }}
                    onClick={() => { setShowUserMenu(p => !p); setShowNotif(false); }}
                    aria-label="User menu"
                  >
                    <img
                      src={currentUser.image}
                      alt={currentUser.name}
                      className="avatar avatar-sm"
                    />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hide-mobile">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <i className="fa-solid fa-chevron-down hide-mobile" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
                  </button>

                  {showUserMenu && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', minWidth: 190, zIndex: 2000, overflow: 'hidden' }}>
                      <Link to="/profile" className="flex items-center gap-sm" style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', transition: 'var(--transition)', display: 'flex', gap: '10px', alignItems: 'center' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-user" style={{ width: 16 }}></i> My Profile
                      </Link>
                      <Link to="/favorites" className="flex items-center gap-sm" style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, color: '#eab308', transition: 'var(--transition)', display: 'flex', gap: '10px', alignItems: 'center' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-star" style={{ width: 16, color: '#eab308' }}></i> Starred Profiles
                      </Link>
                      <Link to="/subscription" className="flex items-center gap-sm" style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 600, color: '#f59e0b', transition: 'var(--transition)', display: 'flex', gap: '10px', alignItems: 'center' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-crown" style={{ width: 16, color: '#f59e0b' }}></i> {currentUser.isPremium ? 'Manage Premium' : 'Go Premium'}
                      </Link>
                      <a href="/report.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm" style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', transition: 'var(--transition)', display: 'flex', gap: '10px', alignItems: 'center' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-file-pdf" style={{ width: 16, color: '#ef4444' }}></i> 15-Page Report (PDF)
                      </a>
                      <Link to="/settings" className="flex items-center gap-sm" style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', transition: 'var(--transition)', display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid var(--border)' }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-gear" style={{ width: 16 }}></i> Settings
                      </Link>
                      <button
                        onClick={() => { setShowUserMenu(false); setShowLogoutModal(true); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'left', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--error-subtle)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-right-from-bracket" style={{ width: 16 }}></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout"
        subtitle="Are you sure you want to logout?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </>
        }
      />
    </>
  );
};

export default Navbar;

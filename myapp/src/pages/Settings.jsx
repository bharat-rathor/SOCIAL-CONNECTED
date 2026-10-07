import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Shield, Slash, RotateCcw,
  LogOut, Check, UserX, AlertTriangle, Eye, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { clearAll, setData } from '../utils/localStorage';
import { DEMO_USERS } from '../data/users';
import { DEMO_MESSAGES } from '../data/messages';
import Modal from '../components/common/Modal';

const Settings = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const { blockedUsers, unblockUser, getUserById } = useUserContext();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const savedSettings = getData('settings', {
    showOnline: currentUser?.showOnline !== false,
    showLastSeen: currentUser?.showLastSeen !== false,
    discoverable: currentUser?.discoverable !== false,
    soundNotifications: true,
    messagePreviews: true
  });

  // Privacy toggles state (persisted in settings and on currentUser)
  const [showOnline, setShowOnline] = useState(savedSettings.showOnline);
  const [showLastSeen, setShowLastSeen] = useState(savedSettings.showLastSeen);
  const [discoverable, setDiscoverable] = useState(savedSettings.discoverable);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const updateSettingField = (field, val) => {
    const current = getData('settings', {}) || {};
    const updated = { ...current, [field]: val };
    setData('settings', updated);
  };

  const handleToggleOnline = () => {
    const val = !showOnline;
    setShowOnline(val);
    updateSettingField('showOnline', val);
    updateProfile({ showOnline: val });
    showToast('info', 'Privacy Updated', `Online status is now ${val ? 'visible' : 'hidden'}.`);
  };

  const handleToggleLastSeen = () => {
    const val = !showLastSeen;
    setShowLastSeen(val);
    updateSettingField('showLastSeen', val);
    updateProfile({ showLastSeen: val });
    showToast('info', 'Privacy Updated', `Last seen timestamp is now ${val ? 'visible' : 'hidden'}.`);
  };

  const handleToggleDiscoverable = () => {
    const val = !discoverable;
    setDiscoverable(val);
    updateSettingField('discoverable', val);
    updateProfile({ discoverable: val });
    showToast('info', 'Privacy Updated', `Profile discovery is now ${val ? 'active' : 'paused'}.`);
  };

  const handleUnblock = (id, name) => {
    unblockUser(id);
    showToast('success', 'User Unblocked', `${name} has been unblocked.`);
  };

  const handleResetData = () => {
    clearAll();
    setData('users', DEMO_USERS);
    setData('messages', DEMO_MESSAGES);
    setShowResetModal(false);
    logout();
    navigate('/login');
    window.location.reload();
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 20px)', paddingBottom: 60, maxWidth: 780 }}>
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon size={26} style={{ color: 'var(--primary)' }} />
          Account & Privacy Settings
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Manage your personal privacy, blocked members, and preferences
        </p>
      </div>

      {/* Privacy Section */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={18} style={{ color: 'var(--primary)' }} />
          Privacy Controls
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Show Online Status</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Let others see when you are currently active on Social Connect
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`btn btn-sm ${showOnline ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: 68 }}
            >
              {showOnline ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Show Last Seen</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Display the last time you were active on your profile
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleLastSeen}
              className={`btn btn-sm ${showLastSeen ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: 68 }}
            >
              {showLastSeen ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Visible in Discover</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Allow your profile to appear in search results and nearby matches
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleDiscoverable}
              className={`btn btn-sm ${discoverable ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: 68 }}
            >
              {discoverable ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Users Section */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Slash size={18} style={{ color: 'var(--error)' }} />
          Blocked Users ({blockedUsers.length})
        </h3>

        {blockedUsers.length === 0 ? (
          <div style={{ padding: '16px 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            You haven't blocked any users yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {blockedUsers.map((id) => {
              const u = getUserById(id);
              if (!u) return null;
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={u.image}
                      alt={u.name}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.city}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleUnblock(u.id, u.name)}
                    style={{ fontSize: '12px' }}
                  >
                    Unblock
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* College Project / Demo Controls */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <RotateCcw size={18} style={{ color: 'var(--gold)' }} />
          Developer & Demo Reset
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 16 }}>
          Reset demo accounts, dummy messages, likes, and state back to default college evaluation baseline.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowResetModal(true)}>
          <RotateCcw size={14} /> Reset Demo Data
        </button>
      </div>

      {/* Logout Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="btn btn-error" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={16} /> Sign Out of Account
        </button>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out?"
        subtitle="You will need to sign in again to access your account"
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to log out of Social Connect?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
          <button className="btn btn-error" onClick={handleConfirmLogout}>Log Out</button>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Demo Data?"
        subtitle="This will wipe all localStorage changes and reload original sample data"
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
          This will restore the 18 demo users, sample conversations, and clear your custom profile. Continue?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleResetData}>Confirm Reset</button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

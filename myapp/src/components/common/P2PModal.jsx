import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Copy, Check, Users, MessageSquare, RefreshCw, Trash2, Laptop, ShieldCheck } from 'lucide-react';
import { usePeer } from '../../context/PeerContext';
import { useAuth } from '../../context/AuthContext';
import { useUserContext } from '../../context/UserContext';
import Modal from './Modal';

const P2PModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const {
    isPeerReady,
    peerId,
    myPairCode,
    connectedPeers,
    pairWithPeer,
    syncCustomUsersWithAllPeers,
    connectionStatus
  } = usePeer();
  const { users, rawUsers, clearDemoUsers, restoreDemoUsers } = useUserContext();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!myPairCode) return;
    navigator.clipboard?.writeText(myPairCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePair = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setFeedback({ type: 'info', text: 'Connecting to 2nd laptop...' });
    const success = pairWithPeer(inputCode.trim());
    if (success) {
      setFeedback({ type: 'success', text: 'Pairing initiated! Handshaking in progress...' });
      setInputCode('');
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', text: 'Could not connect. Ensure 2nd laptop is online.' });
    }
  };

  const handleChatWith = (userId) => {
    onClose();
    navigate(`/messages?userId=${userId}`);
  };

  const handleSyncAll = () => {
    syncCustomUsersWithAllPeers();
    setFeedback({ type: 'success', text: 'All created accounts sent to connected laptops!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Count custom vs demo users
  const customCount = (rawUsers || users).filter(u => u.id > 100 || String(u.id).length > 5).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Real-Time Multi-Laptop Communication">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Network Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Wifi size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--success)' }}>
              ⚡ Real-Time Multi-Laptop Engine Active!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
              Accounts created on Laptop 1 or Laptop 2 automatically appear on both laptops. Chat messages & online presence sync instantly over Wi-Fi!
            </div>
          </div>
        </div>

        {/* Laptop 2 Access URL */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 6 }}>
            🌐 Open this URL on your 2nd Laptop (Same Wi-Fi):
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              fontWeight: 700,
              padding: '8px 12px',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--primary)'
            }}>
              http://10.104.184.234:5173/
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                navigator.clipboard?.writeText('http://10.104.184.234:5173/');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied URL' : 'Copy URL'}
            </button>
          </div>
        </div>

        {/* My Device Pairing Code */}
        <div style={{
          background: 'var(--gray-50)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Laptop Code (Share with Laptop 2)
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
              Logged in as: {currentUser?.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 700,
              padding: '8px 12px',
              background: '#fff',
              border: '1px dashed var(--primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--primary-dark)',
              userSelect: 'all',
              letterSpacing: '1px'
            }}>
              {myPairCode || 'Loading ID...'}
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopyCode}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Connect to 2nd Laptop Form */}
        <form onSubmit={handlePair} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-700)' }}>
            Connect to 2nd Laptop:
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Paste 2nd laptop code (e.g. 1712345678)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!inputCode.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Laptop size={16} />
              Pair Device
            </button>
          </div>
          {feedback && (
            <div style={{
              fontSize: '0.82rem',
              color: feedback.type === 'error' ? 'var(--danger)' : feedback.type === 'success' ? 'var(--success)' : 'var(--primary)',
              fontWeight: 500,
              marginTop: 4
            }}>
              {feedback.text}
            </div>
          )}
        </form>

        {/* Connected Laptops List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-800)' }}>
              Connected Laptops ({connectedPeers.length}):
            </span>
            {connectedPeers.length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={handleSyncAll}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} />
                Sync Accounts
              </button>
            )}
          </div>

          {connectedPeers.length === 0 ? (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--gray-500)'
            }}>
              No 2nd laptop paired yet. Open the app on your second laptop, copy its code, and paste it above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {connectedPeers.map(peer => (
                <div key={peer.userId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={peer.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                        alt={peer.user?.name}
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span className="online-dot online" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{peer.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>
                        🟢 Online in Real-Time
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleChatWith(peer.userId)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <MessageSquare size={14} />
                    Chat Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Users & Storage Controls */}
        <div style={{
          marginTop: 6,
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-800)' }}>
                Account Storage (Localhost)
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {customCount} custom user(s) created by you.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={clearDemoUsers}
                title="Hide all 18 demo accounts and only show accounts you created"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Trash2 size={12} />
                Hide Demo Users
              </button>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={restoreDemoUsers}
                title="Restore demo users whenever needed"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={12} />
                Restore Demo Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default P2PModal;

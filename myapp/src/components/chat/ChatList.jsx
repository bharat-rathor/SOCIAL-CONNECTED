import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search, X, UserPlus, MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useUserContext } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { formatChatTime } from '../../utils/dateUtils';
import OnlineStatus from '../common/OnlineStatus';
import { DEFAULT_USER_PHOTO } from '../../data/users';

const ChatList = ({ activePartnerId, onSelect }) => {
  const { currentUser } = useAuth();
  const { getConversationPartners, getLastMessage, getUnreadCount } = useChat();
  const { getUserById, blockedUsers, isFavorite, toggleFavorite, users } = useUserContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  // All existing chat partners
  const partners = useMemo(() => {
    return getConversationPartners()
      .filter(id => !(blockedUsers || []).includes(id))
      .map(id => {
        const user = getUserById(id);
        const lastMsg = getLastMessage(id);
        const unread = getUnreadCount(id);
        const faved = user ? isFavorite(user.id) : false;
        return { user, lastMsg, unread, faved };
      })
      .filter(p => p.user)
      .sort((a, b) => {
        if (a.faved && !b.faved) return -1;
        if (!a.faved && b.faved) return 1;
        const aTime = a.lastMsg ? new Date(a.lastMsg.timestamp) : 0;
        const bTime = b.lastMsg ? new Date(b.lastMsg.timestamp) : 0;
        return bTime - aTime;
      });
  }, [getConversationPartners, blockedUsers, getUserById, getLastMessage, getUnreadCount, isFavorite]);

  // All other registered users who don't have an active chat yet
  const otherRegisteredUsers = useMemo(() => {
    const partnerIds = new Set(partners.map(p => p.user.id));
    return (users || []).filter(u =>
      u.id !== currentUser?.id &&
      !partnerIds.has(u.id) &&
      !(blockedUsers || []).includes(u.id)
    );
  }, [users, currentUser?.id, partners, blockedUsers]);

  // Filter existing conversations by search query
  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return partners;
    const q = searchQuery.toLowerCase().trim();
    return partners.filter(p =>
      p.user.name?.toLowerCase().includes(q) ||
      p.user.email?.toLowerCase().includes(q)
    );
  }, [partners, searchQuery]);

  // Search across all other users in system
  const filteredOtherUsers = useMemo(() => {
    if (!searchQuery.trim()) return otherRegisteredUsers;
    const q = searchQuery.toLowerCase().trim();
    return otherRegisteredUsers.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  }, [otherRegisteredUsers, searchQuery]);

  return (
    <div className="chat-list" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search Input Bar (Real-World WhatsApp / Instagram style) */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ position: 'relative' }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search people by name to chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: 34,
              paddingRight: searchQuery ? 32 : 12,
              height: 38,
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gray-50)',
              border: '1px solid var(--border)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Chat & Users Feed */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Existing Conversations */}
        {filteredPartners.length > 0 && (
          <div>
            {searchQuery && (
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '10px 14px 4px', letterSpacing: '0.05em' }}>
                Conversations ({filteredPartners.length})
              </div>
            )}
            {filteredPartners.map(({ user, lastMsg, unread, faved }) => {
              const isActive = activePartnerId === user.id;
              const isMe = lastMsg?.senderId === currentUser?.id;

              return (
                <div
                  key={user.id}
                  className={`chat-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelect(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 14px',
                    gap: 12,
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'var(--transition)'
                  }}
                >
                  <div className="chat-item-avatar-wrap" style={{ position: 'relative' }}>
                    <img
                      src={user.image}
                      alt={user.name}
                      className="avatar avatar-md"
                      onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                    />
                    <span style={{ position: 'absolute', bottom: 0, right: 0 }}>
                      <OnlineStatus user={user} showLabel={false} />
                    </span>
                  </div>

                  <div className="chat-item-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="chat-item-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {user.name}
                      </span>
                      {faved && (
                        <i className="fa-solid fa-star" style={{ color: '#eab308', fontSize: '11px', flexShrink: 0 }}></i>
                      )}
                    </div>
                    {lastMsg && (
                      <div className="chat-item-preview" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isMe ? 'You: ' : ''}{lastMsg.message || (lastMsg.image ? '📷 Photo' : '')}
                      </div>
                    )}
                  </div>

                  <div className="chat-item-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {lastMsg && (
                      <span className="chat-item-time" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatChatTime(lastMsg.timestamp)}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(user.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 2,
                          cursor: 'pointer',
                          color: faved ? '#eab308' : 'var(--text-muted)',
                          display: 'flex',
                          opacity: faved ? 1 : 0.4
                        }}
                        aria-label="Star"
                      >
                        <i className={`fa-${faved ? 'solid' : 'regular'} fa-star`} style={{ fontSize: '13px' }}></i>
                      </button>
                      {unread > 0 && (
                        <span className="chat-unread-badge">{unread > 9 ? '9+' : unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New People / Search Results */}
        {filteredOtherUsers.length > 0 && (
          <div style={{ marginTop: filteredPartners.length > 0 ? 8 : 0 }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              padding: '10px 14px 6px',
              letterSpacing: '0.05em',
              background: 'var(--gray-50)',
              borderTop: filteredPartners.length > 0 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)'
            }}>
              {searchQuery ? `Other People (${filteredOtherUsers.length})` : `People You Can Chat With (${filteredOtherUsers.length})`}
            </div>

            {filteredOtherUsers.map(user => (
              <div
                key={user.id}
                className="chat-item"
                onClick={() => onSelect(user.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  gap: 12,
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={user.image}
                    alt={user.name}
                    className="avatar avatar-md"
                    onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                  />
                  <span style={{ position: 'absolute', bottom: 0, right: 0 }}>
                    <OnlineStatus user={user} showLabel={false} />
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.city ? `${user.city} • ` : ''}{user.bio || 'Available for chat'}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-premium btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(user.id);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  <i className="fa-solid fa-comment-dots"></i>
                  Chat
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {searchQuery && filteredPartners.length === 0 && filteredOtherUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              No people found for "{searchQuery}"
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
              Check spelling or try searching another name.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

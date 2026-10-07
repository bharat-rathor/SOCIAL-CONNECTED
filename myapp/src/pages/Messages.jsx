import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Compass, Images } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { useSubscription } from '../context/SubscriptionContext';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import AlbumTab from '../components/chat/AlbumTab';
import AlbumViewer from '../components/chat/AlbumViewer';
import GroupTab from '../components/chat/GroupTab';
import GroupChatWindow from '../components/chat/GroupChatWindow';
import PremiumModal from '../components/subscription/PremiumModal';
import { useGroup } from '../context/GroupContext';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const partnerIdFromUrl = searchParams.get('userId');

  const { currentUser } = useAuth();
  const { getUserById } = useUserContext();
  const { getConversationPartners, totalUnread, messages } = useChat();
  const { groups, getAdminTotalPendingRequests } = useGroup();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [sidebarTab, setSidebarTab] = useState('chats'); // 'chats' | 'groups' | 'albums'
  const [activePartnerId, setActivePartnerId] = useState(
    partnerIdFromUrl ? Number(partnerIdFromUrl) : null
  );
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeAlbum, setActiveAlbum] = useState(null); // { type, user, photos }
  const [premiumModalUser, setPremiumModalUser] = useState(null);

  // If URL changes, update active partner
  useEffect(() => {
    if (partnerIdFromUrl) {
      setActivePartnerId(Number(partnerIdFromUrl));
    }
  }, [partnerIdFromUrl]);

  // Auto-select partner only on desktop screens when none is specified
  useEffect(() => {
    const isMobileScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobileScreen) return; // On mobile, allow user to browse the conversations / albums list first

    if (!activePartnerId && !partnerIdFromUrl) {
      const partners = getConversationPartners();
      if (partners.length > 0) {
        setActivePartnerId(partners[0]);
      }
    }
  }, [activePartnerId, partnerIdFromUrl, getConversationPartners]);

  const activePartner = activePartnerId ? getUserById(activePartnerId) : null;

  const handleSelectPartner = (id) => {
    const target = getUserById(id);
    if (target?.isPremium && !isPremium) {
      setPremiumModalUser(target);
      return;
    }
    setActivePartnerId(id);
    setSearchParams({ userId: id });
  };

  return (
    <div className="container messages-page-container" style={{ paddingTop: 'calc(var(--navbar-height) + 16px)', paddingBottom: 60, height: 'calc(100vh - 20px)' }}>
      <div className="card messages-container" style={{
        height: '100%',
        padding: 0,
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        {/* Left Side: Sidebar with Chats, Groups, and Albums tabs */}
        <div className={`messages-sidebar ${(activePartnerId || activeAlbum || activeGroupId) ? 'mobile-hide' : ''}`} style={{
          width: 'clamp(280px, 32vw, 360px)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)'
        }}>
          {/* Header Title Bar */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {sidebarTab === 'chats' ? (
                <>
                  <i className="fa-solid fa-comment-dots" style={{ color: 'var(--primary)', fontSize: 19 }}></i>
                  Chat
                </>
              ) : sidebarTab === 'groups' ? (
                <>
                  <i className="fa-solid fa-users" style={{ color: 'var(--primary)', fontSize: 18 }}></i>
                  Groups
                </>
              ) : (
                <>
                  <i className="fa-solid fa-images" style={{ color: 'var(--primary)', fontSize: 18 }}></i>
                  Albums
                </>
              )}
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/discover')}
              title="Find new people"
            >
              <i className="fa-solid fa-compass" style={{ fontSize: 16 }}></i>
            </button>
          </div>

          {/* Sub Tab Bar: Chats | Groups | Albums */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-elevated)'
          }}>
            <button
              type="button"
              className={`btn btn-ghost ${sidebarTab === 'chats' ? 'active-tab' : ''}`}
              onClick={() => {
                setSidebarTab('chats');
                setActiveAlbum(null);
                setActiveGroupId(null);
              }}
              style={{
                flex: 1,
                borderRadius: 0,
                borderBottom: sidebarTab === 'chats' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: sidebarTab === 'chats' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                color: sidebarTab === 'chats' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: sidebarTab === 'chats' ? 800 : 600,
                padding: '12px 8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s'
              }}
            >
              <i className="fa-solid fa-comment-dots" style={{ color: sidebarTab === 'chats' ? 'var(--primary)' : 'inherit', fontSize: 14 }}></i>
              <span style={{ color: sidebarTab === 'chats' ? 'var(--primary)' : 'inherit' }}>Chats</span>
              {totalUnread() > 0 ? (
                <span style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  lineHeight: '14px'
                }}>
                  {totalUnread()}
                </span>
              ) : (
                <span style={{
                  background: sidebarTab === 'chats' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {getConversationPartners().length}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`btn btn-ghost ${sidebarTab === 'groups' ? 'active-tab' : ''}`}
              onClick={() => {
                setSidebarTab('groups');
                setActiveAlbum(null);
                setActivePartnerId(null);
              }}
              style={{
                flex: 1,
                borderRadius: 0,
                borderBottom: sidebarTab === 'groups' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: sidebarTab === 'groups' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                color: sidebarTab === 'groups' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: sidebarTab === 'groups' ? 800 : 600,
                padding: '12px 8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s'
              }}
            >
              <i className="fa-solid fa-users" style={{ color: sidebarTab === 'groups' ? 'var(--primary)' : 'inherit', fontSize: 13 }}></i>
              <span style={{ color: sidebarTab === 'groups' ? 'var(--primary)' : 'inherit' }}>Groups</span>
              {getAdminTotalPendingRequests && getAdminTotalPendingRequests() > 0 ? (
                <span style={{
                  background: '#eab308',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }} title={`${getAdminTotalPendingRequests()} pending join request(s) waiting for your approval`}>
                  {getAdminTotalPendingRequests()}!
                </span>
              ) : (
                <span style={{
                  background: sidebarTab === 'groups' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {groups?.length || 0}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`btn btn-ghost ${sidebarTab === 'albums' ? 'active-tab' : ''}`}
              onClick={() => {
                setSidebarTab('albums');
                setActiveGroupId(null);
              }}
              style={{
                flex: 1,
                borderRadius: 0,
                borderBottom: sidebarTab === 'albums' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: sidebarTab === 'albums' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                color: sidebarTab === 'albums' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: sidebarTab === 'albums' ? 800 : 600,
                padding: '12px 8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s'
              }}
            >
              <i className="fa-solid fa-images" style={{ color: sidebarTab === 'albums' ? 'var(--primary)' : 'inherit', fontSize: 13 }}></i>
              <span style={{ color: sidebarTab === 'albums' ? 'var(--primary)' : 'inherit' }}>Albums</span>
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sidebarTab === 'chats' ? (
              <ChatList
                activePartnerId={activePartnerId}
                onSelect={(id) => {
                  setActiveAlbum(null);
                  setActiveGroupId(null);
                  handleSelectPartner(id);
                }}
              />
            ) : sidebarTab === 'groups' ? (
              <GroupTab
                activeGroupId={activeGroupId}
                onSelectGroup={(gId) => {
                  setActiveGroupId(gId);
                  setActivePartnerId(null);
                  setActiveAlbum(null);
                }}
              />
            ) : (
              <AlbumTab
                onOpenAlbum={(albumData) => {
                  setActiveAlbum(albumData);
                  setActiveGroupId(null);
                }}
                activePartner={activePartner}
              />
            )}
          </div>
        </div>

        {/* Right Side: Group Chat Window OR Album Viewer OR Direct Chat Window */}
        <div className={`messages-main ${(!activePartnerId && !activeAlbum && !activeGroupId) ? 'mobile-hide' : ''}`} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-elevated)'
        }}>
          {activeGroupId ? (
            <GroupChatWindow
              groupId={activeGroupId}
              onBack={() => setActiveGroupId(null)}
            />
          ) : activeAlbum ? (
            <AlbumViewer
              albumData={activeAlbum}
              onClose={() => setActiveAlbum(null)}
              onSelectPartner={(partnerId) => {
                setActiveAlbum(null);
                handleSelectPartner(partnerId);
              }}
            />
          ) : activePartner ? (
            <ChatWindow
              partner={activePartner}
              isMobile={true}
              onBack={() => {
                setActivePartnerId(null);
                setSearchParams({});
              }}
            />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
              textAlign: 'center'
            }}>
              {sidebarTab === 'groups' ? (
                <>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Users size={36} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 8px' }}>
                    Campus Community Groups
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 360, margin: '0 0 20px' }}>
                    Select a group from the list or create your own club to start real discussions. All groups, invitations, and chat history persist permanently in browser storage.
                  </p>
                </>
              ) : sidebarTab === 'albums' ? (
                <>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(234, 179, 8, 0.12)',
                    color: '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Images size={36} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 8px' }}>
                    Browse Albums
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 340, margin: '0 0 20px' }}>
                    Select any album from the left grid to view photos in full screen carousel mode, or tap "My Albums" to manage your pictures.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveAlbum({ type: 'my_album', user: currentUser, photos: album })}
                  >
                    <Images size={15} /> Open My Albums
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <MessageSquare size={36} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 8px' }}>
                    Your Messages
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 320, margin: '0 0 20px' }}>
                    Select a conversation from the left or discover new connections to start chatting.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/discover')}
                  >
                    <Compass size={15} /> Find People
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      {premiumModalUser && (
        <PremiumModal
          isOpen={!!premiumModalUser}
          onClose={() => setPremiumModalUser(null)}
          targetUser={premiumModalUser}
        />
      )}
    </div>
  );
};

export default Messages;

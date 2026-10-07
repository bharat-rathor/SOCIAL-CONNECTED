import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Star, MessageSquare, ShieldAlert,
  Slash, MapPin, Calendar, CheckCircle2, Crown, Eye, Images,
  Phone, Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useNotification } from '../context/NotificationContext';
import { useCall } from '../context/CallContext';
import OnlineStatus from '../components/common/OnlineStatus';
import PremiumBadge from '../components/common/PremiumBadge';
import Modal from '../components/common/Modal';
import PremiumModal from '../components/subscription/PremiumModal';
import ImageLightbox from '../components/common/ImageLightbox';
import { timeAgo } from '../utils/dateUtils';

const REPORT_REASONS = [
  'Inappropriate or offensive content',
  'Spam, advertising, or commercial solicitation',
  'Harassment, bullying, or hate speech',
  'Fake profile or impersonation',
  'Other violation'
];

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    getUserById,
    toggleLike,
    isLiked,
    toggleFavorite,
    isFavorite,
    blockUser,
    isBlocked,
    reportUser,
    recordProfileView,
    getUserAlbum
  } = useUserContext();
  const { isPremium } = useSubscription();
  const { showToast, addNotification } = useNotification();
  const { startCall } = useCall();

  const [user, setUser] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);

  useEffect(() => {
    const found = getUserById(id);
    setUser(found);

    if (found && currentUser) {
      // Record profile view
      const recorded = recordProfileView(found.id);
      if (recorded) {
        addNotification('view', `Someone viewed your profile!`, currentUser.id, `/user/${currentUser.id}`);
      }
    }
  }, [id, getUserById, currentUser]);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', textAlign: 'center' }}>
        <h2>User Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          This profile might have been removed or does not exist.
        </p>
        <Link to="/discover" className="btn btn-primary">Back to Discover</Link>
      </div>
    );
  }

  const isUserBlocked = isBlocked(user.id);
  const userLiked = isLiked(user.id);
  const userFaved = isFavorite(user.id);
  const userAlbum = getUserAlbum(user.id) || [];

  const handleLike = () => {
    const nowLiked = toggleLike(user.id);
    if (nowLiked) {
      showToast('success', `Liked ${user.name}`, `You liked ${user.name}'s profile.`);
      addNotification('like', `${currentUser?.name || 'Someone'} liked your profile.`, currentUser?.id, '/likes');
    } else {
      showToast('info', 'Unliked', `You unliked ${user.name}.`);
    }
  };

  const handleFavorite = () => {
    const nowFaved = toggleFavorite(user.id);
    if (nowFaved) {
      showToast('success', 'Favorited', `${user.name} added to your favorites.`);
    } else {
      showToast('info', 'Removed', `${user.name} removed from your favorites.`);
    }
  };

  const handleMessage = () => {
    // If target is premium and current user is free -> trigger modal
    if (user.isPremium && !isPremium) {
      setShowPremiumModal(true);
    } else {
      navigate(`/chat/${user.id}`);
    }
  };

  const confirmBlock = () => {
    blockUser(user.id);
    setShowBlockModal(false);
    showToast('error', 'User Blocked', `You blocked ${user.name}. You will no longer see them in discovery.`);
    navigate('/discover');
  };

  const submitReport = () => {
    reportUser(user.id, reportReason);
    setShowReportModal(false);
    showToast('success', 'Report Submitted', 'Thank you for keeping our community safe. Our moderation team will review this report.');
  };

  return (
    <div className="container user-profile-page-container" style={{ maxWidth: 840 }}>
      {/* Top back nav */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Profile Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Banner Cover */}
        <div style={{
          height: 180,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          position: 'relative'
        }} />

        {/* Profile Header Content */}
        <div style={{ padding: '0 clamp(16px, 4vw, 36px) 24px', position: 'relative' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: -64,
            marginBottom: 20,
            gap: 16
          }}>
            {/* Profile Photo (Click to View Full) */}
            <div
              style={{ position: 'relative', width: 120, height: 120, cursor: 'pointer' }}
              onClick={() => setLightboxData({
                url: user.image,
                name: `${user.name}, ${user.age}`,
                subtitle: `${user.area}, ${user.city}`
              })}
              title="Click to view full photo"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLightboxData({
                    url: user.image,
                    name: `${user.name}, ${user.age}`,
                    subtitle: `${user.area}, ${user.city}`
                  });
                }
              }}
              aria-label="View full profile photo"
            >
              <img
                src={user.image}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--surface)',
                  background: 'var(--surface-elevated)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <span className={`online-dot ${user.online ? 'online' : 'offline'}`} style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                width: 18,
                height: 18,
                border: '3px solid var(--surface)'
              }} />
            </div>

            {/* Quick Actions Toolbar (Star is FIRST) */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className={`btn btn-md ${userFaved ? 'btn-secondary' : 'btn-outline'}`}
                onClick={handleFavorite}
                style={{
                  color: userFaved ? 'var(--gold)' : 'inherit',
                  borderColor: userFaved ? 'var(--gold)' : 'var(--border)'
                }}
              >
                <Star size={18} fill={userFaved ? 'var(--gold)' : 'none'} />
                <span>{userFaved ? 'Starred' : 'Star'}</span>
              </button>

              <button
                className={`btn btn-md ${userLiked ? 'btn-secondary' : 'btn-outline'}`}
                onClick={handleLike}
                style={{
                  color: userLiked ? 'var(--secondary)' : 'inherit',
                  borderColor: userLiked ? 'var(--secondary)' : 'var(--border)'
                }}
              >
                <Heart size={18} fill={userLiked ? 'var(--secondary)' : 'none'} />
                <span>{userLiked ? 'Liked' : 'Like'}</span>
              </button>

              <button className="btn btn-md btn-primary" onClick={handleMessage}>
                <MessageSquare size={18} />
                <span>Message</span>
              </button>

              <button
                className="btn btn-md btn-outline"
                onClick={() => startCall(user, 'voice')}
                title="Start Voice Call"
              >
                <Phone size={18} />
                <span>Call</span>
              </button>

              <button
                className="btn btn-md btn-outline"
                onClick={() => startCall(user, 'video')}
                title="Start Video Call"
              >
                <Video size={18} />
                <span>Video</span>
              </button>
            </div>
          </div>

          {/* User Name & Badges */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {user.name}, {user.age}
                {userFaved && <Star size={20} fill="#eab308" color="#eab308" title="Starred user" />}
              </h1>
              {user.isPremium && <PremiumBadge size="md" />}
              <OnlineStatus user={user} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              <MapPin size={15} style={{ color: 'var(--primary)' }} />
              <span>{user.area}, {user.city}</span>
            </div>
          </div>

          {/* About / Bio */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              About
            </h3>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {user.bio || 'No bio provided yet.'}
            </p>
          </div>

          {/* Photo Album Section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Images size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Photo Album
                </h3>
                <span className="badge badge-neutral" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {userAlbum.length} {userAlbum.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              {userAlbum.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Click photo to view full size
                </span>
              )}
            </div>

            {userAlbum.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: 12,
              }}>
                {userAlbum.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxData({
                      url: photo,
                      name: `${user.name}'s Album`,
                      subtitle: `Photo ${idx + 1} of ${userAlbum.length}`
                    })}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-elevated)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                    title="Click to view full photo"
                  >
                    <img
                      src={photo}
                      alt={`${user.name} album photo ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <Eye size={20} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                background: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)'
              }}>
                <Images size={28} style={{ opacity: 0.4, marginBottom: 6 }} />
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>No album photos shared yet</div>
                <div style={{ fontSize: '12px', marginTop: 2 }}>
                  Send a message to request photos
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
            padding: 16,
            background: 'var(--surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>GENDER</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2 }}>{user.gender || 'Not specified'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>LOOKING FOR</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2 }}>{user.preference || 'All'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>LOCATION</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2 }}>{user.city}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>JOINED</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2 }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </div>
            </div>
          </div>

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Interests & Hobbies
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.interests.map(i => (
                  <span
                    key={i}
                    className="badge badge-neutral"
                    style={{ padding: '6px 14px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-full)' }}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Moderation / Safety Options */}
          <div style={{
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12
          }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-muted)', fontSize: '12px' }}
              onClick={() => setShowReportModal(true)}
            >
              <ShieldAlert size={14} /> Report Profile
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--error)', fontSize: '12px' }}
              onClick={() => setShowBlockModal(true)}
            >
              <Slash size={14} /> Block User
            </button>
          </div>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title={`Block ${user.name}?`}
        subtitle="They will not be able to message you or see your profile"
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to block <strong>{user.name}</strong>? You can unblock them anytime from your Settings page.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>Cancel</button>
          <button className="btn btn-error" onClick={confirmBlock}>Block User</button>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Profile"
        subtitle="Help us maintain a safe community"
      >
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Please select a reason:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: reportReason === reason ? 'rgba(99,102,241,0.08)' : 'var(--surface-elevated)',
                  border: reportReason === reason ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <input
                  type="radio"
                  name="reportReason"
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitReport}>Submit Report</button>
        </div>
      </Modal>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        targetUser={user}
      />

      {/* Photo Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(lightboxData)}
        imageUrl={lightboxData?.url}
        name={lightboxData?.name}
        subtitle={lightboxData?.subtitle}
        onClose={() => setLightboxData(null)}
      />
    </div>
  );
};

export default UserProfile;

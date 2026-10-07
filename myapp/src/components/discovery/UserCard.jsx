import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MessageSquare, MapPin, Eye } from 'lucide-react';
import PremiumBadge from '../common/PremiumBadge';
import OnlineStatus from '../common/OnlineStatus';
import ImageLightbox from '../common/ImageLightbox';
import { DEFAULT_USER_PHOTO } from '../../data/users';
import { useUserContext } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const UserCard = ({ user, onMessageClick }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleLike, isLiked, toggleFavorite, isFavorite } = useUserContext();
  const { showToast, addNotification } = useNotification();

  const [showLightbox, setShowLightbox] = useState(false);
  const liked = isLiked(user.id);
  const faved = isFavorite(user.id);

  const handleLike = (e) => {
    e.stopPropagation();
    const nowLiked = toggleLike(user.id);
    if (nowLiked) {
      showToast('success', `Liked ${user.name}`, `You liked ${user.name}'s profile.`);
      addNotification('like', `You liked ${user.name}'s profile.`, user.id, '/likes');
    } else {
      showToast('info', 'Unliked', `You removed your like from ${user.name}.`);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    const nowFaved = toggleFavorite(user.id);
    if (nowFaved) {
      showToast('success', 'Added to Favorites', `${user.name} added to your favorites.`);
    } else {
      showToast('info', 'Removed', `${user.name} removed from favorites.`);
    }
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    if (onMessageClick) onMessageClick(user);
  };

  const handleViewPhoto = (e) => {
    e.stopPropagation();
    setShowLightbox(true);
  };

  const handleCardClick = () => navigate(`/user/${user.id}`);

  return (
    <>
      <article className="user-card" onClick={handleCardClick} aria-label={`View ${user.name}'s profile`}>
        <div className="user-card-image-wrap">
          <img
            src={user.image}
            alt={`${user.name}'s profile photo`}
            loading="lazy"
            onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
          />
          <div className="user-card-badges">
            {faved && (
              <span className="badge" style={{
                background: 'rgba(234, 179, 8, 0.95)',
                color: '#1a1a1a',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}>
                <Star size={11} fill="#1a1a1a" /> Star
              </span>
            )}
            {user.isPremium && <PremiumBadge />}
            {user.online && (
              <span className="badge badge-online">
                <span className="online-dot online" style={{ width: 6, height: 6 }} />
                Online
              </span>
            )}
          </div>
          <div className="user-card-actions-overlay">
            {/* Star is FIRST */}
            <button
              className={`user-card-action ${faved ? 'favorited' : ''}`}
              onClick={handleFavorite}
              aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={faved}
              title={faved ? 'Favorited' : 'Star / Favorite'}
            >
              <Star size={15} fill={faved ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`user-card-action ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
              aria-pressed={liked}
              title="Like"
            >
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              className="user-card-action"
              onClick={handleViewPhoto}
              aria-label={`View full photo of ${user.name}`}
              title="View full photo"
            >
              <Eye size={15} />
            </button>
            {currentUser && (
              <button
                className="user-card-action"
                onClick={handleMessage}
                aria-label={`Message ${user.name}`}
                title="Message"
              >
                <MessageSquare size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="user-card-body">
          <div className="user-card-name-row">
            <span className="user-card-name" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {user.name}, {user.age}
              {faved && <Star size={13} fill="#eab308" color="#eab308" title="Starred user" />}
            </span>
            <OnlineStatus user={user} showLabel={false} />
          </div>
          <div className="user-card-meta">
            <MapPin size={11} />
            {user.area}, {user.city}
          </div>
          {user.bio && <p className="user-card-bio">{user.bio}</p>}
        </div>
      </article>

      {/* Full-Screen Photo Lightbox */}
      <ImageLightbox
        isOpen={showLightbox}
        imageUrl={user.image}
        name={`${user.name}, ${user.age}`}
        subtitle={`${user.area}, ${user.city}`}
        onClose={() => setShowLightbox(false)}
      />
    </>
  );
};

export default UserCard;

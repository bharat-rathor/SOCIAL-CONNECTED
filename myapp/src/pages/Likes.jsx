import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Compass, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useSubscription } from '../context/SubscriptionContext';
import UserGrid from '../components/discovery/UserGrid';
import EmptyState from '../components/common/EmptyState';
import PremiumModal from '../components/subscription/PremiumModal';

const Likes = () => {
  const [activeTab, setActiveTab] = useState('liked_me'); // 'liked_me' | 'my_likes'
  const { currentUser } = useAuth();
  const { likedUsers, getWhoLikedMe, getUserById, blockedUsers } = useUserContext();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [premiumModalUser, setPremiumModalUser] = useState(null);

  // People who liked the logged-in user
  const whoLikedMe = useMemo(() => {
    return getWhoLikedMe().filter(u => !blockedUsers.includes(u.id));
  }, [getWhoLikedMe, blockedUsers]);

  // People the logged-in user has liked
  const myLikes = useMemo(() => {
    return likedUsers
      .filter(id => !blockedUsers.includes(id))
      .map(id => getUserById(id))
      .filter(Boolean);
  }, [likedUsers, getUserById, blockedUsers]);

  const handleMessage = (targetUser) => {
    if (targetUser.isPremium && !isPremium) {
      setPremiumModalUser(targetUser);
    } else {
      navigate(`/chat/${targetUser.id}`);
    }
  };

  return (
    <div className="container likes-page-container">
      {/* Page Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Heart size={26} style={{ color: 'var(--secondary)' }} fill="var(--secondary)" />
          Likes & Matches
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          See who is interested in your profile and review people you've liked
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button
          className={`btn btn-ghost ${activeTab === 'liked_me' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('liked_me')}
          style={{
            borderRadius: 0,
            borderBottom: activeTab === 'liked_me' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'liked_me' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'liked_me' ? 700 : 500,
            padding: '10px 16px',
            fontSize: 'var(--text-sm)'
          }}
        >
          <UserCheck size={16} />
          <span>Liked Me ({whoLikedMe.length})</span>
        </button>

        <button
          className={`btn btn-ghost ${activeTab === 'my_likes' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('my_likes')}
          style={{
            borderRadius: 0,
            borderBottom: activeTab === 'my_likes' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'my_likes' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'my_likes' ? 700 : 500,
            padding: '10px 16px',
            fontSize: 'var(--text-sm)'
          }}
        >
          <Heart size={16} />
          <span>My Likes ({myLikes.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'liked_me' ? (
        <UserGrid
          users={whoLikedMe}
          onMessageClick={handleMessage}
          emptyTitle="No Likes Yet"
          emptyDescription="When other members like your profile, they will appear here. Keep your profile updated to get noticed!"
        />
      ) : (
        <UserGrid
          users={myLikes}
          onMessageClick={handleMessage}
          emptyTitle="No Likes Given"
          emptyDescription="You haven't liked anyone yet. Explore profiles in Discover and tap the heart icon on members you like!"
        />
      )}

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

export default Likes;

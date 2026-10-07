import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useSubscription } from '../context/SubscriptionContext';
import UserGrid from '../components/discovery/UserGrid';
import PremiumModal from '../components/subscription/PremiumModal';

const Favorites = () => {
  const { currentUser } = useAuth();
  const { favorites, getUserById, blockedUsers } = useUserContext();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [premiumModalUser, setPremiumModalUser] = useState(null);

  const favoriteUsers = useMemo(() => {
    return favorites
      .filter(id => !blockedUsers.includes(id))
      .map(id => getUserById(id))
      .filter(Boolean);
  }, [favorites, getUserById, blockedUsers]);

  const handleMessage = (targetUser) => {
    if (targetUser.isPremium && !isPremium) {
      setPremiumModalUser(targetUser);
    } else {
      navigate(`/chat/${targetUser.id}`);
    }
  };

  return (
    <div className="container favorites-page-container">
      {/* Page Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Star size={26} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
          Favorite Profiles ({favoriteUsers.length})
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Quickly access your bookmarked and starred connections
        </p>
      </div>

      <UserGrid
        users={favoriteUsers}
        onMessageClick={handleMessage}
        emptyTitle="No Favorites Bookmarked"
        emptyDescription="You haven't added any profiles to your favorites yet. Tap the star icon on any card to save them here for later!"
      />

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

export default Favorites;

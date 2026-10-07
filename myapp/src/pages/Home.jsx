import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Heart, Star, MessageSquare, Compass, Crown, Zap, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { useSubscription } from '../context/SubscriptionContext';
import UserCard from '../components/discovery/UserCard';
import PremiumModal from '../components/subscription/PremiumModal';

const Home = () => {
  const { currentUser } = useAuth();
  const { users, likedUsers, favorites, blockedUsers } = useUserContext();
  const { totalUnread } = useChat();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [premiumModalUser, setPremiumModalUser] = useState(null);

  // Filter out current user and blocked users
  const visibleUsers = useMemo(() => {
    return users.filter(u => u.id !== currentUser?.id && !blockedUsers.includes(u.id));
  }, [users, currentUser, blockedUsers]);

  // Online users
  const onlineUsers = useMemo(() => {
    return visibleUsers.filter(u => u.online);
  }, [visibleUsers]);

  // Recommended matches: starred first, then matching preference
  const recommendedUsers = useMemo(() => {
    return visibleUsers
      .filter(u => {
        // If user has preference set
        if (currentUser?.preference && currentUser.preference !== 'All') {
          if (u.gender !== currentUser.preference) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      })
      .slice(0, 8);
  }, [visibleUsers, currentUser, favorites]);

  const handleMessageUser = (targetUser) => {
    // If target is premium and current user is free -> trigger premium modal
    if (targetUser.isPremium && !isPremium) {
      setPremiumModalUser(targetUser);
    } else {
      navigate(`/chat/${targetUser.id}`);
    }
  };

  return (
    <div className="container home-page-container">
      {/* Welcome Banner */}
      <div className="home-welcome-banner" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(236,72,153,0.08))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(18px, 3vw, 32px)',
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
              Hello, {currentUser?.name || 'Friend'}!
            </span>
            {isPremium && (
              <span className="badge badge-premium">
                <Crown size={11} /> Premium Member
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 520, margin: 0 }}>
            Discover interesting people nearby in {currentUser?.city || 'Gujarat'} and start conversations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/discover" className="btn btn-primary">
            <Compass size={17} />
            <span>Discover People</span>
          </Link>
          {!isPremium && (
            <Link to="/subscription" className="btn btn-gold">
              <Crown size={16} />
              <span>Go Premium</span>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="home-quick-stats">
        <Link to="/likes" className="card" style={{ padding: '16px 20px', textDecoration: 'none', transition: 'transform var(--transition-fast)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Liked</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={15} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {likedUsers.length}
          </div>
        </Link>

        <Link to="/favorites" className="card" style={{ padding: '16px 20px', textDecoration: 'none', transition: 'transform var(--transition-fast)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Favorites</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={15} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {favorites.length}
          </div>
        </Link>

        <Link to="/messages" className="card" style={{ padding: '16px 20px', textDecoration: 'none', transition: 'transform var(--transition-fast)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Unread Chats</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={15} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {totalUnread()}
          </div>
        </Link>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Online Now</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {onlineUsers.length}
          </div>
        </div>
      </div>

      {/* Online Users Active Reel */}
      {onlineUsers.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="online-dot online" style={{ width: 8, height: 8 }} />
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>Active Members Online</h2>
            </div>
            <Link to="/discover" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              View all
            </Link>
          </div>

          <div style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'thin'
          }}>
            {onlineUsers.map(user => (
              <div
                key={user.id}
                onClick={() => navigate(`/user/${user.id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  minWidth: 76,
                  textAlign: 'center'
                }}
              >
                <div style={{ position: 'relative', width: 62, height: 62, marginBottom: 6 }}>
                  <img
                    src={user.image}
                    alt={user.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: user.isPremium ? '2px solid var(--gold)' : '2px solid var(--primary)',
                      background: 'var(--surface-elevated)'
                    }}
                  />
                  <span className="online-dot online" style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    border: '2px solid var(--surface)'
                  }} />
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 74, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user.city}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Section */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>Recommended For You</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Profiles tailored to your preferences and location
            </p>
          </div>
          <Link to="/discover" className="btn btn-sm btn-secondary" style={{ gap: 4 }}>
            <span>Explore All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="user-grid">
          {recommendedUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onMessageClick={handleMessageUser}
            />
          ))}
        </div>
      </section>

      {/* Premium Teaser Banner if Free */}
      {!isPremium && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(99,102,241,0.08))',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--gold)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Crown size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                Unlock Premium Membership
              </h3>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Chat with all members including verified VIPs, get priority badge, and stand out in search.
              </p>
            </div>
          </div>
          <Link to="/subscription" className="btn btn-gold" style={{ flexShrink: 0 }}>
            <Crown size={15} />
            <span>Upgrade Starting ₹250</span>
          </Link>
        </div>
      )}

      {/* Premium Modal Trigger */}
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

export default Home;

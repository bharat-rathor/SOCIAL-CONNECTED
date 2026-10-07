import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Compass, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useSubscription } from '../context/SubscriptionContext';
import SearchBar from '../components/discovery/SearchBar';
import FilterPanel from '../components/discovery/FilterPanel';
import SortDropdown from '../components/discovery/SortDropdown';
import UserGrid from '../components/discovery/UserGrid';
import PremiumModal from '../components/subscription/PremiumModal';
import { applyFilters, sortUsers } from '../utils/filters';

const INITIAL_FILTERS = {
  search: '',
  minAge: 18,
  maxAge: 60,
  area: '',
  city: '',
  onlineOnly: false,
  accountType: 'all',
  interests: [],
};

const Discover = () => {
  const { currentUser } = useAuth();
  const { users, blockedUsers, isFavorite } = useUserContext();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilterMobile, setShowFilterMobile] = useState(false);
  const [premiumModalUser, setPremiumModalUser] = useState(null);

  // Filter out current user from pool
  const candidateUsers = useMemo(() => {
    return users.filter(u => u.id !== currentUser?.id);
  }, [users, currentUser]);

  // Filter and sort (Starred users show FIRST)
  const filteredUsers = useMemo(() => {
    const list = applyFilters(candidateUsers, filters, blockedUsers);
    const sorted = sortUsers(list, sortBy);
    return [...sorted].sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [candidateUsers, filters, blockedUsers, sortBy, isFavorite]);

  const handleMessageClick = (targetUser) => {
    if (targetUser.isPremium && !isPremium) {
      setPremiumModalUser(targetUser);
    } else {
      navigate(`/chat/${targetUser.id}`);
    }
  };

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.minAge !== 18 || filters.maxAge !== 60) count++;
    if (filters.city) count++;
    if (filters.area) count++;
    if (filters.onlineOnly) count++;
    if (filters.accountType !== 'all') count++;
    if (filters.interests.length > 0) count += filters.interests.length;
    return count;
  }, [filters]);

  return (
    <div className="container discover-page-container">
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={28} style={{ color: 'var(--primary)' }} />
            Discover People
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Find members by city, interests, lifestyle, and online activity
          </p>
        </div>

        {/* Filter Toggle on Mobile */}
        <button
          className="btn btn-secondary"
          onClick={() => setShowFilterMobile(!showFilterMobile)}
          style={{ display: 'none' }}
          id="mobile-filter-btn"
        >
          <SlidersHorizontal size={16} />
          <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
        </button>
      </div>

      {/* Top Search & Sort Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px' }}>
          <SearchBar
            value={filters.search}
            onChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Main Discover Layout: Filter Sidebar + User Grid */}
      <div className="discover-layout" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Filter Sidebar */}
        <aside
          className={`discover-sidebar ${showFilterMobile ? 'mobile-open' : ''}`}
          style={{ width: 280, flexShrink: 0 }}
        >
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            onClose={() => setShowFilterMobile(false)}
          />
        </aside>

        {/* Main User Grid Feed */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'}
            </span>
            {activeFilterCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}
              >
                Reset all filters
              </button>
            )}
          </div>

          <UserGrid
            users={filteredUsers}
            onMessageClick={handleMessageClick}
            emptyTitle="No matches found"
            emptyDescription="Try adjusting your age range, search keyword, or clearing some filters."
          />
        </main>
      </div>

      {/* Premium Upgrade Modal if user clicked message on premium member */}
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

export default Discover;

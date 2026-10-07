// ============================================================
// Pure filter and sort predicates for Discover page
// ============================================================

/**
 * Apply all active filters to a list of users
 * @param {Array} users
 * @param {Object} filters
 * @param {Array} blockedIds
 * @returns {Array}
 */
export const applyFilters = (users, filters, blockedIds = []) => {
  const {
    search = '',
    minAge = 18,
    maxAge = 60,
    area = '',
    city = '',
    onlineOnly = false,
    accountType = 'all',  // 'all' | 'free' | 'premium'
    interests = [],
  } = filters;

  const q = search.toLowerCase().trim();

  return users.filter(user => {
    // Exclude blocked users
    if (blockedIds.includes(user.id)) return false;

    // Search filter
    if (q) {
      const matchName = user.name.toLowerCase().includes(q);
      const matchCity = user.city.toLowerCase().includes(q);
      const matchArea = user.area.toLowerCase().includes(q);
      const matchInterest = user.interests.some(i => i.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchArea && !matchInterest) return false;
    }

    // Age filter
    if (user.age < minAge || user.age > maxAge) return false;

    // Area filter
    if (area && user.area !== area) return false;

    // City filter
    if (city && user.city !== city) return false;

    // Online filter
    if (onlineOnly && !user.online) return false;

    // Account type filter
    if (accountType === 'premium' && !user.isPremium) return false;
    if (accountType === 'free' && user.isPremium) return false;

    // Interest filter — user must have ALL selected interests
    if (interests.length > 0) {
      const hasAll = interests.every(i => user.interests.includes(i));
      if (!hasAll) return false;
    }

    return true;
  });
};

/**
 * Sort a filtered user list
 * @param {Array} users
 * @param {string} sortBy
 * @returns {Array}
 */
export const sortUsers = (users, sortBy = 'recommended') => {
  const list = [...users];

  switch (sortBy) {
    case 'recently_active':
      return list.sort((a, b) => {
        if (a.online && !b.online) return -1;
        if (!a.online && b.online) return 1;
        const aTime = a.lastSeen ? new Date(a.lastSeen) : new Date();
        const bTime = b.lastSeen ? new Date(b.lastSeen) : new Date();
        return bTime - aTime;
      });

    case 'age_asc':
      return list.sort((a, b) => a.age - b.age);

    case 'age_desc':
      return list.sort((a, b) => b.age - a.age);

    case 'name_az':
      return list.sort((a, b) => a.name.localeCompare(b.name));

    case 'recommended':
    default:
      return list.sort((a, b) => {
        // Premium users first, then online, then by name
        if (a.online && !b.online) return -1;
        if (!a.online && b.online) return 1;
        return 0;
      });
  }
};

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'recently_active', label: 'Recently Active' },
  { value: 'age_asc', label: 'Age: Low to High' },
  { value: 'age_desc', label: 'Age: High to Low' },
  { value: 'name_az', label: 'Name: A–Z' },
];

// ============================================================
// Centralized LocalStorage Utility
// Provides permanent browser-side persistence across refreshes,
// tab closes, and browser restarts.
// ============================================================

export const getData = (key, defaultValue = null) => {
  try {
    // Check direct key, fallback to legacy prefixed key if present
    const data = localStorage.getItem(key) ?? localStorage.getItem(`sc_${key}`);
    return data !== null && data !== undefined ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage:`, err);
    return defaultValue;
  }
};

export const setData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key "${key}" to localStorage:`, err);
  }
};

export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`sc_${key}`);
  } catch (err) {
    console.error(`Error removing key "${key}" from localStorage:`, err);
  }
};

export const clearAll = () => {
  try {
    localStorage.clear();
  } catch (err) {
    console.error('Error clearing localStorage:', err);
  }
};

// Initialize guaranteed persistence keys for college evaluation
export const initStorageDefaults = () => {
  try {
    const REQUIRED_KEYS = [
      'users',
      'currentUser',
      'messages',
      'groups',
      'groupMessages',
      'groupInvitations',
      'groupJoinRequests',
      'likes',
      'favorites',
      'notifications',
      'blockedUsers',
      'reports',
      'subscriptions',
      'profileViews',
      'settings'
    ];

    REQUIRED_KEYS.forEach(key => {
      if (localStorage.getItem(key) === null && localStorage.getItem(`sc_${key}`) === null) {
        if (key === 'likes' || key === 'favorites' || key === 'notifications' ||
            key === 'blockedUsers' || key === 'reports' || key === 'profileViews' ||
            key === 'groupJoinRequests') {
          setData(key, []);
        } else if (key === 'settings') {
          setData(key, {
            showOnline: true,
            showLastSeen: true,
            discoverable: true,
            soundNotifications: true,
            messagePreviews: true
          });
        }
      }
    });
  } catch (e) {
    console.warn('initStorageDefaults warning:', e);
  }
};

// Run auto-init on load
initStorageDefaults();

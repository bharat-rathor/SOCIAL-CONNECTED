// ============================================================
// Subscription / expiry helpers
// ============================================================

/**
 * Calculate expiry date from plan ID
 */
export const getExpiryDate = (planId) => {
  const durations = { weekly: 7, monthly: 30, yearly: 365 };
  const days = durations[planId] || 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/**
 * Check if subscription is still active
 */
export const isSubscriptionActive = (subscription) => {
  if (!subscription || subscription.status !== 'active') return false;
  return new Date() < new Date(subscription.expiryDate);
};

/**
 * Get days remaining
 */
export const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return 0;
  const diff = new Date(expiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

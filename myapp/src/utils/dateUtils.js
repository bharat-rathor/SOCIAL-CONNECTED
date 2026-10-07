// ============================================================
// Date / Time formatting helpers
// ============================================================

/**
 * Format a timestamp as a friendly relative string
 * e.g. "just now", "5 minutes ago", "2 hours ago", "Oct 3"
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

/**
 * Format a message timestamp for chat bubbles
 * e.g. "6:30 PM"
 */
export const formatChatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date for chat list header separators
 * e.g. "Today", "Yesterday", "Oct 3"
 */
export const formatChatDate = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return then.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

/**
 * Format a full date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

/**
 * Generate unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
};

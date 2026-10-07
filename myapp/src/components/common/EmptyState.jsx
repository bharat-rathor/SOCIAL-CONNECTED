import React from 'react';

const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state">
    {icon && (
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
    )}
    <div className="empty-state-title">{title}</div>
    {description && <div className="empty-state-text">{description}</div>}
    {action && <div className="mt-md">{action}</div>}
  </div>
);

export default EmptyState;

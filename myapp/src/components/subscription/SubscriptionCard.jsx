import React from 'react';
import { Check, Crown } from 'lucide-react';

const SubscriptionCard = ({ plan, selected, onSelect }) => (
  <div
    className={`subscription-card ${plan.recommended ? 'recommended' : ''} ${selected ? 'selected' : ''}`}
    onClick={() => onSelect(plan.id)}
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onSelect(plan.id)}
    aria-pressed={selected}
    aria-label={`Select ${plan.name} plan`}
  >
    {plan.badge && <div className="subscription-card-badge">{plan.badge}</div>}
    <div>
      <div className="subscription-card-name">{plan.name}</div>
      <div className="subscription-card-duration">{plan.durationLabel}</div>
    </div>
    <div className="subscription-card-price">
      {plan.currency}{plan.price.toLocaleString()}
      <span> / {plan.name.toLowerCase()}</span>
    </div>
    <ul className="subscription-features">
      {plan.features.map(f => (
        <li key={f} className="subscription-feature">
          <Check size={14} /> {f}
        </li>
      ))}
    </ul>
    <button className={`btn btn-full ${selected ? 'btn-primary' : 'btn-secondary'}`}>
      {selected ? 'Selected' : 'Choose Plan'}
    </button>
  </div>
);

export default SubscriptionCard;

import React from 'react';
import { Crown } from 'lucide-react';

const PremiumBadge = ({ size = 'sm', text = 'VIP' }) => (
  <span className="badge badge-premium" title="Premium VIP Member">
    <i className="fa-solid fa-crown" style={{ fontSize: size === 'sm' ? 10 : 12 }}></i>
    <span>{text}</span>
  </span>
);

export default PremiumBadge;

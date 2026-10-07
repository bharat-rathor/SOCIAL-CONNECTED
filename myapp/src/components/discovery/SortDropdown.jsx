import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SORT_OPTIONS } from '../../utils/filters';

const SortDropdown = ({ value, onChange }) => (
  <div style={{ position: 'relative' }}>
    <select
      className="form-input form-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ paddingRight: 36, cursor: 'pointer', minWidth: 180 }}
      aria-label="Sort users"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default SortDropdown;

import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search by name, city, area, or interest...' }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <Search
      size={16}
      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
    />
    <input
      type="search"
      className="form-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ paddingLeft: 38, paddingRight: value ? 36 : 14 }}
      aria-label={placeholder}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

export default SearchBar;

import React from 'react';
import { X } from 'lucide-react';
import { ALL_INTERESTS, CITIES, AHMEDABAD_AREAS } from '../../data/users';

const FilterPanel = ({ filters, onChange, onClear, onClose }) => {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const toggleInterest = (interest) => {
    const arr = filters.interests || [];
    const updated = arr.includes(interest)
      ? arr.filter(i => i !== interest)
      : [...arr, interest];
    set('interests', updated);
  };

  const hasFilters = filters.search || filters.minAge !== 18 || filters.maxAge !== 60
    || filters.area || filters.city || filters.onlineOnly
    || filters.accountType !== 'all' || (filters.interests || []).length > 0;

  return (
    <div className="filter-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Filters</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={onClear} style={{ gap: 4 }}>
              <X size={12} /> Clear
            </button>
          )}
          {onClose && (
            <button className="btn btn-ghost btn-sm mobile-only" onClick={onClose} aria-label="Close filters" title="Close">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Age Range */}
      <div className="filter-group">
        <div className="filter-group-label">Age Range</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <input
            type="number" min={18} max={filters.maxAge}
            value={filters.minAge}
            onChange={e => set('minAge', Number(e.target.value))}
            className="form-input"
            style={{ width: 64, padding: '6px 8px', textAlign: 'center' }}
            aria-label="Minimum age"
          />
          <span>–</span>
          <input
            type="number" min={filters.minAge} max={80}
            value={filters.maxAge}
            onChange={e => set('maxAge', Number(e.target.value))}
            className="form-input"
            style={{ width: 64, padding: '6px 8px', textAlign: 'center' }}
            aria-label="Maximum age"
          />
        </div>
      </div>

      {/* City */}
      <div className="filter-group">
        <div className="filter-group-label">City</div>
        <select
          className="form-input form-select"
          value={filters.city}
          onChange={e => set('city', e.target.value)}
          aria-label="Filter by city"
        >
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Area */}
      <div className="filter-group">
        <div className="filter-group-label">Area</div>
        <select
          className="form-input form-select"
          value={filters.area}
          onChange={e => set('area', e.target.value)}
          aria-label="Filter by area"
        >
          <option value="">All Areas</option>
          {AHMEDABAD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Online Only */}
      <div className="filter-group">
        <div className="filter-group-label">Status</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={filters.onlineOnly}
            onChange={e => set('onlineOnly', e.target.checked)}
            style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
          />
          Online only
        </label>
      </div>

      {/* Account Type */}
      <div className="filter-group">
        <div className="filter-group-label">Account Type</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'free', 'premium'].map(type => (
            <button
              key={type}
              className={`interest-tag-selector ${filters.accountType === type ? 'selected' : ''}`}
              onClick={() => set('accountType', type)}
              aria-pressed={filters.accountType === type}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="filter-group">
        <div className="filter-group-label">Interests</div>
        <div className="filter-chips">
          {ALL_INTERESTS.map(interest => (
            <button
              key={interest}
              className={`interest-tag-selector ${(filters.interests || []).includes(interest) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest)}
              aria-pressed={(filters.interests || []).includes(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

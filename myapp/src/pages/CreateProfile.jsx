import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sparkles, MapPin, Heart, Check, ArrowRight, Camera, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ALL_INTERESTS, CITIES, AHMEDABAD_AREAS, GENDERS, PREFERENCES, DEFAULT_USER_PHOTO } from '../data/users';
import { compressImage } from '../utils/imageUtils';

const CreateProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [age, setAge] = useState(currentUser?.age || 23);
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [preference, setPreference] = useState(currentUser?.preference || 'All');
  const [city, setCity] = useState(currentUser?.city || 'Ahmedabad');
  const [area, setArea] = useState(currentUser?.area || 'Satellite');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [interests, setInterests] = useState(currentUser?.interests || ['Music', 'Travel']);
  
  // Real photo upload
  const [profileImage, setProfileImage] = useState(currentUser?.image || DEFAULT_USER_PHOTO);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(
    currentUser?.image ? !currentUser.image.includes('default') : false
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (tag) => {
    if (interests.includes(tag)) {
      if (interests.length <= 1) {
        showToast('warning', 'Notice', 'Please select at least 1 interest.');
        return;
      }
      setInterests(interests.filter(i => i !== tag));
    } else {
      if (interests.length >= 6) {
        showToast('warning', 'Limit Reached', 'You can select up to 6 interests.');
        return;
      }
      setInterests([...interests, tag]);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setProfileImage(compressedDataUrl);
      setHasUploadedPhoto(true);
      showToast('success', 'Photo Loaded!', 'Your profile picture is ready.');
    } catch (err) {
      showToast('error', 'Upload Error', err.message || 'Could not process image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!age || age < 18 || age > 99) {
      setError('Please provide a valid age between 18 and 99.');
      return;
    }
    if (!bio.trim()) {
      setError('Please write a short bio to introduce yourself.');
      return;
    }
    if (interests.length === 0) {
      setError('Please pick at least one interest.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        age: Number(age),
        gender,
        preference,
        city,
        area,
        bio: bio.trim(),
        interests,
        image: profileImage,
        isProfileComplete: true
      });
      showToast('success', 'Profile Created!', 'Your profile is ready. Start exploring now!');
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 24px)', paddingBottom: 60, maxWidth: 680 }}>
      <div className="card" style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Camera size={26} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 6 }}>
            Set Up Your Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Upload your photo and tell the community about yourself.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Photo Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 12 }}>
              <img
                src={profileImage}
                alt="Profile Photo"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--primary)',
                  boxShadow: 'var(--shadow-md)',
                  background: 'var(--surface-elevated)'
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: '2px solid var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="Upload Profile Picture"
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ gap: 6 }}
            >
              <Upload size={14} />
              <span>{isUploading ? 'Compressing...' : (hasUploadedPhoto ? 'Change Photo' : 'Upload Profile Photo')}</span>
            </button>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
              {hasUploadedPhoto ? 'Photo selected and optimized' : 'JPG, PNG, or WebP photo'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Age */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-age">Age (18-99)</label>
              <input
                id="prof-age"
                type="number"
                min="18"
                max="99"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-gender">Gender</label>
              <select
                id="prof-gender"
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Preference */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-pref">Looking For</label>
              <select
                id="prof-pref"
                className="form-input"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
              >
                {PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-city">City</label>
              <select
                id="prof-city"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Area */}
          <div className="form-group">
            <label className="form-label" htmlFor="prof-area">Area / Locality</label>
            {city === 'Ahmedabad' ? (
              <select
                id="prof-area"
                className="form-input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                {AHMEDABAD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            ) : (
              <input
                id="prof-area"
                type="text"
                className="form-input"
                placeholder="e.g. City Center, Civil Lines"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            )}
          </div>

          {/* Bio */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="prof-bio">Short Bio</label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {bio.length}/200
              </span>
            </div>
            <textarea
              id="prof-bio"
              className="form-input"
              rows={3}
              maxLength={200}
              placeholder="Tell others what you love, what you do, and what you are looking for..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </div>

          {/* Interests Chips */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Interests & Hobbies (pick at least 1)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {ALL_INTERESTS.map((tag) => {
                const selected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`badge ${selected ? 'badge-primary' : 'badge-neutral'}`}
                    style={{
                      cursor: 'pointer',
                      padding: '6px 14px',
                      fontSize: '13px',
                      borderRadius: 'var(--radius-full)',
                      border: selected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: selected ? 'var(--primary)' : 'var(--surface-elevated)',
                      color: selected ? '#fff' : 'var(--text-secondary)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {selected && <Check size={12} style={{ marginRight: 4, display: 'inline' }} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            <span>Complete Profile & Start</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;

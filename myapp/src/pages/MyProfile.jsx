import React, { useState, useRef } from 'react';
import { User, MapPin, Check, Save, Camera, Upload, Images, Trash2, Plus, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useSubscription } from '../context/SubscriptionContext';
import { ALL_INTERESTS, CITIES, AHMEDABAD_AREAS, GENDERS, PREFERENCES, DEFAULT_USER_PHOTO } from '../data/users';
import PremiumBadge from '../components/common/PremiumBadge';
import ImageLightbox from '../components/common/ImageLightbox';
import { compressImage } from '../utils/imageUtils';

const MyProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const { album = [], addPhotoToAlbum, removePhotoFromAlbum } = useUserContext();
  const { isPremium } = useSubscription();
  const { showToast } = useNotification();
  const fileInputRef = useRef(null);
  const albumFileInputRef = useRef(null);

  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState(currentUser?.age || 24);
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [preference, setPreference] = useState(currentUser?.preference || 'All');
  const [city, setCity] = useState(currentUser?.city || 'Ahmedabad');
  const [area, setArea] = useState(currentUser?.area || 'Satellite');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [interests, setInterests] = useState(currentUser?.interests || []);
  
  // Real profile picture state
  const [profileImage, setProfileImage] = useState(currentUser?.image || DEFAULT_USER_PHOTO);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);

  const toggleInterest = (tag) => {
    if (interests.includes(tag)) {
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
      // Compress and resize image to fit comfortably in localStorage
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setProfileImage(compressedDataUrl);
      showToast('success', 'Photo Selected!', 'Click "Save Changes" to update your profile photo.');
    } catch (err) {
      showToast('error', 'Upload Failed', err.message || 'Failed to process image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Error', 'Please provide a name.');
      return;
    }

    await updateProfile({
      name: name.trim(),
      age: Number(age),
      gender,
      preference,
      city,
      area,
      bio: bio.trim(),
      interests,
      image: profileImage
    });

    setSaved(true);
    showToast('success', 'Profile Saved!', 'Your profile picture and details have been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddAlbumPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingAlbum(true);
    try {
      const compressedDataUrl = await compressImage(file, 500, 500, 0.85);
      addPhotoToAlbum(compressedDataUrl);
      showToast('success', 'Photo Added!', 'Your photo was added to your personal album.');
    } catch (err) {
      showToast('error', 'Upload Failed', err.message || 'Failed to add photo to album.');
    } finally {
      setIsUploadingAlbum(false);
      if (albumFileInputRef.current) albumFileInputRef.current.value = '';
    }
  };

  const handleDeleteAlbumPhoto = (idx, e) => {
    e.stopPropagation();
    removePhotoFromAlbum(idx);
    showToast('info', 'Photo Removed', 'The photo was removed from your album.');
  };

  return (
    <div className="container profile-page-container" style={{ maxWidth: 960 }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={26} style={{ color: 'var(--primary)' }} />
          Edit My Profile
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Upload your photo, update your bio, interests, and see real-time preview
        </p>
      </div>

      <div className="profile-layout-grid">
        {/* Form Card */}
        <div className="card" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
          <form onSubmit={handleSave}>
            {/* Profile Picture Upload Section */}
            <div style={{
              marginBottom: 28,
              padding: '24px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 14px' }}>
                <img
                  src={profileImage}
                  alt="My Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                    boxShadow: 'var(--shadow-md)',
                    background: 'var(--surface)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
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

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload size={14} />
                  <span>{isUploading ? 'Compressing...' : 'Upload Profile Photo'}</span>
                </button>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Upload JPEG, PNG or WebP. Auto-optimized for crisp viewing across all pages.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-name">Full Name</label>
              <input
                id="edit-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-age">Age</label>
                <input
                  id="edit-age"
                  type="number"
                  min="18"
                  max="99"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-gender">Gender</label>
                <select
                  id="edit-gender"
                  className="form-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-pref">Looking For</label>
                <select
                  id="edit-pref"
                  className="form-input"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                >
                  {PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-city">City</label>
                <select
                  id="edit-city"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-area">Area / Locality</label>
              {city === 'Ahmedabad' ? (
                <select
                  id="edit-area"
                  className="form-input"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  {AHMEDABAD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input
                  id="edit-area"
                  type="text"
                  className="form-input"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="edit-bio">Bio</label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bio.length}/200</span>
              </div>
              <textarea
                id="edit-bio"
                className="form-input"
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interests</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {ALL_INTERESTS.map((tag) => {
                  const sel = interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`badge ${sel ? 'badge-primary' : 'badge-neutral'}`}
                      style={{
                        cursor: 'pointer',
                        padding: '5px 12px',
                        fontSize: '12px',
                        borderRadius: 'var(--radius-full)',
                        border: sel ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: sel ? 'var(--primary)' : 'var(--surface-elevated)',
                        color: sel ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      {sel && <Check size={11} style={{ marginRight: 3, display: 'inline' }} />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }}>
              <Save size={18} />
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* Live Public Profile Preview Card */}
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Preview (How others see you)
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 120, background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} />
            <div style={{ padding: '0 20px 24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -50, marginBottom: 14 }}>
                <img
                  src={profileImage}
                  alt={name}
                  onClick={() => setLightboxData({
                    url: profileImage,
                    name: `${name || 'Your Profile'}, ${age}`,
                    subtitle: `${area}, ${city}`
                  })}
                  title="Click to view full photo"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    border: '3px solid var(--surface)',
                    background: 'var(--surface-elevated)',
                    objectFit: 'cover',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                {isPremium && <PremiumBadge />}
              </div>

              <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: 2 }}>
                {name || 'Your Name'}, {age}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 12 }}>
                <MapPin size={13} style={{ color: 'var(--primary)' }} />
                <span>{area}, {city}</span>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                {bio || 'Write a bio to share your story...'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {interests.map(i => (
                  <span key={i} className="badge badge-neutral" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Photo Album Manager Section */}
      <div className="card" style={{ marginTop: 28, padding: 'clamp(20px, 3vw, 32px)' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Images size={24} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
                My Photo Album
              </h2>
              <span className="badge badge-primary" style={{ fontSize: '12px' }}>
                {album.length} {album.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Add pictures to your personal album. Stored safely in your browser and ready to send directly in chats or show on your profile!
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={albumFileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAddAlbumPhoto}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => albumFileInputRef.current?.click()}
              disabled={isUploadingAlbum}
            >
              <Plus size={16} />
              <span>{isUploadingAlbum ? 'Compressing...' : 'Add Photo'}</span>
            </button>
          </div>
        </div>

        {/* Album Photos Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 14,
          alignItems: 'stretch'
        }}>
          {/* Quick Add Card */}
          <button
            type="button"
            onClick={() => albumFileInputRef.current?.click()}
            disabled={isUploadingAlbum}
            style={{
              aspectRatio: '1',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-elevated)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={20} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {isUploadingAlbum ? 'Adding...' : 'Add Photo'}
            </span>
          </button>

          {/* Stored Photos */}
          {album.map((photo, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxData({
                url: photo,
                name: `${name || 'Your Profile'}'s Album`,
                subtitle: `Photo ${idx + 1} of ${album.length}`
              })}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: 'var(--surface-elevated)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              title="Click to view full photo"
            >
              <img
                src={photo}
                alt={`Album photo ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Action Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: 8
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 600 }}>
                  <Eye size={13} /> View
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteAlbumPhoto(idx, e)}
                  title="Delete from album"
                  style={{
                    background: 'rgba(239, 68, 68, 0.95)',
                    border: 'none',
                    borderRadius: '6px',
                    width: 28,
                    height: 28,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {album.length === 0 && (
          <div style={{
            marginTop: 16,
            textAlign: 'center',
            padding: '24px',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            background: 'var(--surface-elevated)',
            borderRadius: 'var(--radius-md)'
          }}>
            Your album is empty. Click "+ Add Photo" to upload pictures from your computer or phone!
          </div>
        )}
      </div>

      {/* Full-Screen Image Lightbox */}
      <ImageLightbox
        isOpen={Boolean(lightboxData)}
        imageUrl={lightboxData?.url}
        name={lightboxData?.name}
        subtitle={lightboxData?.subtitle}
        onClose={() => setLightboxData(null)}
      />
    </div>
  );
};

export default MyProfile;

import React, { useRef, useState } from 'react';
import { Images, Plus, Upload, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserContext } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { compressImage } from '../../utils/imageUtils';

const AlbumTab = ({ onOpenAlbum, activePartner }) => {
  const { currentUser } = useAuth();
  const { users, album, getUserAlbum, blockedUsers, addPhotoToAlbum } = useUserContext();
  const { showToast } = useNotification();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select a valid image file.');
      return;
    }

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 500, 500, 0.85);
      addPhotoToAlbum(compressed);
      showToast('success', 'Photo Added to Album', 'Saved in your personal album.');
    } catch (err) {
      showToast('error', 'Upload Failed', err.message || 'Could not process image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Contacts and visible profiles with albums
  const otherUsers = (users || []).filter(
    (u) => u.id !== currentUser?.id && !blockedUsers?.includes(u.id)
  );

  return (
    <div style={{ padding: '12px', height: '100%', overflowY: 'auto' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadPhoto}
      />

      {/* Grid of Albums (3 columns, exactly like Grindr Screenshot 2) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        alignItems: 'stretch'
      }}>
        {/* Card 1: "My Albums" (Screenshot 2: dark grey tile with Images icon & label) */}
        <div
          onClick={() => {
            if (onOpenAlbum) {
              onOpenAlbum({
                type: 'my_album',
                user: currentUser,
                photos: album
              });
            }
          }}
          style={{
            aspectRatio: '0.85',
            background: '#24252b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.15s, background 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.background = '#2c2d35';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = '#24252b';
          }}
          role="button"
          tabIndex={0}
          title="Open My Albums"
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            color: '#fff'
          }}>
            <i className="fa-solid fa-images" style={{ fontSize: '20px' }}></i>
          </div>

          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2
          }}>
            My Albums
          </div>

          <div style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: 4
          }}>
            {album.length} {album.length === 1 ? 'photo' : 'photos'}
          </div>

          {/* Quick Add Plus button on bottom corner */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--primary)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Upload photo to my album"
          >
            <i className="fa-solid fa-plus" style={{ fontSize: '11px' }}></i>
          </button>
        </div>

        {/* Cards 2..N: Other Users' Albums (Blurred cover + Centered circular avatar + Name) */}
        {otherUsers.map((u) => {
          const userPhotos = getUserAlbum(u.id);
          const coverPhoto = (userPhotos && userPhotos.length > 0) ? userPhotos[0] : u.image;
          const photoCount = userPhotos ? userPhotos.length : 0;

          return (
            <div
              key={u.id}
              onClick={() => {
                if (onOpenAlbum) {
                  onOpenAlbum({
                    type: 'user_album',
                    user: u,
                    photos: userPhotos.length > 0 ? userPhotos : [u.image]
                  });
                }
              }}
              style={{
                position: 'relative',
                aspectRatio: '0.85',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
              }}
              role="button"
              tabIndex={0}
              title={`View ${u.name}'s Album`}
            >
              {/* Blurred Background Cover Image (Grindr style from Screenshot 2) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${coverPhoto})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(10px) brightness(0.65)',
                  transform: 'scale(1.2)'
                }}
              />

              {/* Dark vignette overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)'
                }}
              />

              {/* Top Photo Count Badge */}
              <div style={{
                position: 'absolute',
                top: 6,
                right: 6,
                fontSize: '9px',
                fontWeight: 700,
                color: '#fff',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                padding: '2px 6px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                zIndex: 2
              }}>
                {photoCount}
              </div>

              {/* Center Circular Avatar (Screenshot 2) */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                width: 44,
                height: 44,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                marginBottom: 6
              }}>
                <img
                  src={u.image}
                  alt={u.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>

              {/* Bottom User Name (Screenshot 2: e.g. "With palace", "Top 38") */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {u.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlbumTab;

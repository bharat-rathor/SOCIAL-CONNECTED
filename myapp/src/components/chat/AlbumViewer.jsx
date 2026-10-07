import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Flame, Send, Plus, Trash2, User, Upload, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useUserContext } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { compressImage } from '../../utils/imageUtils';

const AlbumViewer = ({ albumData, onClose, onSelectPartner }) => {
  const { sendMessage } = useChat();
  const { album, addPhotoToAlbum, removePhotoFromAlbum } = useUserContext();
  const { showToast } = useNotification();
  const fileInputRef = useRef(null);

  const isMyAlbum = albumData?.type === 'my_album';
  const targetUser = albumData?.user;

  // For my_album, use live album from context; for targetUser, use passed photos
  const photos = isMyAlbum ? album : (albumData?.photos || []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Keep index in bounds if photos length changes
  useEffect(() => {
    if (currentIndex >= photos.length && photos.length > 0) {
      setCurrentIndex(photos.length - 1);
    }
  }, [photos.length, currentIndex]);

  // Keyboard navigation (arrow left / arrow right / escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length, onClose]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !targetUser) return;
    const currentPhoto = photos[currentIndex] || null;
    sendMessage(targetUser.id, messageText.trim(), currentPhoto);
    showToast('success', 'Replied to Album!', `Sent reply on photo to ${targetUser.name}`);
    setMessageText('');
    if (onSelectPartner) {
      onSelectPartner(targetUser.id);
    } else if (onClose) {
      onClose();
    }
  };

  const handleSendFlame = () => {
    if (!targetUser) return;
    const currentPhoto = photos[currentIndex] || null;
    sendMessage(targetUser.id, '🔥', currentPhoto);
    showToast('success', 'Flame Sent! 🔥', `Sent flame on album photo to ${targetUser.name}`);
    if (onSelectPartner) {
      onSelectPartner(targetUser.id);
    } else if (onClose) {
      onClose();
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 500, 500, 0.85);
      addPhotoToAlbum(compressedDataUrl);
      showToast('success', 'Photo Added!', 'Saved to your personal album.');
      setCurrentIndex(0); // View the newest added photo
    } catch (err) {
      showToast('error', 'Upload Failed', err.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteCurrentPhoto = () => {
    if (!isMyAlbum || photos.length === 0) return;
    removePhotoFromAlbum(currentIndex);
    showToast('info', 'Photo Removed', 'Removed photo from your album.');
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d11',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hidden file input for adding to my album */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadPhoto}
      />

      {/* Top Header Bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 10
      }}>
        {/* Left: Close button */}
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          title="Close Album Viewer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Center: Title & Photo Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {targetUser && (
            <img
              src={targetUser.image}
              alt={targetUser.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--primary)'
              }}
            />
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.02em' }}>
              {isMyAlbum ? 'My Album' : `${targetUser?.name || 'User'}'s Album`}
            </div>
            {photos.length > 0 && (
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {currentIndex + 1} of {photos.length}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMyAlbum ? (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>{isUploading ? 'Adding...' : 'Add Photo'}</span>
              </button>
              {photos.length > 0 && (
                <button
                  onClick={handleDeleteCurrentPhoto}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Delete this photo"
                  aria-label="Delete photo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          ) : (
            targetUser && (
              <button
                onClick={() => {
                  if (onSelectPartner) onSelectPartner(targetUser.id);
                  onClose();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={14} />
                <span>Open Chat</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Center Image Carousel Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '16px 20px',
        overflow: 'hidden'
      }}>
        {photos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 32,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            maxWidth: 380
          }}>
            <Upload size={40} style={{ opacity: 0.4, marginBottom: 12, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px' }}>
              {isMyAlbum ? 'Your Album is Empty' : 'No Photos Available'}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 16px' }}>
              {isMyAlbum
                ? 'Upload pictures here. All your uploaded images stay organized in this album and can be sent to matches in chat.'
                : 'This user has not uploaded any photos to their album yet.'}
            </p>
            {isMyAlbum && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Plus size={15} /> Upload First Photo
              </button>
            )}
          </div>
        ) : (
          <div style={{
            position: 'relative',
            maxWidth: 'min(90%, 540px)',
            maxHeight: 'min(76vh, 560px)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* The Main Image with Rounded Corners (Grindr style) */}
            <img
              src={currentPhoto}
              alt={`Photo ${currentIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '18px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                display: 'block',
                transition: 'transform 0.2s ease-out'
              }}
            />

            {/* Left Chevron Button */}
            {photos.length > 1 && (
              <button
                onClick={handlePrev}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  zIndex: 2
                }}
                title="Previous photo"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Right Chevron Button */}
            {photos.length > 1 && (
              <button
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  zIndex: 2
                }}
                title="Next photo"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action / Chat Bar (Screenshots 3 matching "Say something...") */}
      <div style={{
        padding: '16px 24px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}>
        {isMyAlbum ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 540 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-primary btn-block"
              style={{
                borderRadius: '999px',
                height: 46,
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Plus size={18} />
              <span>{isUploading ? 'Uploading & Compressing...' : 'Add More Photos to Album'}</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 540,
              gap: 10
            }}
          >
            {/* Pill Chat Input ("Say something...") */}
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#222329',
              borderRadius: '999px',
              padding: '4px 16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Say something..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  padding: '10px 0'
                }}
              />

              {messageText.trim() ? (
                <button
                  type="submit"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              ) : null}
            </div>

            {/* Flame Quick Reaction Icon (matching Grindr flame in screenshot) */}
            <button
              type="button"
              onClick={handleSendFlame}
              style={{
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '50%',
                width: 44,
                height: 44,
                color: '#eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Send Flame 🔥"
              aria-label="Send flame"
            >
              <Flame size={22} fill="#eab308" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AlbumViewer;

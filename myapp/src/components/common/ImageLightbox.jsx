import React, { useEffect } from 'react';
import { X, MapPin } from 'lucide-react';

const ImageLightbox = ({ isOpen, imageUrl, name, subtitle, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Profile Photo Viewer"
    >
      {/* Top Close Bar */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: 12,
          zIndex: 10000
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          aria-label="Close photo view"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '90vw',
          maxHeight: '85vh',
          animation: 'zoomIn 0.25s ease-out',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            background: '#111',
            maxWidth: 520,
            maxHeight: 520,
            width: 'min(85vw, 500px)',
            height: 'min(85vw, 500px)',
          }}
        >
          <img
            src={imageUrl}
            alt={name || 'Profile Photo'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>

        {/* User Info Caption Below */}
        {name && (
          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
              color: 'white',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <span>{name}</span>
            {subtitle && (
              <>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.85, fontSize: '13px', fontWeight: 400 }}>
                  <MapPin size={13} style={{ color: 'var(--primary)' }} />
                  {subtitle}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ImageLightbox;

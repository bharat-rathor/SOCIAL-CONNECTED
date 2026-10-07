import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Trash2, Image as ImageIcon, X, Images, Upload, Phone, Video } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useUserContext } from '../../context/UserContext';
import { usePeer } from '../../context/PeerContext';
import { useCall } from '../../context/CallContext';
import MessageBubble from './MessageBubble';
import OnlineStatus from '../common/OnlineStatus';
import PremiumBadge from '../common/PremiumBadge';
import ImageLightbox from '../common/ImageLightbox';
import Modal from '../common/Modal';
import { DEFAULT_USER_PHOTO } from '../../data/users';
import { compressImage } from '../../utils/imageUtils';

const ChatWindow = ({ partner, isMobile = false, onBack }) => {
  const { currentUser } = useAuth();
  const { album, addPhotoToAlbum } = useUserContext();
  const { getConversation, sendMessage, markAsRead, clearChat } = useChat();
  const { connectToUser, sendTyping, typingUsers } = usePeer();
  const { startCall } = useCall();

  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState(false);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const messages = getConversation(partner?.id);

  // Mark as read when partner changes
  useEffect(() => {
    if (partner?.id) markAsRead(partner.id);
  }, [partner?.id, messages.length]);

  // Auto-connect to partner over P2P when chat is open
  useEffect(() => {
    if (partner?.id && connectToUser) {
      connectToUser(partner.id);
    }
  }, [partner?.id, connectToUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingImage, typingUsers?.[partner?.id]]);

  const handleSend = () => {
    if ((!input.trim() && !pendingImage) || !partner) return;
    if (sendTyping) sendTyping(partner.id, false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendMessage(partner.id, input.trim(), pendingImage);
    setInput('');
    setPendingImage(null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (partner?.id && sendTyping) {
      sendTyping(partner.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(partner.id, false);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChat(partner.id);
    setShowMenu(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setPendingImage(compressedDataUrl);
      // Automatically add to user's album as well so it's stored and reusable
      addPhotoToAlbum(compressedDataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectFromAlbum = (photoUrl) => {
    setPendingImage(photoUrl);
    setShowAlbumPicker(false);
    inputRef.current?.focus();
  };

  if (!partner) {
    return (
      <div className="chat-window-empty">
        <div style={{ fontSize: 48 }}>💬</div>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
          Select a conversation
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Choose from your chats or start a new one
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="chat-window-header">
        <button
          className="btn btn-icon mobile-only"
          onClick={() => {
            if (onBack) onBack();
            else navigate('/messages');
          }}
          aria-label="Back to conversations"
          style={{ marginRight: 6 }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <img
          src={partner.image}
          alt={partner.name}
          className="avatar avatar-md"
          onClick={() => setShowPhotoLightbox(true)}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Click to view full photo"
          onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
        />
        <div className="chat-window-header-info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${partner.id}`)}>
          <div className="chat-window-header-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {partner.name}
            {partner.isPremium && <PremiumBadge />}
          </div>
          <div className="chat-window-header-status">
            <OnlineStatus user={partner} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="btn btn-icon"
            onClick={() => startCall(partner, 'voice')}
            aria-label="Start voice call"
            title="Voice Call"
            style={{ color: 'var(--text-secondary)', fontSize: '15px' }}
          >
            <i className="fa-solid fa-phone"></i>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => startCall(partner, 'video')}
            aria-label="Start video call"
            title="Video Call"
            style={{ color: 'var(--text-secondary)', fontSize: '15px' }}
          >
            <i className="fa-solid fa-video"></i>
          </button>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-icon" onClick={() => setShowMenu(p => !p)} aria-label="More options" style={{ fontSize: '15px' }}>
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', minWidth: 160, zIndex: 100 }}>
                <button
                  onClick={handleClear}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', fontSize: 'var(--text-sm)', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-trash-can" style={{ fontSize: '13px' }}></i> Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: 32 }}>
            No messages yet. Say hello or send a photo! 👋
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.senderId === currentUser?.id}
            />
          ))
        )}
        {partner?.id && typingUsers?.[partner.id] && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'var(--gray-100)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: 'var(--primary)',
            fontStyle: 'italic',
            alignSelf: 'flex-start',
            margin: '4px 0'
          }}>
            <span className="online-dot online" style={{ width: 6, height: 6 }} />
            {partner.name} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending Image Attachment Preview */}
      {pendingImage && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--surface-elevated)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
            <img src={pendingImage} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => setPendingImage(null)}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title="Remove photo"
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: '11px' }}></i>
            </button>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Photo attached. Type a caption or click Send!
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
        {/* Photo Upload & Album Action Buttons */}
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => fileInputRef.current?.click()}
          title="Upload and send photo"
          aria-label="Upload photo"
          style={{ flexShrink: 0, color: 'var(--text-secondary)', fontSize: '16px' }}
          disabled={isUploadingPhoto}
        >
          <i className="fa-solid fa-image"></i>
        </button>

        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setShowAlbumPicker(true)}
          title="Select from My Album"
          aria-label="Select from Album"
          style={{ flexShrink: 0, color: 'var(--text-secondary)', fontSize: '16px' }}
        >
          <i className="fa-solid fa-images"></i>
        </button>

        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${partner.name}...`}
          rows={1}
          aria-label={`Message ${partner.name}`}
          style={{ flex: 1, resize: 'none' }}
        />

        <button
          className="btn btn-premium"
          onClick={handleSend}
          disabled={!input.trim() && !pendingImage}
          aria-label="Send message"
          style={{ height: 42, padding: '0 18px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <i className="fa-solid fa-paper-plane" style={{ fontSize: '14px' }}></i>
          <span className="hide-mobile">Send</span>
        </button>
      </div>

      {/* Full-Screen Photo Lightbox */}
      <ImageLightbox
        isOpen={showPhotoLightbox}
        imageUrl={partner.image}
        name={partner.name}
        subtitle={`${partner.area || ''}, ${partner.city || ''}`}
        onClose={() => setShowPhotoLightbox(false)}
      />

      {/* Album Picker Modal */}
      <Modal
        isOpen={showAlbumPicker}
        onClose={() => setShowAlbumPicker(false)}
        title="Select From Your Album"
        subtitle="Click a photo to attach and send in this chat"
        maxWidth={500}
      >
        {album.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>
              You don't have any photos in your album yet.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowAlbumPicker(false);
                fileInputRef.current?.click();
              }}
            >
              <Upload size={14} /> Upload First Photo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxHeight: 340, overflowY: 'auto', padding: 4 }}>
            {album.map((photo, idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  position: 'relative'
                }}
                onClick={() => handleSelectFromAlbum(photo)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                title="Select this photo"
              >
                <img src={photo} alt={`Album ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatWindow;

import React, { useState } from 'react';
import { formatChatTime } from '../../utils/dateUtils';
import { Check, CheckCheck } from 'lucide-react';
import ImageLightbox from '../common/ImageLightbox';

// ── Status Icon for sent/delivered/seen ──────────────────────
const MessageStatusIcon = ({ status, seen }) => {
  // Normalize: old messages may only have seen: bool
  const resolvedStatus = status || (seen ? 'seen' : 'delivered');

  if (resolvedStatus === 'seen') {
    return (
      <span title="Seen" style={{ display: 'inline-flex', alignItems: 'center', color: '#60a5fa' }}>
        <CheckCheck size={12} />
      </span>
    );
  }
  if (resolvedStatus === 'delivered') {
    return (
      <span title="Delivered" style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.75 }}>
        <CheckCheck size={12} />
      </span>
    );
  }
  // sent
  return (
    <span title="Sent" style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.55 }}>
      <Check size={12} />
    </span>
  );
};

const MessageBubble = ({ message, isMe }) => {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <div className={`message-bubble-row ${isMe ? 'sent' : ''}`}>
        <div
          className={`message-bubble ${isMe ? 'sent' : 'received'}`}
          style={{
            padding: message.image && !message.message ? 4 : undefined,
            overflow: 'hidden'
          }}
        >
          {message.image && (
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                marginBottom: message.message ? 6 : 0,
                maxWidth: 270,
                position: 'relative'
              }}
              onClick={() => setShowLightbox(true)}
              title="Click to view full image"
            >
              <img
                src={message.image}
                alt="Shared in chat"
                style={{
                  width: '100%',
                  maxHeight: 250,
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 'var(--radius-md)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.94'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              />
              <div style={{
                position: 'absolute',
                top: 6,
                left: 6,
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                backdropFilter: 'blur(4px)',
                letterSpacing: '0.02em'
              }}>
                📷 Photo
              </div>
            </div>
          )}

          {message.message && (
            <div style={{ wordBreak: 'break-word', padding: message.image ? '4px 6px 4px' : undefined }}>
              {message.message === '🔥' && message.image ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: isMe ? '#fff' : 'var(--text-primary)' }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
                  <span>Reacted to photo</span>
                </div>
              ) : (
                message.message
              )}
            </div>
          )}
        </div>

        <div className={`message-time ${isMe ? 'sent' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {formatChatTime(message.timestamp)}
          {isMe && <MessageStatusIcon status={message.status} seen={message.seen} />}
        </div>
      </div>

      {message.image && (
        <ImageLightbox
          isOpen={showLightbox}
          imageUrl={message.image}
          name="Photo"
          subtitle={formatChatTime(message.timestamp)}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;

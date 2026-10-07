import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, Maximize2, Minimize2 } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { DEFAULT_USER_PHOTO } from '../../data/users';

const CallModal = () => {
  const {
    activeCall,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    formatDuration
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall?.status, activeCall?.isCameraOff]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, activeCall?.status]);

  if (!activeCall) return null;

  const {
    partnerName,
    partnerImage,
    callType,
    status,
    isMuted,
    isCameraOff,
    isSpeakerMuted,
    durationSec
  } = activeCall;

  const isVideo = callType === 'video';

  return (
    <div
      className="call-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        className="call-card"
        style={{
          width: isFullScreen ? '96vw' : 'clamp(340px, 90vw, 560px)',
          height: isFullScreen ? '94vh' : isVideo && status === 'connected' ? 'clamp(480px, 80vh, 640px)' : 'auto',
          background: 'linear-gradient(145deg, rgba(23, 27, 44, 0.95), rgba(13, 16, 28, 0.98))',
          borderRadius: 28,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: status === 'connected' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: status === 'connected' ? '#4ade80' : '#818cf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: `1px solid ${status === 'connected' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
              }}
            >
              <ShieldCheck size={13} />
              {status === 'connected' ? 'WebRTC Encrypted • HD' : 'Connecting...'}
            </span>
            {status === 'connected' && (
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(durationSec || 0)}
              </span>
            )}
          </div>

          {status === 'connected' && isVideo && (
            <button
              onClick={() => setIsFullScreen(p => !p)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                padding: 8,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>

        {/* ── 1. INCOMING RINGING VIEW ────────────────────────── */}
        {status === 'incoming_ringing' && (
          <div
            style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Pulsing Avatar */}
            <div style={{ position: 'relative', marginBottom: 28 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -14,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                  animation: 'pulse 1.8s infinite ease-in-out'
                }}
              />
              <img
                src={partnerImage || DEFAULT_USER_PHOTO}
                alt={partnerName}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #6366f1',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)',
                  position: 'relative'
                }}
                onError={(e) => { e.target.src = DEFAULT_USER_PHOTO; }}
              />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              {partnerName}
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isVideo ? <Video size={16} color="#818cf8" /> : <Phone size={16} color="#818cf8" />}
              Incoming {isVideo ? 'Video' : 'Voice'} Call...
            </p>

            {/* Answer & Decline Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 44 }}>
              {/* Decline Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={rejectCall}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <i className="fa-solid fa-phone-slash" style={{ fontSize: '22px' }}></i>
                </button>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Decline</span>
              </div>

              {/* Accept Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={acceptCall}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
                    animation: 'bounce 1s infinite alternate',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isVideo ? <i className="fa-solid fa-video" style={{ fontSize: '24px' }}></i> : <i className="fa-solid fa-phone" style={{ fontSize: '24px' }}></i>}
                </button>
                <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>Accept</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. OUTGOING CALLING VIEW ────────────────────────── */}
        {status === 'outgoing_calling' && (
          <div
            style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Pulsing Avatar */}
            <div style={{ position: 'relative', marginBottom: 28 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -14,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
                  animation: 'pulse 2s infinite ease-in-out'
                }}
              />
              <img
                src={partnerImage || DEFAULT_USER_PHOTO}
                alt={partnerName}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #6366f1',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)',
                  position: 'relative'
                }}
                onError={(e) => { e.target.src = DEFAULT_USER_PHOTO; }}
              />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              {partnerName}
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0 }}>
              Ringing...
            </p>

            {/* Cancel Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 44 }}>
              <button
                onClick={() => endCall('Cancelled')}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <i className="fa-solid fa-phone-slash" style={{ fontSize: '24px' }}></i>
              </button>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>End Call</span>
            </div>
          </div>
        )}

        {/* ── 3. CONNECTED ACTIVE CALL VIEW ───────────────────── */}
        {status === 'connected' && (
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {isVideo ? (
              /* Video Container */
              <div style={{ flex: 1, position: 'relative', background: '#0a0d1a', minHeight: 340, overflow: 'hidden' }}>
                {/* Main Remote Video View */}
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)'
                    }}
                  >
                    <img
                      src={partnerImage || DEFAULT_USER_PHOTO}
                      alt={partnerName}
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                        marginBottom: 16
                      }}
                      onError={(e) => { e.target.src = DEFAULT_USER_PHOTO; }}
                    />
                    <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                      {partnerName}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
                      Live Video Connected
                    </span>
                  </div>
                )}

                {/* Picture-in-Picture Local Video View */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    width: 'clamp(90px, 24vw, 130px)',
                    height: 'clamp(120px, 32vw, 170px)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                    background: '#111827',
                    zIndex: 20
                  }}
                >
                  {isCameraOff ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                      Camera Off
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)' // Mirror local camera view
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Voice Call Screen */
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 24px',
                  background: 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)'
                }}
              >
                <div style={{ position: 'relative', marginBottom: 24 }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: -16,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%)',
                      animation: 'pulse 2.5s infinite ease-in-out'
                    }}
                  />
                  <img
                    src={partnerImage || DEFAULT_USER_PHOTO}
                    alt={partnerName}
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #22c55e',
                      boxShadow: '0 0 24px rgba(34, 197, 94, 0.35)',
                      position: 'relative'
                    }}
                    onError={(e) => { e.target.src = DEFAULT_USER_PHOTO; }}
                  />
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                  {partnerName}
                </h3>
                <span style={{ fontSize: '1rem', color: '#4ade80', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatDuration(durationSec || 0)}
                </span>
              </div>
            )}

            {/* Bottom Floating Control Bar */}
            <div
              style={{
                padding: '16px 24px',
                background: 'rgba(10, 13, 26, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                zIndex: 20
              }}
            >
              {/* Mic Toggle */}
              <button
                onClick={toggleMute}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <i className="fa-solid fa-microphone-slash" style={{ fontSize: '18px' }}></i> : <i className="fa-solid fa-microphone" style={{ fontSize: '18px' }}></i>}
              </button>

              {/* Camera Toggle (Only for Video Call) */}
              {isVideo && (
                <button
                  onClick={toggleCamera}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: isCameraOff ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isCameraOff ? <i className="fa-solid fa-video-slash" style={{ fontSize: '18px' }}></i> : <i className="fa-solid fa-video" style={{ fontSize: '18px' }}></i>}
                </button>
              )}

              {/* Speaker Toggle */}
              <button
                onClick={toggleSpeaker}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: isSpeakerMuted ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={isSpeakerMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isSpeakerMuted ? <i className="fa-solid fa-volume-xmark" style={{ fontSize: '18px' }}></i> : <i className="fa-solid fa-volume-high" style={{ fontSize: '18px' }}></i>}
              </button>

              {/* End Call Button */}
              <button
                onClick={() => endCall('Completed')}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.45)',
                  marginLeft: 8,
                  transition: 'transform 0.15s ease'
                }}
                title="End Call"
              >
                <i className="fa-solid fa-phone-slash" style={{ fontSize: '22px' }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ── 4. CALL ENDED SUMMARY VIEW ──────────────────────── */}
        {status === 'ended' && (
          <div
            style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <i className="fa-solid fa-phone-slash" style={{ fontSize: '28px' }}></i>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>
              Call Ended
            </h3>
            {durationSec > 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                Duration: {formatDuration(durationSec)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;

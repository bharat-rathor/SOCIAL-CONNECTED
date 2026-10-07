import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { useNotification } from './NotificationContext';
import { startIncomingRingtone, startOutgoingDialTone, stopRingtone, playCallEndedTone } from '../utils/soundEffects';

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { sendMessage } = useChat();
  const { showToast } = useNotification();

  // Call state: null | { callId, partnerId, partnerName, partnerImage, callType, status, isMuted, isCameraOff, isSpeakerMuted, startTime, durationSec }
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const currentCallRef = useRef(null);

  // Keep ref synchronized with state
  useEffect(() => {
    currentCallRef.current = activeCall;
  }, [activeCall]);

  // Clean up media tracks helper
  const stopMediaTracks = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) {}
      pcRef.current = null;
    }
  }, []);

  // Format seconds to mm:ss
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to acquire local camera/microphone or create fallback synthetic stream
  const acquireMediaStream = async (videoRequired = true) => {
    // 1. Try real hardware media
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoRequired,
          audio: true
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      } catch (err) {
        console.warn('Real camera/mic unavailable or permission denied, using synthetic simulation stream:', err);
      }
    }

    // 2. High-quality synthetic fallback stream (Canvas + Web Audio)
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      let hue = 220;
      const renderFallbackFrame = () => {
        if (!ctx) return;
        hue = (hue + 1) % 360;
        ctx.fillStyle = `hsl(${hue}, 40%, 15%)`;
        ctx.fillRect(0, 0, 640, 480);

        // Draw animated soundwave rings
        ctx.strokeStyle = `hsl(${(hue + 40) % 360}, 80%, 65%)`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        const radius = 60 + Math.sin(Date.now() / 200) * 15;
        ctx.arc(320, 240, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentUser?.name || 'Local User', 320, 245);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Live Simulated HD Stream', 320, 275);
      };

      const animInterval = setInterval(renderFallbackFrame, 50);
      const canvasStream = canvas.captureStream(25);

      // Attach audio oscillator track
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const actx = new AudioContextClass();
          const dest = actx.createMediaStreamDestination();
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          gain.gain.value = 0.001; // virtually silent hum
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          dest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
        }
      } catch (e) {}

      // Clean up interval when track ends
      canvasStream.getVideoTracks().forEach(t => {
        const origStop = t.stop.bind(t);
        t.stop = () => {
          clearInterval(animInterval);
          origStop();
        };
      });

      localStreamRef.current = canvasStream;
      setLocalStream(canvasStream);
      return canvasStream;
    } catch (e) {
      console.error('Failed to create fallback stream:', e);
      return null;
    }
  };

  // ── Establish WebRTC Peer Connection ──────────────────────
  const setupPeerConnection = useCallback((partnerId, isInitiator) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      pcRef.current = pc;

      // Add local tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote incoming tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && import.meta.hot && currentCallRef.current?.callId) {
          import.meta.hot.send('social:call-signal', {
            callId: currentCallRef.current.callId,
            senderId: currentUser?.id,
            receiverId: partnerId,
            signal: { candidate: event.candidate }
          });
        }
      };

      if (isInitiator) {
        pc.createOffer().then(offer => {
          return pc.setLocalDescription(offer);
        }).then(() => {
          if (import.meta.hot && currentCallRef.current?.callId) {
            import.meta.hot.send('social:call-signal', {
              callId: currentCallRef.current.callId,
              senderId: currentUser?.id,
              receiverId: partnerId,
              signal: { sdp: pc.localDescription }
            });
          }
        }).catch(err => console.error('Error creating WebRTC offer:', err));
      }

      return pc;
    } catch (err) {
      console.warn('WebRTC peer connection setup fallback:', err);
      return null;
    }
  }, [currentUser?.id]);

  // ── Listen to WebSocket Server Call Events ────────────────
  useEffect(() => {
    if (!import.meta.hot || !currentUser?.id) return;

    // Incoming Call Request
    const unbindCallRequest = import.meta.hot.on('social:call-request', (data) => {
      if (String(data.receiverId) === String(currentUser.id)) {
        // If already in a call, reject automatically
        if (currentCallRef.current) {
          import.meta.hot.send('social:call-rejected', {
            callId: data.callId,
            receiverId: currentUser.id,
            reason: 'busy'
          });
          return;
        }

        console.log('Incoming call received:', data);
        startIncomingRingtone();
        setActiveCall({
          callId: data.callId,
          partnerId: data.callerId,
          partnerName: data.callerName,
          partnerImage: data.callerImage,
          callType: data.callType || 'video',
          status: 'incoming_ringing',
          isMuted: false,
          isCameraOff: false,
          isSpeakerMuted: false,
          startTime: null,
          durationSec: 0
        });
      }
    });

    // Call Accepted
    const unbindCallAccepted = import.meta.hot.on('social:call-accepted', async (data) => {
      if (currentCallRef.current && currentCallRef.current.callId === data.callId) {
        stopRingtone();
        const stream = await acquireMediaStream(currentCallRef.current.callType === 'video');
        setupPeerConnection(currentCallRef.current.partnerId, true);

        setActiveCall(prev => ({
          ...prev,
          status: 'connected',
          startTime: Date.now(),
          durationSec: 0
        }));
      }
    });

    // Call Rejected
    const unbindCallRejected = import.meta.hot.on('social:call-rejected', (data) => {
      if (currentCallRef.current && currentCallRef.current.callId === data.callId) {
        playCallEndedTone();
        stopMediaTracks();
        showToast('info', 'Call Declined', `${currentCallRef.current.partnerName} is unavailable.`);
        setActiveCall(prev => ({ ...prev, status: 'ended' }));
        setTimeout(() => setActiveCall(null), 1800);
      }
    });

    // Call Ended
    const unbindCallEnded = import.meta.hot.on('social:call-ended', (data) => {
      if (currentCallRef.current && currentCallRef.current.callId === data.callId) {
        playCallEndedTone();
        stopMediaTracks();
        const duration = currentCallRef.current.durationSec;
        if (duration > 0) {
          showToast('info', 'Call Ended', `Call duration: ${formatDuration(duration)}`);
        }
        setActiveCall(prev => ({ ...prev, status: 'ended' }));
        setTimeout(() => setActiveCall(null), 1800);
      }
    });

    // WebRTC Signaling (SDP / ICE)
    const unbindCallSignal = import.meta.hot.on('social:call-signal', async (data) => {
      if (currentCallRef.current && currentCallRef.current.callId === data.callId && String(data.receiverId) === String(currentUser.id)) {
        const pc = pcRef.current;
        if (!pc) return;

        try {
          if (data.signal?.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
            if (data.signal.sdp.type === 'offer') {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              import.meta.hot.send('social:call-signal', {
                callId: data.callId,
                senderId: currentUser.id,
                receiverId: data.senderId,
                signal: { sdp: pc.localDescription }
              });
            }
          } else if (data.signal?.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
          }
        } catch (err) {
          console.warn('WebRTC signal processing error:', err);
        }
      }
    });

    return () => {
      if (unbindCallRequest) unbindCallRequest();
      if (unbindCallAccepted) unbindCallAccepted();
      if (unbindCallRejected) unbindCallRejected();
      if (unbindCallEnded) unbindCallEnded();
      if (unbindCallSignal) unbindCallSignal();
    };
  }, [currentUser?.id, stopMediaTracks, setupPeerConnection, showToast]);

  // Duration Timer
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      durationIntervalRef.current = setInterval(() => {
        setActiveCall(prev => prev ? ({ ...prev, durationSec: (prev.durationSec || 0) + 1 }) : null);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [activeCall?.status]);

  // ── Initiate Call ─────────────────────────────────────────
  const startCall = useCallback(async (targetPartner, callType = 'video') => {
    if (!currentUser || !targetPartner) return;

    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    startOutgoingDialTone();

    // Acquire local media preview in background
    await acquireMediaStream(callType === 'video');

    const newCallState = {
      callId,
      partnerId: targetPartner.id,
      partnerName: targetPartner.name,
      partnerImage: targetPartner.image,
      callType,
      status: 'outgoing_calling',
      isMuted: false,
      isCameraOff: false,
      isSpeakerMuted: false,
      startTime: null,
      durationSec: 0
    };

    setActiveCall(newCallState);

    // Broadcast call request to server
    if (import.meta.hot) {
      import.meta.hot.send('social:call-request', {
        callId,
        callerId: currentUser.id,
        callerName: currentUser.name,
        callerImage: currentUser.image,
        receiverId: targetPartner.id,
        callType
      });
    }

    // Auto-timeout after 35 seconds if unanswered
    setTimeout(() => {
      if (currentCallRef.current?.callId === callId && currentCallRef.current?.status === 'outgoing_calling') {
        endCall('No Answer');
      }
    }, 35000);
  }, [currentUser]);

  // ── Accept Incoming Call ──────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!activeCall || activeCall.status !== 'incoming_ringing') return;

    stopRingtone();
    await acquireMediaStream(activeCall.callType === 'video');
    setupPeerConnection(activeCall.partnerId, false);

    if (import.meta.hot) {
      import.meta.hot.send('social:call-accepted', {
        callId: activeCall.callId,
        callerId: activeCall.partnerId,
        receiverId: currentUser?.id
      });
    }

    setActiveCall(prev => ({
      ...prev,
      status: 'connected',
      startTime: Date.now(),
      durationSec: 0
    }));
  }, [activeCall, currentUser?.id, setupPeerConnection]);

  // ── Reject Incoming Call ──────────────────────────────────
  const rejectCall = useCallback(() => {
    if (!activeCall) return;

    stopRingtone();
    if (import.meta.hot) {
      import.meta.hot.send('social:call-rejected', {
        callId: activeCall.callId,
        receiverId: currentUser?.id,
        reason: 'declined'
      });
    }

    // Log missed call into chat
    if (activeCall.partnerId && sendMessage) {
      sendMessage(activeCall.partnerId, `📞 Missed ${activeCall.callType === 'video' ? 'Video' : 'Voice'} Call`);
    }

    setActiveCall(prev => ({ ...prev, status: 'ended' }));
    setTimeout(() => setActiveCall(null), 1000);
  }, [activeCall, currentUser?.id, sendMessage]);

  // ── End Current Call ──────────────────────────────────────
  const endCall = useCallback((reasonLabel = '') => {
    if (!activeCall) return;

    playCallEndedTone();
    stopMediaTracks();

    if (import.meta.hot) {
      import.meta.hot.send('social:call-ended', {
        callId: activeCall.callId,
        senderId: currentUser?.id,
        receiverId: activeCall.partnerId
      });
    }

    // Log call duration to chat message
    if (activeCall.partnerId && sendMessage) {
      const typeLabel = activeCall.callType === 'video' ? 'Video' : 'Voice';
      if (activeCall.durationSec > 0) {
        sendMessage(activeCall.partnerId, `📞 ${typeLabel} Call Ended • ${formatDuration(activeCall.durationSec)}`);
      } else {
        sendMessage(activeCall.partnerId, `📞 Missed ${typeLabel} Call`);
      }
    }

    setActiveCall(prev => ({ ...prev, status: 'ended' }));
    setTimeout(() => setActiveCall(null), 1500);
  }, [activeCall, currentUser?.id, sendMessage, stopMediaTracks]);

  // ── Mute Microphone Toggle ────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setActiveCall(prev => prev ? ({ ...prev, isMuted: !audioTrack.enabled }) : null);
    }
  }, []);

  // ── Toggle Camera On/Off ──────────────────────────────────
  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setActiveCall(prev => prev ? ({ ...prev, isCameraOff: !videoTrack.enabled }) : null);
    }
  }, []);

  // ── Toggle Speaker Mute ───────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    setActiveCall(prev => prev ? ({ ...prev, isSpeakerMuted: !prev.isSpeakerMuted }) : null);
  }, []);

  return (
    <CallContext.Provider value={{
      activeCall,
      localStream,
      remoteStream,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
      formatDuration
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};

export default CallContext;

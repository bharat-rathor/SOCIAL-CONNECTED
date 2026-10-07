import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUserContext } from './UserContext';
import { getData } from '../utils/localStorage';
import { DEMO_USERS } from '../data/users';
import { apiSendMessage } from '../utils/api';

const PeerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setOnlinePeerUserIds, upsertUser, users } = useUserContext();

  const [peerId, setPeerId] = useState(null);
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle' | 'connecting' | 'connected' | 'error'
  const [connectedPeers, setConnectedPeers] = useState([]); // array of { userId, user, peerId, connectedAt }
  const [typingUsers, setTypingUsers] = useState({}); // { [userId]: boolean }
  const [incomingMessage, setIncomingMessage] = useState(null); // { message, sender }

  const peerRef = useRef(null);
  const connectionsRef = useRef({}); // { [userId]: conn }
  const currentUserIdRef = useRef(currentUser?.id);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserIdRef.current = currentUser?.id;
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Connect to local Vite WebSocket engine for seamless multi-device Wi-Fi sync
  useEffect(() => {
    if (!import.meta.hot) return;

    if (currentUser?.id) {
      import.meta.hot.send('social:auth', { userId: currentUser.id });
    }

    const unbindPresence = import.meta.hot.on('social:presence', (data) => {
      if (data?.onlineUserIds) {
        console.log('🟢 [Server WS] Real-time presence update:', data.onlineUserIds);
        setOnlinePeerUserIds(data.onlineUserIds);
      }
    });

    const unbindNewMessage = import.meta.hot.on('social:new-message', (data) => {
      if (data?.message) {
        console.log('💬 [Server WS] New real-time message received:', data.message);
        setIncomingMessage({
          message: data.message,
          sender: { id: data.message.senderId }
        });
      }
    });

    const unbindTyping = import.meta.hot.on('social:typing', (data) => {
      if (data && String(data.receiverId) === String(currentUser?.id)) {
        setTypingUsers(prev => ({
          ...prev,
          [data.senderId]: !!data.isTyping
        }));
      }
    });

    const unbindUserRegistered = import.meta.hot.on('social:user-registered', (data) => {
      if (data?.user) {
        console.log('✨ [Server WS] Another device registered user:', data.user.name);
        upsertUser(data.user);
      }
    });

    const unbindUserUpdated = import.meta.hot.on('social:user-updated', (data) => {
      if (data?.user) {
        upsertUser(data.user);
      }
    });

    return () => {
      if (unbindPresence) unbindPresence();
      if (unbindNewMessage) unbindNewMessage();
      if (unbindTyping) unbindTyping();
      if (unbindUserRegistered) unbindUserRegistered();
      if (unbindUserUpdated) unbindUserUpdated();
    };
  }, [currentUser?.id, setOnlinePeerUserIds, upsertUser]);

  // Helper to extract custom created users (excluding standard demo users)
  const getCustomUsers = useCallback(() => {
    const all = getData('users', []);
    return all.filter(u => !DEMO_USERS.some(d => d.id === u.id));
  }, []);

  // Update online user IDs in UserContext whenever connectedPeers changes
  const updateOnlinePeers = useCallback(() => {
    const activeIds = Object.keys(connectionsRef.current)
      .filter(k => connectionsRef.current[k]?.open)
      .map(k => isNaN(Number(k)) ? k : Number(k));
    setOnlinePeerUserIds(activeIds);
    setConnectedPeers(prev => prev.filter(p => activeIds.some(id => String(id) === String(p.userId))));
  }, [setOnlinePeerUserIds]);

  // Setup event listeners on a data connection
  const setupConnection = useCallback((conn, targetUserId = null) => {
    if (!conn) return;

    conn.on('open', () => {
      console.log('📡 [P2P] Connection opened with:', conn.peer);
      // Send Handshake with our profile and custom users
      conn.send({
        type: 'HANDSHAKE',
        user: currentUserRef.current,
        customUsers: getCustomUsers(),
        timestamp: Date.now()
      });
      setConnectionStatus('connected');
    });

    conn.on('data', (data) => {
      if (!data || !data.type) return;

      if (data.type === 'HANDSHAKE' || data.type === 'HANDSHAKE_ACK') {
        const remoteUser = data.user;
        if (remoteUser?.id) {
          console.log('🤝 [P2P] Handshake received from:', remoteUser.name, remoteUser.id);
          connectionsRef.current[remoteUser.id] = conn;

          // Save remote user profile locally so both laptops share the account
          upsertUser({ ...remoteUser, online: true });

          // Also save any custom accounts the other laptop shared
          if (Array.isArray(data.customUsers)) {
            data.customUsers.forEach(u => upsertUser(u));
          }

          // Add to connected peers state
          setConnectedPeers(prev => {
            const exists = prev.some(p => String(p.userId) === String(remoteUser.id));
            if (exists) return prev;
            return [...prev, {
              userId: remoteUser.id,
              user: remoteUser,
              peerId: conn.peer,
              connectedAt: new Date().toLocaleTimeString()
            }];
          });

          updateOnlinePeers();

          // If it was a handshake, acknowledge back with our info
          if (data.type === 'HANDSHAKE') {
            conn.send({
              type: 'HANDSHAKE_ACK',
              user: currentUserRef.current,
              customUsers: getCustomUsers(),
              timestamp: Date.now()
            });
          }
        }
      } else if (data.type === 'CHAT_MESSAGE') {
        console.log('💬 [P2P] Incoming message:', data.message);
        setIncomingMessage({
          message: data.message,
          sender: data.sender || { id: data.message.senderId }
        });
      } else if (data.type === 'TYPING') {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: !!data.isTyping
        }));
      } else if (data.type === 'SYNC_USERS') {
        if (Array.isArray(data.users)) {
          data.users.forEach(u => upsertUser(u));
        }
      }
    });

    conn.on('close', () => {
      console.log('🔌 [P2P] Connection closed with:', conn.peer);
      // Find which user this connection was
      for (const [uid, c] of Object.entries(connectionsRef.current)) {
        if (c === conn) {
          delete connectionsRef.current[uid];
          break;
        }
      }
      updateOnlinePeers();
    });

    conn.on('error', (err) => {
      console.warn('⚠️ [P2P] Connection error:', err);
      for (const [uid, c] of Object.entries(connectionsRef.current)) {
        if (c === conn) {
          delete connectionsRef.current[uid];
          break;
        }
      }
      updateOnlinePeers();
    });
  }, [getCustomUsers, upsertUser, updateOnlinePeers]);

  // Initialize PeerJS when user is logged in
  useEffect(() => {
    if (!currentUser?.id) {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setIsPeerReady(false);
      setPeerId(null);
      setConnectedPeers([]);
      setOnlinePeerUserIds([]);
      connectionsRef.current = {};
      return;
    }

    const PeerClass = window.Peer;
    if (!PeerClass) {
      console.warn('PeerJS library not loaded on window.');
      return;
    }

    const myDesiredId = `sc-u-${currentUser.id}`;

    // Create Peer with Google and Twilio public STUN servers for reliable NAT traversal
    const peer = new PeerClass(myDesiredId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('🚀 [P2P] Peer initialized with ID:', id);
      setPeerId(id);
      setIsPeerReady(true);
      setConnectionStatus('idle');
    });

    peer.on('connection', (conn) => {
      console.log('📥 [P2P] Incoming connection from:', conn.peer);
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.warn('⚠️ [P2P] PeerJS error:', err.type, err);
      if (err.type === 'unavailable-id') {
        // ID is temporarily in use (e.g. quick browser reload); recreate with session suffix
        console.log('🔄 Re-attempting Peer connection with fallback ID...');
        const fallbackId = `sc-u-${currentUser.id}-${Math.floor(Math.random() * 1000)}`;
        const fallbackPeer = new PeerClass(fallbackId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });
        peerRef.current = fallbackPeer;
        fallbackPeer.on('open', (fid) => {
          setPeerId(fid);
          setIsPeerReady(true);
        });
        fallbackPeer.on('connection', (conn) => setupConnection(conn));
      }
    });

    return () => {
      peer.destroy();
      peerRef.current = null;
      setIsPeerReady(false);
      connectionsRef.current = {};
    };
  }, [currentUser?.id, setupConnection]);

  // Connect to a user by User ID
  const connectToUser = useCallback((targetUserId) => {
    if (!peerRef.current || !targetUserId || !currentUser) return null;
    const uidStr = String(targetUserId);

    // If already open
    const existing = connectionsRef.current[uidStr] || connectionsRef.current[Number(targetUserId)];
    if (existing && existing.open) {
      return existing;
    }

    const targetPeerId = `sc-u-${targetUserId}`;
    console.log('📤 [P2P] Connecting to user:', targetUserId, 'at Peer ID:', targetPeerId);
    setConnectionStatus('connecting');

    try {
      const conn = peerRef.current.connect(targetPeerId, {
        reliable: true,
        metadata: { senderUser: currentUser }
      });
      connectionsRef.current[uidStr] = conn;
      setupConnection(conn, targetUserId);
      return conn;
    } catch (err) {
      console.error('Failed to initiate P2P connect:', err);
      setConnectionStatus('error');
      return null;
    }
  }, [currentUser, setupConnection]);

  // Connect directly by pairing code or peer ID
  const pairWithPeer = useCallback((codeOrPeerId) => {
    if (!peerRef.current || !codeOrPeerId) return false;
    const clean = String(codeOrPeerId).trim();
    const targetPeerId = clean.startsWith('sc-u-') ? clean : `sc-u-${clean}`;

    console.log('🔗 [P2P] Pairing with Peer ID:', targetPeerId);
    setConnectionStatus('connecting');

    try {
      const conn = peerRef.current.connect(targetPeerId, {
        reliable: true,
        metadata: { senderUser: currentUser }
      });
      setupConnection(conn);
      return true;
    } catch (err) {
      console.error('Failed to pair with peer:', err);
      setConnectionStatus('error');
      return false;
    }
  }, [currentUser, setupConnection]);

  // Send real-time chat message over WebRTC & Server WebSocket
  const sendRealtimeMessage = useCallback((receiverId, messageObj) => {
    if (!receiverId || !messageObj) return false;

    // 1. Broadcast via local Server WebSocket & persist via API
    if (import.meta.hot) {
      import.meta.hot.send('social:send-message', { message: messageObj });
    }
    apiSendMessage(messageObj);

    // 2. Also send via direct P2P DataChannel if peer is connected
    const uidStr = String(receiverId);
    let conn = connectionsRef.current[uidStr] || connectionsRef.current[Number(receiverId)];

    if (conn && conn.open) {
      conn.send({
        type: 'CHAT_MESSAGE',
        message: messageObj,
        sender: currentUserRef.current
      });
    }

    return true;
  }, []);

  // Send typing indicator over Server WebSocket & P2P
  const sendTyping = useCallback((receiverId, isTyping) => {
    if (!receiverId) return;

    if (import.meta.hot) {
      import.meta.hot.send('social:typing', {
        senderId: currentUserIdRef.current,
        receiverId,
        isTyping: !!isTyping
      });
    }

    const uidStr = String(receiverId);
    const conn = connectionsRef.current[uidStr] || connectionsRef.current[Number(receiverId)];
    if (conn && conn.open) {
      conn.send({
        type: 'TYPING',
        userId: currentUserIdRef.current,
        isTyping: !!isTyping
      });
    }
  }, []);

  // Sync all custom users across devices
  const syncCustomUsersWithAllPeers = useCallback(() => {
    const customUsers = getCustomUsers();
    Object.values(connectionsRef.current).forEach(conn => {
      if (conn?.open) {
        conn.send({
          type: 'SYNC_USERS',
          users: customUsers
        });
      }
    });
  }, [getCustomUsers]);

  return (
    <PeerContext.Provider value={{
      peerId,
      isPeerReady,
      connectionStatus,
      connectedPeers,
      typingUsers,
      incomingMessage,
      connectToUser,
      pairWithPeer,
      sendRealtimeMessage,
      sendTyping,
      syncCustomUsersWithAllPeers,
      myPairCode: currentUser?.id ? String(currentUser.id) : null
    }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => {
  const ctx = useContext(PeerContext);
  if (!ctx) {
    return {
      peerId: null,
      isPeerReady: false,
      connectionStatus: 'idle',
      connectedPeers: [],
      typingUsers: {},
      incomingMessage: null,
      connectToUser: () => null,
      pairWithPeer: () => false,
      sendRealtimeMessage: () => false,
      sendTyping: () => {},
      syncCustomUsersWithAllPeers: () => {},
      myPairCode: null
    };
  }
  return ctx;
};

export default PeerContext;

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getData, setData } from '../utils/localStorage';
import { DEMO_MESSAGES, getStarterMessagesForUser } from '../data/messages';
import { chatReducer, initialChatState, CHAT_ACTIONS } from '../reducers/chatReducer';
import { useAuth } from './AuthContext';
import { usePeer } from './PeerContext';
import { generateId } from '../utils/dateUtils';
import { fetchMessages, apiMarkAsRead } from '../utils/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { sendRealtimeMessage, incomingMessage } = usePeer();
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  // Listen for real-time incoming messages from second laptop
  useEffect(() => {
    if (incomingMessage?.message) {
      dispatch({
        type: CHAT_ACTIONS.RECEIVE_MESSAGE,
        payload: incomingMessage.message
      });
    }
  }, [incomingMessage]);

  // Load messages from server or localStorage on mount / user change
  useEffect(() => {
    async function loadMessages() {
      const serverMsgs = await fetchMessages();
      let stored = serverMsgs && Array.isArray(serverMsgs) && serverMsgs.length > 0
        ? serverMsgs
        : getData('messages', []);

      const targetUserId = currentUser?.id || 1;
      const hasActiveConvos = stored.some(
        (m) => m.senderId === targetUserId || m.receiverId === targetUserId
      );

      if (!hasActiveConvos) {
        const starterMessages = getStarterMessagesForUser(targetUserId);
        stored = [...stored, ...starterMessages];
        setData('messages', stored);
      }

      dispatch({ type: CHAT_ACTIONS.INIT, payload: stored });
    }
    loadMessages();
  }, [currentUser?.id]);

  // Persist messages to localStorage whenever state changes
  useEffect(() => {
    if (state.messages.length > 0) {
      setData('messages', state.messages);
    }
  }, [state.messages]);

  const sendMessage = useCallback((receiverId, message = '', image = null) => {
    if (!currentUser || (!message?.trim() && !image)) return;
    const newMsg = {
      id: generateId('msg'),
      senderId: currentUser.id,
      receiverId: isNaN(Number(receiverId)) ? receiverId : Number(receiverId),
      message: (message || '').trim(),
      image: image || null,
      timestamp: new Date().toISOString(),
      status: 'sent',
      seen: false,
    };
    dispatch({
      type: CHAT_ACTIONS.SEND_MESSAGE,
      payload: { customMessage: newMsg }
    });
    // Simulate delivery after a short delay (frontend-only)
    setTimeout(() => {
      dispatch({
        type: CHAT_ACTIONS.MARK_AS_DELIVERED,
        payload: { senderId: currentUser.id, receiverId: isNaN(Number(receiverId)) ? receiverId : Number(receiverId) }
      });
    }, 600);
    if (sendRealtimeMessage) {
      sendRealtimeMessage(receiverId, newMsg);
    }
    return newMsg;
  }, [currentUser, sendRealtimeMessage]);

  const markAsRead = useCallback((partnerId) => {
    if (!currentUser) return;
    dispatch({
      type: CHAT_ACTIONS.MARK_AS_READ,
      payload: { userId: currentUser.id, partnerId }
    });
    apiMarkAsRead(currentUser.id, partnerId);
  }, [currentUser]);

  const deleteMessage = useCallback((messageId) => {
    dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: { messageId } });
  }, []);

  const clearChat = useCallback((partnerId) => {
    if (!currentUser) return;
    dispatch({
      type: CHAT_ACTIONS.CLEAR_CHAT,
      payload: { userId: currentUser.id, partnerId }
    });
  }, [currentUser]);

  // Get conversation between current user and a partner
  const getConversation = useCallback((partnerId) => {
    if (!currentUser) return [];
    return state.messages.filter(m =>
      (m.senderId === currentUser.id && m.receiverId === partnerId) ||
      (m.senderId === partnerId && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [state.messages, currentUser]);

  // Count unread messages from a specific partner
  const getUnreadCount = useCallback((partnerId) => {
    if (!currentUser) return 0;
    return state.messages.filter(
      m => m.senderId === partnerId && m.receiverId === currentUser.id && !m.seen
    ).length;
  }, [state.messages, currentUser]);

  // Total unread messages
  const totalUnread = useCallback(() => {
    if (!currentUser) return 0;
    return state.messages.filter(
      m => m.receiverId === currentUser.id && !m.seen
    ).length;
  }, [state.messages, currentUser]);

  // Get all conversation partners (for chat list)
  const getConversationPartners = useCallback(() => {
    if (!currentUser) return [];
    const partnerSet = new Set();
    state.messages.forEach(m => {
      if (m.senderId === currentUser.id) partnerSet.add(m.receiverId);
      if (m.receiverId === currentUser.id) partnerSet.add(m.senderId);
    });
    return Array.from(partnerSet);
  }, [state.messages, currentUser]);

  // Get last message in conversation
  const getLastMessage = useCallback((partnerId) => {
    const convo = getConversation(partnerId);
    return convo[convo.length - 1] || null;
  }, [getConversation]);

  return (
    <ChatContext.Provider value={{
      messages: state.messages,
      sendMessage,
      markAsRead,
      deleteMessage,
      clearChat,
      getConversation,
      getUnreadCount,
      totalUnread,
      getConversationPartners,
      getLastMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};

export default ChatContext;

// ============================================================
// Chat Reducer — state transitions for chat system
// Supports: sent / delivered / seen status lifecycle
// ============================================================
import { generateId } from '../utils/dateUtils';

export const CHAT_ACTIONS = {
  INIT: 'INIT',
  SEND_MESSAGE: 'SEND_MESSAGE',
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
  MARK_AS_DELIVERED: 'MARK_AS_DELIVERED',
  MARK_AS_READ: 'MARK_AS_READ',      // sets status = 'seen'
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  CLEAR_CHAT: 'CLEAR_CHAT',
};

export const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.INIT:
      return { ...state, messages: action.payload };

    case CHAT_ACTIONS.SEND_MESSAGE: {
      const { senderId, receiverId, message, image, customMessage } = action.payload;
      const newMsg = customMessage || {
        id: generateId('msg'),
        senderId,
        receiverId,
        message: message || '',
        image: image || null,
        timestamp: new Date().toISOString(),
        status: 'sent',  // sent → delivered → seen
        seen: false,
      };
      // Prevent duplicates
      if (state.messages.some(m => m.id === newMsg.id)) return state;
      // Immediately mark as delivered (frontend simulation: receiver has access to data)
      const msgWithDelivered = { ...newMsg, status: newMsg.status || 'sent' };
      return { ...state, messages: [...state.messages, msgWithDelivered] };
    }

    case CHAT_ACTIONS.RECEIVE_MESSAGE: {
      const incoming = action.payload;
      if (!incoming || !incoming.id) return state;
      if (state.messages.some(m => m.id === incoming.id)) return state;
      // Mark incoming as delivered upon receipt
      return {
        ...state,
        messages: [...state.messages, { ...incoming, status: 'delivered', seen: false }]
      };
    }

    case CHAT_ACTIONS.MARK_AS_DELIVERED: {
      // Mark all sent messages to a specific receiver as delivered
      const { senderId, receiverId } = action.payload;
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.senderId === senderId && msg.receiverId === receiverId && msg.status === 'sent'
            ? { ...msg, status: 'delivered' }
            : msg
        )
      };
    }

    case CHAT_ACTIONS.MARK_AS_READ: {
      const { userId, partnerId } = action.payload;
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.senderId === partnerId && msg.receiverId === userId
            ? { ...msg, seen: true, status: 'seen' }
            : msg
        )
      };
    }

    case CHAT_ACTIONS.DELETE_MESSAGE: {
      return {
        ...state,
        messages: state.messages.filter(m => m.id !== action.payload.messageId)
      };
    }

    case CHAT_ACTIONS.CLEAR_CHAT: {
      const { userId, partnerId } = action.payload;
      return {
        ...state,
        messages: state.messages.filter(m =>
          !((m.senderId === userId && m.receiverId === partnerId) ||
            (m.senderId === partnerId && m.receiverId === userId))
        )
      };
    }

    default:
      return state;
  }
};

export const initialChatState = { messages: [] };

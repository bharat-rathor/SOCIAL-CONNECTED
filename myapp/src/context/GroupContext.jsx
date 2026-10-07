import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getData, setData } from '../utils/localStorage';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/dateUtils';

const GroupContext = createContext(null);

// ── Actions ────────────────────────────────────────────────────
const ACTIONS = {
  INIT: 'INIT',
  CREATE_GROUP: 'CREATE_GROUP',
  RENAME_GROUP: 'RENAME_GROUP',
  SEND_GROUP_MESSAGE: 'SEND_GROUP_MESSAGE',
  MARK_GROUP_MESSAGE_SEEN: 'MARK_GROUP_MESSAGE_SEEN',
  INVITE_MEMBER: 'INVITE_MEMBER',
  CANCEL_INVITATION: 'CANCEL_INVITATION',
  ACCEPT_INVITATION: 'ACCEPT_INVITATION',
  DECLINE_INVITATION: 'DECLINE_INVITATION',
  JOIN_GROUP: 'JOIN_GROUP',
  LEAVE_GROUP: 'LEAVE_GROUP',
  MAKE_ADMIN: 'MAKE_ADMIN',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  // Admin Approval Join Request Actions
  REQUEST_TO_JOIN: 'REQUEST_TO_JOIN',
  CANCEL_JOIN_REQUEST: 'CANCEL_JOIN_REQUEST',
  ACCEPT_JOIN_REQUEST: 'ACCEPT_JOIN_REQUEST',
  DECLINE_JOIN_REQUEST: 'DECLINE_JOIN_REQUEST',
};

// ── Reducer ────────────────────────────────────────────────────
const groupReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.INIT:
      return {
        groups: action.payload.groups || [],
        messages: action.payload.messages || [],
        invitations: action.payload.invitations || [],
        joinRequests: action.payload.joinRequests || [],
      };

    case ACTIONS.CREATE_GROUP: {
      const groups = [action.payload, ...state.groups];
      return { ...state, groups };
    }

    case ACTIONS.RENAME_GROUP: {
      const groups = state.groups.map(g =>
        g.id === action.payload.groupId ? { ...g, name: action.payload.name } : g
      );
      return { ...state, groups };
    }

    case ACTIONS.SEND_GROUP_MESSAGE: {
      if (state.messages.some(m => m.id === action.payload.id)) return state;
      return { ...state, messages: [...state.messages, action.payload] };
    }

    case ACTIONS.MARK_GROUP_MESSAGE_SEEN: {
      const { groupId, userId } = action.payload;
      const messages = state.messages.map(m => {
        if (m.groupId !== groupId || m.senderId === userId) return m;
        if ((m.seenBy || []).includes(userId)) return m;
        return { ...m, seenBy: [...(m.seenBy || []), userId] };
      });
      return { ...state, messages };
    }

    case ACTIONS.INVITE_MEMBER: {
      if (state.invitations.some(i => i.id === action.payload.id)) return state;
      return { ...state, invitations: [action.payload, ...state.invitations] };
    }

    case ACTIONS.CANCEL_INVITATION: {
      const { groupId, targetUserId } = action.payload;
      const invitations = state.invitations.filter(
        i => !(i.groupId === groupId && i.inviteeId === Number(targetUserId) && i.status === 'pending')
      );
      return { ...state, invitations };
    }

    case ACTIONS.ACCEPT_INVITATION: {
      const { invitationId, groupId, userId } = action.payload;
      const invitations = state.invitations.map(i =>
        i.id === invitationId ? { ...i, status: 'accepted' } : i
      );
      const groups = state.groups.map(g => {
        if (g.id !== groupId) return g;
        if ((g.members || []).includes(userId)) return g;
        return { ...g, members: [...(g.members || []), userId] };
      });
      return { ...state, invitations, groups };
    }

    case ACTIONS.DECLINE_INVITATION: {
      const invitations = state.invitations.map(i =>
        i.id === action.payload.invitationId ? { ...i, status: 'declined' } : i
      );
      return { ...state, invitations };
    }

    case ACTIONS.JOIN_GROUP: {
      const { groupId, userId } = action.payload;
      const groups = state.groups.map(g => {
        if (g.id !== groupId) return g;
        if ((g.members || []).includes(userId)) return g;
        return { ...g, members: [...(g.members || []), userId] };
      });
      return { ...state, groups };
    }

    case ACTIONS.REQUEST_TO_JOIN: {
      const existing = state.joinRequests.find(
        r => r.groupId === action.payload.groupId && r.userId === action.payload.userId && r.status === 'pending'
      );
      if (existing) return state;
      const filtered = state.joinRequests.filter(
        r => !(r.groupId === action.payload.groupId && r.userId === action.payload.userId)
      );
      return { ...state, joinRequests: [action.payload, ...filtered] };
    }

    case ACTIONS.CANCEL_JOIN_REQUEST: {
      const { groupId, userId } = action.payload;
      const joinRequests = state.joinRequests.filter(
        r => !(r.groupId === groupId && r.userId === userId && r.status === 'pending')
      );
      return { ...state, joinRequests };
    }

    case ACTIONS.ACCEPT_JOIN_REQUEST: {
      const { requestId, groupId, userId } = action.payload;
      const joinRequests = state.joinRequests.map(r =>
        r.id === requestId ? { ...r, status: 'accepted' } : r
      );
      const groups = state.groups.map(g => {
        if (g.id !== groupId) return g;
        if ((g.members || []).includes(userId)) return g;
        return { ...g, members: [...(g.members || []), userId] };
      });
      return { ...state, joinRequests, groups };
    }

    case ACTIONS.DECLINE_JOIN_REQUEST: {
      const { requestId } = action.payload;
      const joinRequests = state.joinRequests.map(r =>
        r.id === requestId ? { ...r, status: 'declined' } : r
      );
      return { ...state, joinRequests };
    }

    case ACTIONS.LEAVE_GROUP: {
      const { groupId, userId } = action.payload;
      const groups = state.groups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: (g.members || []).filter(id => id !== userId),
          admins: (g.admins || []).filter(id => id !== userId),
        };
      });
      return { ...state, groups };
    }

    case ACTIONS.MAKE_ADMIN: {
      const { groupId, userId } = action.payload;
      const groups = state.groups.map(g => {
        if (g.id !== groupId) return g;
        if ((g.admins || []).includes(userId)) return g;
        return { ...g, admins: [...(g.admins || []), userId] };
      });
      return { ...state, groups };
    }

    case ACTIONS.REMOVE_MEMBER: {
      const { groupId, userId } = action.payload;
      const groups = state.groups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          members: (g.members || []).filter(id => id !== userId),
          admins: (g.admins || []).filter(id => id !== userId),
        };
      });
      return { ...state, groups };
    }

    default:
      return state;
  }
};

// ── Default demo groups ────────────────────────────────────────
const DEFAULT_GROUPS = [
  {
    id: 'grp_tech_club',
    name: 'Tech & AI Innovators',
    description: 'Discussing React 18, Vite, AI agents, and emerging web technologies.',
    category: 'Technology',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    adminId: 1, // Rahul Mehta
    admins: [1],
    members: [1, 2, 3],
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'grp_creative_arts',
    name: 'Ahmedabad Photographers & Artists',
    description: 'Weekly photo walks, street photography, and portfolio feedback.',
    category: 'Creative',
    avatar: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
    adminId: 2, // Priya Sharma
    admins: [2],
    members: [2, 1],
    createdAt: '2026-10-02T11:00:00.000Z'
  },
  {
    id: 'grp_weekend_trekkers',
    name: 'Gujarat Adventure Trekkers',
    description: 'Polo Forest, Girnar, and Saputara weekend expedition plans.',
    category: 'Adventure',
    avatar: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=300&q=80',
    adminId: 3, // Amit Patel
    admins: [3],
    members: [3, 2],
    createdAt: '2026-10-03T12:00:00.000Z'
  }
];

const DEFAULT_GROUP_MESSAGES = [
  {
    id: 'gmsg_001',
    groupId: 'grp_tech_club',
    senderId: 1,
    senderName: 'Rahul Mehta',
    senderImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    message: 'Welcome everyone to the Tech & AI Innovators group! 🚀',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    seenBy: [1, 2, 3]
  },
  {
    id: 'gmsg_002',
    groupId: 'grp_tech_club',
    senderId: 2,
    senderName: 'Priya Sharma',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    message: 'Excited to be here! The new UI looks super clean.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    seenBy: [1, 2]
  },
  {
    id: 'gmsg_003',
    groupId: 'grp_creative_arts',
    senderId: 2,
    senderName: 'Priya Sharma',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    message: 'Who is up for a sunset photography session this Sunday?',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    seenBy: [2, 1]
  }
];

// ── Provider ───────────────────────────────────────────────────
export const GroupProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [state, dispatch] = useReducer(groupReducer, {
    groups: [],
    messages: [],
    invitations: [],
    joinRequests: [],
  });

  // Load from localStorage on mount
  useEffect(() => {
    const groups = getData('groups', null);
    const messages = getData('groupMessages', null);
    const invitations = getData('groupInvitations', null);
    const joinRequests = getData('groupJoinRequests', null);

    dispatch({
      type: ACTIONS.INIT,
      payload: {
        groups: groups && Array.isArray(groups) && groups.length > 0 ? groups : DEFAULT_GROUPS,
        messages: messages && Array.isArray(messages) ? messages : DEFAULT_GROUP_MESSAGES,
        invitations: invitations && Array.isArray(invitations) ? invitations : [],
        joinRequests: joinRequests && Array.isArray(joinRequests) ? joinRequests : [],
      }
    });

    // Seed defaults on first run
    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      setData('groups', DEFAULT_GROUPS);
      setData('groupMessages', DEFAULT_GROUP_MESSAGES);
    }
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (state.groups.length > 0) setData('groups', state.groups);
  }, [state.groups]);

  useEffect(() => {
    if (state.messages.length > 0) setData('groupMessages', state.messages);
  }, [state.messages]);

  useEffect(() => {
    setData('groupInvitations', state.invitations);
  }, [state.invitations]);

  useEffect(() => {
    setData('groupJoinRequests', state.joinRequests);
  }, [state.joinRequests]);

  // ── createGroup ────────────────────────────────────────────
  const createGroup = useCallback(({ name, description = '', category = 'General', avatar = null }) => {
    if (!currentUser || !name?.trim()) return null;
    const newGroup = {
      id: generateId('grp'),
      name: name.trim(),
      description: description.trim(),
      category,
      avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
      adminId: currentUser.id,
      admins: [currentUser.id],
      members: [currentUser.id],
      createdAt: new Date().toISOString()
    };
    dispatch({ type: ACTIONS.CREATE_GROUP, payload: newGroup });
    return newGroup;
  }, [currentUser]);

  // ── renameGroup ────────────────────────────────────────────
  const renameGroup = useCallback((groupId, name) => {
    if (!name?.trim()) return false;
    dispatch({ type: ACTIONS.RENAME_GROUP, payload: { groupId, name: name.trim() } });
    return true;
  }, []);

  // ── sendGroupMessage ───────────────────────────────────────
  const sendGroupMessage = useCallback((groupId, text = '', image = null) => {
    if (!currentUser || (!text?.trim() && !image)) return null;
    const newMsg = {
      id: generateId('gmsg'),
      groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderImage: currentUser.image,
      message: (text || '').trim(),
      image: image || null,
      timestamp: new Date().toISOString(),
      seenBy: [currentUser.id],
    };
    dispatch({ type: ACTIONS.SEND_GROUP_MESSAGE, payload: newMsg });
    return newMsg;
  }, [currentUser]);

  // ── markGroupMessagesSeen ──────────────────────────────────
  const markGroupMessagesSeen = useCallback((groupId) => {
    if (!currentUser || !groupId) return;
    dispatch({
      type: ACTIONS.MARK_GROUP_MESSAGE_SEEN,
      payload: { groupId, userId: currentUser.id }
    });
  }, [currentUser]);

  // ── inviteMember ───────────────────────────────────────────
  const inviteMember = useCallback((groupId, targetUserId) => {
    if (!currentUser) return false;
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return false;

    // Check if target is already a member
    if ((group.members || []).includes(Number(targetUserId))) return false;

    // Check if already invited
    const existing = state.invitations.find(
      i => i.groupId === groupId && i.inviteeId === Number(targetUserId) && i.status === 'pending'
    );
    if (existing) return false;

    const newInv = {
      id: generateId('ginv'),
      groupId,
      groupName: group.name,
      groupAvatar: group.avatar,
      inviterId: currentUser.id,
      inviterName: currentUser.name,
      inviteeId: Number(targetUserId),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    dispatch({ type: ACTIONS.INVITE_MEMBER, payload: newInv });
    return true;
  }, [currentUser, state.groups, state.invitations]);

  // ── uninviteMember ─────────────────────────────────────────
  const uninviteMember = useCallback((groupId, targetUserId) => {
    dispatch({
      type: ACTIONS.CANCEL_INVITATION,
      payload: { groupId, targetUserId: Number(targetUserId) }
    });
    return true;
  }, []);

  // ── acceptInvitation ──────────────────────────────────────
  const acceptInvitation = useCallback((invitationId) => {
    const inv = state.invitations.find(i => i.id === invitationId);
    if (!inv || !currentUser) return false;
    dispatch({
      type: ACTIONS.ACCEPT_INVITATION,
      payload: { invitationId, groupId: inv.groupId, userId: currentUser.id }
    });
    return true;
  }, [state.invitations, currentUser]);

  // ── declineInvitation ─────────────────────────────────────
  const declineInvitation = useCallback((invitationId) => {
    dispatch({ type: ACTIONS.DECLINE_INVITATION, payload: { invitationId } });
  }, []);

  // ── Admin-Approval Join Request System ─────────────────────
  // Non-members MUST request permission from admin to join!
  const requestToJoin = useCallback((groupId, note = '') => {
    if (!currentUser) return { success: false, error: 'Please log in to join groups' };
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return { success: false, error: 'Group not found' };
    
    if ((group.members || []).includes(currentUser.id)) {
      return { success: false, error: 'You are already a member of this group' };
    }

    const existingPending = state.joinRequests.find(
      r => r.groupId === groupId && r.userId === currentUser.id && r.status === 'pending'
    );
    if (existingPending) {
      return { success: false, error: 'Your request is already pending admin review' };
    }

    const newReq = {
      id: generateId('greq'),
      groupId,
      groupName: group.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.image,
      userBio: currentUser.bio || currentUser.city || 'Social Connect Member',
      note: note.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    dispatch({ type: ACTIONS.REQUEST_TO_JOIN, payload: newReq });
    return { success: true, request: newReq };
  }, [currentUser, state.groups, state.joinRequests]);

  const cancelJoinRequest = useCallback((groupId) => {
    if (!currentUser) return false;
    dispatch({
      type: ACTIONS.CANCEL_JOIN_REQUEST,
      payload: { groupId, userId: currentUser.id }
    });
    return true;
  }, [currentUser]);

  const acceptJoinRequest = useCallback((requestId) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const req = state.joinRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const group = state.groups.find(g => g.id === req.groupId);
    if (!group) return { success: false, error: 'Group not found' };

    const isAdmin = (group.admins || []).includes(currentUser.id) || group.adminId === currentUser.id;
    if (!isAdmin) {
      return { success: false, error: 'Only group admins can approve join requests' };
    }

    dispatch({
      type: ACTIONS.ACCEPT_JOIN_REQUEST,
      payload: { requestId, groupId: req.groupId, userId: req.userId }
    });

    // Automatically post system welcome notification in the group feed
    const systemMsg = {
      id: generateId('gmsg'),
      groupId: req.groupId,
      senderId: 0,
      senderName: 'System',
      senderImage: null,
      message: `🎉 ${req.userName} was approved by Admin (${currentUser.name}) and joined the group!`,
      timestamp: new Date().toISOString(),
      seenBy: [currentUser.id, req.userId],
      isSystem: true
    };
    dispatch({ type: ACTIONS.SEND_GROUP_MESSAGE, payload: systemMsg });

    return { success: true, user: req, group };
  }, [currentUser, state.joinRequests, state.groups]);

  const declineJoinRequest = useCallback((requestId) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const req = state.joinRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const group = state.groups.find(g => g.id === req.groupId);
    if (!group) return { success: false, error: 'Group not found' };

    const isAdmin = (group.admins || []).includes(currentUser.id) || group.adminId === currentUser.id;
    if (!isAdmin) {
      return { success: false, error: 'Only group admins can decline join requests' };
    }

    dispatch({
      type: ACTIONS.DECLINE_JOIN_REQUEST,
      payload: { requestId }
    });
    return { success: true, user: req, group };
  }, [currentUser, state.joinRequests, state.groups]);

  // Legacy direct joinGroup fallback (now safely routes through requestToJoin for non-admins)
  const joinGroup = useCallback((groupId) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return { success: false, error: 'Group not found' };

    const isAdmin = (group.admins || []).includes(currentUser.id) || group.adminId === currentUser.id;
    if (isAdmin) {
      dispatch({ type: ACTIONS.JOIN_GROUP, payload: { groupId, userId: currentUser.id } });
      return { success: true, directlyJoined: true };
    }
    // Regular users must request admin permission!
    return requestToJoin(groupId);
  }, [currentUser, state.groups, requestToJoin]);

  // ── leaveGroup ────────────────────────────────────────────
  const leaveGroup = useCallback((groupId) => {
    if (!currentUser) return { success: false, error: '' };
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return { success: false, error: 'Group not found' };

    const isAdmin = (group.admins || []).includes(currentUser.id);
    const adminCount = (group.admins || []).length;
    const memberCount = (group.members || []).length;

    // Prevent last admin from leaving if there are other members
    if (isAdmin && adminCount === 1 && memberCount > 1) {
      return {
        success: false,
        error: 'You are the only admin. Make another member an admin before leaving.'
      };
    }
    dispatch({ type: ACTIONS.LEAVE_GROUP, payload: { groupId, userId: currentUser.id } });
    return { success: true };
  }, [currentUser, state.groups]);

  // ── makeAdmin ─────────────────────────────────────────────
  const makeAdmin = useCallback((groupId, userId) => {
    dispatch({ type: ACTIONS.MAKE_ADMIN, payload: { groupId, userId: Number(userId) } });
  }, []);

  // ── removeMember ──────────────────────────────────────────
  const removeMember = useCallback((groupId, userId) => {
    dispatch({ type: ACTIONS.REMOVE_MEMBER, payload: { groupId, userId: Number(userId) } });
  }, []);

  // ── Selectors ─────────────────────────────────────────────
  const getGroupById = useCallback((groupId) =>
    state.groups.find(g => g.id === groupId) || null,
    [state.groups]
  );

  const getGroupMessages = useCallback((groupId) =>
    state.messages
      .filter(m => m.groupId === groupId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [state.messages]
  );

  const getMyGroups = useCallback(() => {
    if (!currentUser) return [];
    return state.groups.filter(g => g.members && g.members.includes(currentUser.id));
  }, [state.groups, currentUser]);

  const getPendingInvitations = useCallback(() => {
    if (!currentUser) return [];
    return state.invitations.filter(
      i => i.inviteeId === currentUser.id && i.status === 'pending'
    );
  }, [state.invitations, currentUser]);

  // Get pending join requests for a specific group (for Admins)
  const getGroupJoinRequests = useCallback((groupId) => {
    return state.joinRequests.filter(
      r => r.groupId === groupId && r.status === 'pending'
    );
  }, [state.joinRequests]);

  // Check if current user has a pending join request for a group
  const getUserJoinRequest = useCallback((groupId, userId = currentUser?.id) => {
    if (!userId) return null;
    return state.joinRequests.find(
      r => r.groupId === groupId && r.userId === userId && r.status === 'pending'
    ) || null;
  }, [state.joinRequests, currentUser]);

  // Total pending requests across all groups where currentUser is admin
  const getAdminTotalPendingRequests = useCallback(() => {
    if (!currentUser) return 0;
    const adminGroupIds = state.groups
      .filter(g => (g.admins || []).includes(currentUser.id) || g.adminId === currentUser.id)
      .map(g => g.id);
    return state.joinRequests.filter(
      r => adminGroupIds.includes(r.groupId) && r.status === 'pending'
    ).length;
  }, [currentUser, state.groups, state.joinRequests]);

  // Group unread count
  const getGroupUnreadCount = useCallback((groupId) => {
    if (!currentUser) return 0;
    return state.messages.filter(m =>
      m.groupId === groupId &&
      m.senderId !== currentUser.id &&
      !(m.seenBy || []).includes(currentUser.id)
    ).length;
  }, [state.messages, currentUser]);

  // Legacy respondToInvitation compatibility
  const respondToInvitation = useCallback((invitationId, accept) => {
    if (accept) acceptInvitation(invitationId);
    else declineInvitation(invitationId);
  }, [acceptInvitation, declineInvitation]);

  const inviteToGroup = useCallback((groupId, targetUserId) => {
    return inviteMember(groupId, targetUserId);
  }, [inviteMember]);

  return (
    <GroupContext.Provider value={{
      groups: state.groups,
      groupMessages: state.messages,
      groupInvitations: state.invitations,
      groupJoinRequests: state.joinRequests,
      // Core CRUD
      createGroup,
      renameGroup,
      sendGroupMessage,
      markGroupMessagesSeen,
      // Member management
      inviteMember,
      uninviteMember,
      inviteToGroup,
      acceptInvitation,
      declineInvitation,
      respondToInvitation,
      joinGroup,
      leaveGroup,
      makeAdmin,
      removeMember,
      // Admin Approval Join Requests API
      requestToJoin,
      cancelJoinRequest,
      acceptJoinRequest,
      declineJoinRequest,
      getGroupJoinRequests,
      getUserJoinRequest,
      getAdminTotalPendingRequests,
      // Queries
      getGroupById,
      getGroupMessages,
      getMyGroups,
      getPendingInvitations,
      getGroupUnreadCount,
    }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup must be used within GroupProvider');
  return ctx;
};

export default GroupContext;

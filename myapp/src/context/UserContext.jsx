import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getData, setData } from '../utils/localStorage';
import { DEMO_USERS } from '../data/users';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/dateUtils';

import { fetchUsers, apiSyncDemoUsers, apiClearDemoUsers } from '../utils/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlinePeerUserIds, setOnlinePeerUserIds] = useState([]);
  const [likedUsers, setLikedUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [profileViews, setProfileViews] = useState([]);
  const [album, setAlbum] = useState([]);

  useEffect(() => {
    async function loadInitialUsers() {
      const serverData = await fetchUsers();
      if (serverData && serverData.users && serverData.users.length > 0) {
        setUsers(serverData.users);
        setData('users', serverData.users);
        if (serverData.onlineUserIds) {
          setOnlinePeerUserIds(serverData.onlineUserIds);
        }
      } else {
        const stored = getData('users', null);
        if (stored && stored.length > 0) {
          const offlineStored = stored.map(u => ({ ...u, online: false }));
          setUsers(offlineStored);
          await apiSyncDemoUsers(offlineStored);
        } else {
          const demoOffline = DEMO_USERS.map(d => ({ ...d, online: false }));
          setUsers(demoOffline);
          setData('users', demoOffline);
          await apiSyncDemoUsers(demoOffline);
        }
      }
    }
    loadInitialUsers();
  }, [currentUser?.id]);

  // NOTE: The currentUser profile sync effect is placed AFTER upsertUser is defined below.

  const isUserOnline = useCallback((id) => {
    if (!id) return false;
    if (currentUser && (currentUser.id === Number(id) || String(currentUser.id) === String(id))) return true;
    return onlinePeerUserIds.some(pid => Number(pid) === Number(id) || String(pid) === String(id));
  }, [currentUser, onlinePeerUserIds]);

  useEffect(() => {
    if (!currentUser) {
      setAlbum([]);
      return;
    }
    setLikedUsers(getData('likes', null) ?? getData(`likes_${currentUser.id}`, []));
    setFavorites(getData('favorites', null) ?? getData(`favorites_${currentUser.id}`, []));
    setBlockedUsers(getData('blockedUsers', null) ?? getData(`blocked_${currentUser.id}`, []));
    setReports(getData('reports', []));
    setProfileViews(getData('profileViews', null) ?? getData(`views_${currentUser.id}`, []));
    setAlbum(getData(`album_${currentUser.id}`, currentUser.album || []));
  }, [currentUser?.id]);

  const addPhotoToAlbum = (photoDataUrl) => {
    if (!currentUser) return;
    const currentList = getData(`album_${currentUser.id}`, currentUser.album || []);
    const updated = [photoDataUrl, ...currentList];
    setAlbum(updated);
    setData(`album_${currentUser.id}`, updated);

    const allUsers = getData('users', DEMO_USERS);
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? { ...u, album: updated } : u);
    setData('users', updatedUsers);
    setUsers(updatedUsers);

    const savedCurrent = getData('currentUser', null) || getData('current_user', null);
    if (savedCurrent && savedCurrent.id === currentUser.id) {
      const updatedCurr = { ...savedCurrent, album: updated };
      setData('currentUser', updatedCurr);
      setData('current_user', updatedCurr);
    }
    return updated;
  };

  const removePhotoFromAlbum = (photoIndex) => {
    if (!currentUser) return;
    const currentList = getData(`album_${currentUser.id}`, currentUser.album || []);
    const updated = currentList.filter((_, idx) => idx !== photoIndex);
    setAlbum(updated);
    setData(`album_${currentUser.id}`, updated);

    const allUsers = getData('users', DEMO_USERS);
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? { ...u, album: updated } : u);
    setData('users', updatedUsers);
    setUsers(updatedUsers);

    const savedCurrent = getData('currentUser', null) || getData('current_user', null);
    if (savedCurrent && savedCurrent.id === currentUser.id) {
      const updatedCurr = { ...savedCurrent, album: updated };
      setData('currentUser', updatedCurr);
      setData('current_user', updatedCurr);
    }
    return updated;
  };

  const getUserAlbum = (userId) => {
    const targetUser = getUserById(userId);
    if (!targetUser) return [];
    return getData(`album_${userId}`, targetUser.album || []);
  };

  const getUserById = useCallback((id) => {
    const all = getData('users', DEMO_USERS);
    const found = all.find(u => u.id === Number(id) || String(u.id) === String(id));
    if (!found) return null;
    return {
      ...found,
      online: isUserOnline(found.id)
    };
  }, [isUserOnline]);

  const getAllUsers = useCallback(() => {
    const all = getData('users', DEMO_USERS);
    return all.map(u => ({
      ...u,
      online: isUserOnline(u.id)
    }));
  }, [isUserOnline]);

  const upsertUser = useCallback((incomingUser) => {
    if (!incomingUser || !incomingUser.id) return;
    setUsers(prev => {
      const idx = prev.findIndex(
        u => u.id === incomingUser.id || (incomingUser.email && u.email?.toLowerCase() === incomingUser.email?.toLowerCase())
      );
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...incomingUser };
      } else {
        updated = [...prev, incomingUser];
      }
      setData('users', updated);
      return updated;
    });
  }, []);

  // Keep users state in sync whenever currentUser profile updates (placed here so upsertUser is in scope)
  useEffect(() => {
    if (currentUser?.id) {
      upsertUser(currentUser);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const clearDemoUsers = useCallback(async () => {
    await apiClearDemoUsers();
    setUsers(prev => {
      const customOnly = prev.filter(u => !DEMO_USERS.some(d => d.id === u.id));
      setData('users', customOnly);
      return customOnly;
    });
  }, []);

  const restoreDemoUsers = useCallback(async () => {
    const demoOffline = DEMO_USERS.map(d => ({ ...d, online: false }));
    await apiSyncDemoUsers(demoOffline);
    setUsers(prev => {
      const merged = [...demoOffline, ...prev.filter(u => !DEMO_USERS.some(d => d.id === u.id))];
      setData('users', merged);
      return merged;
    });
  }, []);

  // ── Likes ──────────────────────────────────────────────
  const toggleLike = (targetId) => {
    if (!currentUser) return false;
    const isLiked = likedUsers.includes(targetId);
    const updated = isLiked
      ? likedUsers.filter(id => id !== targetId)
      : [...likedUsers, targetId];
    setLikedUsers(updated);
    setData('likes', updated);
    setData(`likes_${currentUser.id}`, updated);
    return !isLiked; // returns new state
  };

  const isLiked = (targetId) => likedUsers.includes(targetId);

  // Who liked the current user
  const getWhoLikedMe = () => {
    const allUsers = getData('users', DEMO_USERS);
    return allUsers.filter(u => {
      if (!currentUser || u.id === currentUser.id) return false;
      const theirLikes = getData(`likes_${u.id}`, []);
      return theirLikes.includes(currentUser.id);
    });
  };

  // ── Favorites ──────────────────────────────────────────
  const toggleFavorite = (targetId) => {
    if (!currentUser) return false;
    const isFav = favorites.includes(targetId);
    const updated = isFav
      ? favorites.filter(id => id !== targetId)
      : [...favorites, targetId];
    setFavorites(updated);
    setData('favorites', updated);
    setData(`favorites_${currentUser.id}`, updated);
    return !isFav;
  };

  const isFavorite = (targetId) => favorites.includes(targetId);

  const getFavoriteUsers = () => {
    const allUsers = getData('users', DEMO_USERS);
    return allUsers.filter(u => favorites.includes(u.id));
  };

  // ── Block ──────────────────────────────────────────────
  const blockUser = (targetId) => {
    if (!currentUser) return;
    const updated = [...new Set([...blockedUsers, targetId])];
    setBlockedUsers(updated);
    setData('blockedUsers', updated);
    setData(`blocked_${currentUser.id}`, updated);
  };

  const unblockUser = (targetId) => {
    if (!currentUser) return;
    const updated = blockedUsers.filter(id => id !== targetId);
    setBlockedUsers(updated);
    setData('blockedUsers', updated);
    setData(`blocked_${currentUser.id}`, updated);
  };

  const isBlocked = (targetId) => blockedUsers.includes(targetId);

  // ── Report ─────────────────────────────────────────────
  const reportUser = (targetId, reason) => {
    const report = {
      id: generateId('rep'),
      reporterId: currentUser?.id,
      reportedUserId: targetId,
      reason,
      timestamp: new Date().toISOString()
    };
    const updated = [...reports, report];
    setReports(updated);
    setData('reports', updated);
  };

  // ── Profile Views ──────────────────────────────────────
  const recordProfileView = (viewedUserId) => {
    if (!currentUser || currentUser.id === viewedUserId) return false;
    // Prevent duplicate within 10 minutes
    const now = new Date();
    const recent = profileViews.find(v =>
      v.viewedUserId === viewedUserId &&
      (now - new Date(v.timestamp)) < 10 * 60 * 1000
    );
    if (recent) return false;

    const view = {
      id: generateId('view'),
      viewerId: currentUser.id,
      viewedUserId,
      timestamp: now.toISOString()
    };
    const updated = [...profileViews, view];
    setProfileViews(updated);
    setData('profileViews', updated);
    setData(`views_${currentUser.id}`, updated);
    return true; // new view recorded
  };

  const getWhoViewedMe = () => {
    const allUsers = getData('users', DEMO_USERS);
    const myViews = getData(`views_me_${currentUser?.id}`, []);
    return myViews.map(v => ({
      ...v,
      viewer: allUsers.find(u => u.id === v.viewerId)
    })).filter(v => v.viewer);
  };

  const enrichedUsers = users.map(u => ({
    ...u,
    online: isUserOnline(u.id)
  }));

  return (
    <UserContext.Provider value={{
      users: enrichedUsers,
      rawUsers: users,
      onlinePeerUserIds,
      setOnlinePeerUserIds,
      isUserOnline,
      upsertUser,
      clearDemoUsers,
      restoreDemoUsers,
      likedUsers,
      favorites,
      blockedUsers,
      reports,
      getUserById,
      getAllUsers,
      toggleLike,
      isLiked,
      getWhoLikedMe,
      toggleFavorite,
      isFavorite,
      getFavoriteUsers,
      blockUser,
      unblockUser,
      isBlocked,
      reportUser,
      recordProfileView,
      getWhoViewedMe,
      album,
      addPhotoToAlbum,
      removePhotoFromAlbum,
      getUserAlbum
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
};

export default UserContext;

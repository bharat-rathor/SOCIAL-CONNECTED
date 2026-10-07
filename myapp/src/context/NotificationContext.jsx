import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/dateUtils';
import { getData, setData } from '../utils/localStorage';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(() =>
    getData('notifications', [])
  );

  // ── Toasts ─────────────────────────────────────────────
  const showToast = useCallback((type, title, message) => {
    const id = generateId('toast');
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── In-App Notifications ───────────────────────────────
  const addNotification = useCallback((type, text, senderId = null, targetRoute = null, recipientId = null) => {
    const targetUserId = recipientId || currentUser?.id;
    const notif = {
      id: generateId('notif'),
      type,
      text,
      senderId,
      recipientId: targetUserId,
      targetRoute,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50); // max 50
      setData('notifications', updated);
      if (currentUser?.id) {
        setData(`notifications_${currentUser.id}`, updated);
      }
      return updated;
    });

    // If targeted to a specific recipient who is not currently logged in, store in their inbox
    if (recipientId && (!currentUser || Number(recipientId) !== Number(currentUser.id))) {
      const recipientList = getData(`notifications_${recipientId}`, []);
      const updatedRecipient = [notif, ...recipientList].slice(0, 50);
      setData(`notifications_${recipientId}`, updatedRecipient);
    }
  }, [currentUser]);

  const markNotifRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setData('notifications', updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setData('notifications', updated);
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setData('notifications', []);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      toasts,
      showToast,
      dismissToast,
      notifications,
      addNotification,
      markNotifRead,
      markAllRead,
      clearNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export default NotificationContext;

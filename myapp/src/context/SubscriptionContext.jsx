import React, { createContext, useContext, useState, useEffect } from 'react';
import { getData, setData } from '../utils/localStorage';
import { useAuth } from './AuthContext';
import { getExpiryDate, isSubscriptionActive } from '../utils/subscription';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { currentUser, updateProfile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      setIsPremium(false);
      return;
    }
    const sub = getData('subscriptions', null) ?? getData('subscription', null) ?? getData(`subscription_${currentUser.id}`, null);
    setSubscription(sub);
    // Check expiry
    if (sub && !isSubscriptionActive(sub)) {
      // Expired — revoke premium
      const expired = { ...sub, status: 'expired' };
      setData('subscriptions', expired);
      setData('subscription', expired);
      setData(`subscription_${currentUser.id}`, expired);
      setSubscription(expired);
      setIsPremium(false);
      if (currentUser.isPremium) {
        updateProfile({ isPremium: false });
      }
    } else {
      setIsPremium((currentUser.isPremium || false) && (sub ? isSubscriptionActive(sub) : false));
    }
  }, [currentUser?.id]);

  // Periodic expiry check every 60 seconds
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      const sub = getData('subscriptions', null) ?? getData('subscription', null) ?? getData(`subscription_${currentUser.id}`, null);
      if (sub && !isSubscriptionActive(sub) && sub.status === 'active') {
        const expired = { ...sub, status: 'expired' };
        setData('subscriptions', expired);
        setData('subscription', expired);
        setData(`subscription_${currentUser.id}`, expired);
        setSubscription(expired);
        setIsPremium(false);
        updateProfile({ isPremium: false });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const upgradeToPremium = (planId, price) => {
    if (!currentUser) return;
    const sub = {
      plan: planId,
      price,
      status: 'active',
      startDate: new Date().toISOString(),
      expiryDate: getExpiryDate(planId)
    };
    setData('subscriptions', sub);
    setData('subscription', sub);
    setData(`subscription_${currentUser.id}`, sub);
    setSubscription(sub);
    setIsPremium(true);
    updateProfile({ isPremium: true });
    return sub;
  };

  const cancelSubscription = () => {
    if (!currentUser) return;
    const cancelled = { ...subscription, status: 'cancelled' };
    setData('subscriptions', cancelled);
    setData('subscription', cancelled);
    setData(`subscription_${currentUser.id}`, cancelled);
    setSubscription(cancelled);
    setIsPremium(false);
    updateProfile({ isPremium: false });
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isPremium,
      upgradeToPremium,
      cancelSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};

export default SubscriptionContext;

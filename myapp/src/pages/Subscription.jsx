import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Zap, Shield, ArrowRight, XCircle } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PLANS } from '../data/plans';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import Modal from '../components/common/Modal';

const COMPARISON_FEATURES = [
  { name: 'Browse and discover profiles', free: true, premium: true },
  { name: 'Send likes & bookmark favorites', free: true, premium: true },
  { name: 'Chat with Free members', free: true, premium: true },
  { name: 'Chat with Premium / VIP members', free: false, premium: true },
  { name: 'Exclusive Golden Crown badge', free: false, premium: true },
  { name: 'Priority ranking in search & discovery', free: false, premium: true },
  { name: 'Who Liked Me full access', free: false, premium: true },
  { name: 'Ad-free clean browsing experience', free: false, premium: true },
];

const Subscription = () => {
  const { subscription, isPremium, cancelSubscription } = useSubscription();
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];

  const handleProceedToPayment = () => {
    navigate(`/payment?plan=${selectedPlan.id}`);
  };

  const handleCancelSub = () => {
    cancelSubscription();
    setShowCancelModal(false);
    showToast('info', 'Subscription Cancelled', 'Your premium status has been revoked.');
  };

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 24px)', paddingBottom: 60, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(245,158,11,0.15)',
          color: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          <Crown size={32} />
        </div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '0 0 10px' }}>
          Choose Your Premium Plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: 520, margin: '0 auto' }}>
          Unlock unlimited conversations, VIP badging, and priority visibility in your area.
        </p>
      </div>

      {/* Active Subscription Status Banner */}
      {isPremium && subscription && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(99,102,241,0.1))',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          marginBottom: 36,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-premium">Active Subscription</span>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', textTransform: 'capitalize' }}>
                {subscription.plan} Plan
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Valid until: {new Date(subscription.expiryDate).toLocaleDateString()} at {new Date(subscription.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--error)' }}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="subscription-cards-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        marginBottom: 36
      }}>
        {PLANS.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            selected={selectedPlanId === plan.id}
            onSelect={(id) => setSelectedPlanId(id)}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <button
          className="btn btn-gold btn-lg"
          onClick={handleProceedToPayment}
          style={{ minWidth: 260, fontSize: 'var(--text-base)' }}
        >
          <Crown size={18} />
          <span>Continue with {selectedPlan.name} (₹{selectedPlan.price})</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Feature Comparison Table */}
      <div className="card" style={{ padding: 'clamp(16px, 3vw, 32px)', overflowX: 'auto' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
          Free vs Premium Comparison
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>FEATURE</th>
              <th style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-muted)' }}>FREE</th>
              <th style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--gold)' }}>PREMIUM</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((feat, idx) => (
              <tr key={feat.name} style={{ borderBottom: idx < COMPARISON_FEATURES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {feat.name}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  {feat.free ? (
                    <Check size={18} style={{ color: 'var(--success)', margin: '0 auto' }} />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <Check size={18} style={{ color: 'var(--gold)', margin: '0 auto' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Premium Subscription?"
        subtitle="You will lose access to premium messaging benefits"
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to cancel your Premium subscription? You can reactivate anytime.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Subscription</button>
          <button className="btn btn-error" onClick={handleCancelSub}>Confirm Cancellation</button>
        </div>
      </Modal>
    </div>
  );
};

export default Subscription;

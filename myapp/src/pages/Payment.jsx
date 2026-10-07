import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, ShieldCheck, Lock, CheckCircle2, Crown,
  ArrowLeft, Smartphone, Building, AlertCircle, Sparkles
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useNotification } from '../context/NotificationContext';
import { PLANS } from '../data/plans';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan') || 'monthly';
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];

  const { upgradeToPremium } = useSubscription();
  const { showToast, addNotification } = useNotification();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Format card number with spaces (#### #### #### ####)
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Format expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handlePay = (e) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardHolder.trim()) {
        setError('Please enter the cardholder name.');
        return;
      }
      if (expiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cvv.length < 3) {
        setError('Please enter a valid 3-digit CVV.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., username@okhdfcbank).');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate realistic payment processing
    setTimeout(() => {
      try {
        upgradeToPremium(plan.id, plan.price);
        setIsProcessing(false);
        setIsSuccess(true);
        showToast('success', 'Payment Successful!', `Welcome to Premium! You have activated the ${plan.name} plan.`);
        addNotification('subscription', `Your ${plan.name} subscription has been activated!`, null, '/subscription');
      } catch (err) {
        setIsProcessing(false);
        setError('Payment failed. Please try again.');
      }
    }, 1800);
  };

  if (isSuccess) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: 60, maxWidth: 540 }}>
        <div className="card" style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 44px)' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8 }}>
            Payment Successful!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 24 }}>
            Congratulations! Your account has been upgraded to <strong>Premium ({plan.name})</strong>. Enjoy unlimited messaging and VIP status.
          </p>

          <div style={{
            background: 'var(--surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            marginBottom: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crown size={20} style={{ color: 'var(--gold)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{plan.name} Plan Active</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration: {plan.durationLabel}</div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              ₹{plan.price}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/discover')}>
              Start Discovering
            </button>
            <button className="btn btn-secondary btn-block btn-lg" onClick={() => navigate('/home')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 20px)', paddingBottom: 60, maxWidth: 840 }}>
      <button
        onClick={() => navigate('/subscription')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <ArrowLeft size={16} /> Back to Plans
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'flex-start' }}>
        {/* Payment Form */}
        <div className="card" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
              Checkout
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-muted)' }}>
              <Lock size={13} style={{ color: 'var(--success)' }} />
              <span>256-Bit Encrypted</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
            {[
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'netbanking', label: 'NetBank', icon: Building },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setPaymentMethod(id); setError(''); }}
                className={`btn btn-sm ${paymentMethod === id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', gap: 4, padding: '10px 4px', height: 'auto' }}
              >
                <Icon size={18} />
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handlePay}>
            {paymentMethod === 'card' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="pay-cardnum">Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="pay-cardnum"
                      type="text"
                      className="form-input"
                      placeholder="4532 8920 1234 5678"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      required
                    />
                    <CreditCard size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pay-holder">Cardholder Name</label>
                  <input
                    id="pay-holder"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Mehta"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-expiry">Expiry Date</label>
                    <input
                      id="pay-expiry"
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-cvv">CVV</label>
                    <input
                      id="pay-cvv"
                      type="password"
                      className="form-input"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div className="form-group">
                <label className="form-label" htmlFor="pay-upi">UPI ID / VPA</label>
                <input
                  id="pay-upi"
                  type="text"
                  className="form-input"
                  placeholder="name@okhdfcbank or phone@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
                <div style={{ marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  A payment request will be sent to your UPI application.
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="form-group">
                <label className="form-label" htmlFor="pay-bank">Select Your Bank</label>
                <select id="pay-bank" className="form-input" defaultValue="hdfc">
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-gold btn-block btn-lg"
              style={{ marginTop: 20 }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Pay ₹{plan.price} Securely</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Card */}
        <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)', background: 'var(--surface-elevated)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 16 }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                {plan.name} Premium Subscription
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Duration: {plan.durationLabel}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--text-sm)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Base Price</span>
              <span>₹{plan.price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Platform Taxes (GST 0%)</span>
              <span>₹0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-base)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--gold)' }}>₹{plan.price}</span>
            </div>
          </div>

          <div style={{ padding: 12, background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Demo Mock Gateway: No real credit card charge occurs. You can test card payments with any 16 digits.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = login({ email: email.trim(), password });
      showToast('success', 'Welcome Back!', `Signed in as ${user.name}`);
      if (user.isProfileComplete === false) {
        navigate('/create-profile');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
      showToast('error', 'Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header with Glowing Icon */}
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }} aria-label="Home">
            <div className="auth-badge-logo">
              <Users size={26} strokeWidth={2.2} />
            </div>
          </Link>
          <h2>Welcome back</h2>
          <p>Connect with people in your neighborhood and city</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-sm)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="login-email" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 42, height: 46, borderRadius: 'var(--radius-md)' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="login-password" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 42, paddingRight: 42, height: 46, borderRadius: 'var(--radius-md)' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Lock
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: 'var(--text-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            disabled={loading}
          >
            <LogIn size={19} />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Fast Logins for Testing & Viva */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quick Demo Accounts (1-Click)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => fillDemoAccount('rahul@demo.com', 'demo123')}
              style={{ borderRadius: 'var(--radius-md)', fontWeight: 600 }}
            >
              <Zap size={14} /> Rahul (Free)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-gold"
              onClick={() => fillDemoAccount('priya@demo.com', 'demo123')}
              style={{ borderRadius: 'var(--radius-md)', fontWeight: 600 }}
            >
              <Sparkles size={14} /> Priya (Premium)
            </button>
          </div>
        </div>

        {/* Security / Community Trust Badges */}
        <div className="auth-trust-badges">
          <div className="auth-trust-item">
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>100% Private</span>
          </div>
          <div className="auth-trust-item">
            <Sparkles size={14} style={{ color: 'var(--gold)' }} />
            <span>Verified Profiles</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="auth-footer" style={{ marginTop: 20, textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

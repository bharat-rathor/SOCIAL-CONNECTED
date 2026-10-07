import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Compass, MessageSquare, Crown, Heart, Shield, Zap, ArrowRight, Star, Check } from 'lucide-react';

const Landing = () => (
  <div style={{ paddingTop: 'var(--navbar-height)' }}>
    {/* Hero */}
    <section className="landing-hero">
      <div className="landing-hero-content">
        <h1>Discover Real Connections Around You</h1>
        <p>Social Connect helps you find people who share your passions, your city, and your vibe. Smart discovery. Genuine conversations.</p>
        <div className="landing-hero-btns">
          <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-lg btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
            Login
          </Link>
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['1200+', 'Members'], ['18', 'Cities'], ['95%', 'Satisfaction']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{val}</div>
              <div style={{ fontSize: 'var(--text-xs)', opacity: 0.75 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="landing-section" style={{ background: 'var(--surface)' }}>
      <div className="landing-section-inner">
        <h2 className="landing-section-title">Everything you need to connect</h2>
        <p className="landing-section-sub">A complete social discovery platform designed for real people seeking real connections.</p>
        <div className="features-grid">
          {[
            { icon: Compass, title: 'Smart Discovery', desc: 'Find people near you with advanced filters for age, interests, location and more.' },
            { icon: MessageSquare, title: 'Instant Messaging', desc: 'Start conversations instantly. Real-time-like chat with message history and read receipts.' },
            { icon: Heart, title: 'Likes & Favorites', desc: 'Like profiles, add to favorites, and see who has liked you back.' },
            { icon: Crown, title: 'Premium Perks', desc: 'Upgrade for unlimited chat access, premium badge, and priority visibility.' },
            { icon: Shield, title: 'Safe & Private', desc: 'Control your privacy settings, block users, and stay in control of your experience.' },
            { icon: Zap, title: 'Instant Notifications', desc: 'Get notified about likes, messages, and profile visits in real time.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon"><Icon size={22} /></div>
              <div className="feature-title">{title}</div>
              <div className="feature-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it Works */}
    <section className="landing-section">
      <div className="landing-section-inner">
        <h2 className="landing-section-title">How it works</h2>
        <p className="landing-section-sub">Getting started takes less than 2 minutes.</p>
        <div className="steps-grid">
          {[
            { n: '1', title: 'Create Account', desc: 'Sign up for free with your name and email.' },
            { n: '2', title: 'Build Profile', desc: 'Add your photo, bio, and interests.' },
            { n: '3', title: 'Discover People', desc: 'Browse profiles with smart filters.' },
            { n: '4', title: 'Start Connecting', desc: 'Like, message, and build connections.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="step-card">
              <div className="step-number">{n}</div>
              <div className="step-title">{title}</div>
              <div className="step-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Premium */}
    <section className="landing-section" style={{ background: 'var(--surface)' }}>
      <div className="landing-section-inner">
        <h2 className="landing-section-title">Go Premium</h2>
        <p className="landing-section-sub">Unlock full platform access and stand out from the crowd.</p>
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', borderRadius: 'var(--radius-2xl)', padding: 32, color: 'white', textAlign: 'center' }}>
          <Crown size={40} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 8 }}>Premium Membership</h3>
          <p style={{ opacity: 0.85, marginBottom: 20 }}>Starting at just ₹250/week</p>
          <ul style={{ listStyle: 'none', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['Chat with all users including Premium members', 'Exclusive Premium badge on your profile', 'Advanced discovery filters', 'Priority placement in search results', 'See who liked and viewed your profile'].map(f => (
              <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)', opacity: 0.9 }}>
                <Check size={14} style={{ flexShrink: 0 }} /> {f}
              </li>
            ))}
          </ul>
          <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', width: '100%', justifyContent: 'center', fontWeight: 700 }}>
            Try Premium <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="landing-cta">
      <h2>Ready to find your people?</h2>
      <p>Join thousands of people already connecting on Social Connect.</p>
      <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex' }}>
        Create Free Account <ArrowRight size={18} />
      </Link>
    </section>

    {/* Footer */}
    <footer className="landing-footer">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={14} style={{ color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, color: 'white', fontSize: 'var(--text-lg)' }}>Social Connect</span>
        </div>
        <p>© 2026 Social Connect. A college mini-project. Demo only — no real data.</p>
      </div>
    </footer>
  </div>
);

export default Landing;

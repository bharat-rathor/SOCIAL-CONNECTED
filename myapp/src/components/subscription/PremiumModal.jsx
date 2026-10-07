import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import { Crown, Zap, MessageSquare } from 'lucide-react';

const PremiumModal = ({ isOpen, onClose, targetUser }) => {
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Premium Required"
      subtitle={`Upgrade to chat with ${targetUser?.name || 'Premium users'}`}
    >
      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <div style={{ width: 64, height: 64, background: 'var(--accent-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--gold)' }}>
          <Crown size={28} />
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
          Free users can only chat with other free members.
          Upgrade to <strong>Premium</strong> to unlock conversations with all users.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            { icon: MessageSquare, text: 'Chat with all users including Premium' },
            { icon: Crown, text: 'Get a Premium badge on your profile' },
            { icon: Zap, text: 'Priority placement in discovery' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <Icon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              {text}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-full" onClick={onClose}>Maybe Later</button>
        <button
          className="btn btn-gold btn-full"
          onClick={() => { onClose(); navigate('/subscription'); }}
        >
          <Crown size={15} /> View Plans
        </button>
      </div>
    </Modal>
  );
};

export default PremiumModal;

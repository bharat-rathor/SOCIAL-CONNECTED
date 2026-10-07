import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useSubscription } from '../context/SubscriptionContext';
import ChatWindow from '../components/chat/ChatWindow';
import PremiumModal from '../components/subscription/PremiumModal';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getUserById } = useUserContext();
  const { isPremium } = useSubscription();

  const [partner, setPartner] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (userId) {
      const found = getUserById(userId);
      setPartner(found);

      // Free user restriction check
      if (found && found.isPremium && !isPremium) {
        setShowPremiumModal(true);
      }
    }
  }, [userId, getUserById, isPremium]);

  if (!partner) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', textAlign: 'center' }}>
        <h2>User Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Could not find conversation partner.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/messages')}>
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="chat-fullscreen-page" style={{ paddingTop: 'var(--navbar-height)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 900, width: '100%', margin: '0 auto', background: 'var(--surface-elevated)' }}>
        <ChatWindow partner={partner} isMobile={true} />
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          navigate(-1);
        }}
        targetUser={partner}
      />
    </div>
  );
};

export default Chat;

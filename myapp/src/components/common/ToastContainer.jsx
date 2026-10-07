import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const Toast = ({ toast }) => {
  const { dismissToast } = useNotification();
  const [removing, setRemoving] = useState(false);
  const Icon = ICONS[toast.type] || Info;

  const handleDismiss = () => {
    setRemoving(true);
    setTimeout(() => dismissToast(toast.id), 250);
  };

  return (
    <div className={`toast ${toast.type} ${removing ? 'removing' : ''}`} role="alert" aria-live="polite">
      <div className="toast-left-bar" />
      <div className="toast-icon">
        <Icon size={16} />
      </div>
      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button className="toast-close" onClick={handleDismiss} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useNotification();
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(toast => <Toast key={toast.id} toast={toast} />)}
    </div>
  );
};

export default ToastContainer;

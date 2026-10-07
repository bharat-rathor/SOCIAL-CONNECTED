import React from 'react';

const PageLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        padding: '32px 16px',
        gap: '16px'
      }}
      aria-label="Loading page..."
      role="status"
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.75s linear infinite'
        }}
      />
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
        Loading...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;

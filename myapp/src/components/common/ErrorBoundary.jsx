import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: 16
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 440, marginBottom: 24 }}>
            An unexpected error occurred while rendering this page. You can reload or return to the home page.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={this.handleReload}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
            <a
              href="/home"
              className="btn btn-secondary"
            >
              Go to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

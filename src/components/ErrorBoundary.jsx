import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#F5F0E8',
          padding: '20px',
          textAlign: 'center',
          fontFamily: "'Georgia', serif"
        }}>
          <h2 style={{ color: '#1B2A4A', marginBottom: '12px' }}>⚠️ Something went wrong</h2>
          <p style={{ color: '#5D4E37', marginBottom: '8px', fontSize: '0.9rem' }}>
            The 3D library encountered an error.
          </p>
          <p style={{ color: '#8B7355', marginBottom: '20px', fontSize: '0.8rem', maxWidth: '300px', wordBreak: 'break-word' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.hash = '#/classic';
            }}
            style={{
              padding: '12px 24px',
              background: '#B8922A',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Georgia', serif"
            }}
          >
            Go to Classic View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
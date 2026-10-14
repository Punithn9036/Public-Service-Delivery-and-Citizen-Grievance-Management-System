import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { autoPruneStorage } from '../utils/safeStorage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isQuotaError: false };
  }

  static getDerivedStateFromError(error) {
    const isQuota = error && (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      String(error).toLowerCase().includes('quota') ||
      error.code === 22 ||
      error.code === 1014
    );
    return { hasError: true, error, isQuotaError: isQuota };
  }

  componentDidCatch(error, errorInfo) {
    console.error("JanSeva Application Error Caught by Boundary:", error, errorInfo);
    this.setState({ errorInfo });
    // If it's a quota error, automatically prune bloated storage
    if (this.state.isQuotaError) {
      try {
        autoPruneStorage();
      } catch (e) {}
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleCleanQuotaAndReload = () => {
    try {
      localStorage.removeItem('janseva_grievances');
      localStorage.removeItem('janseva_applications');
      autoPruneStorage();
    } catch (e) {}
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary, #0f172a)',
          color: 'var(--text-primary, #ffffff)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '620px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {this.state.isQuotaError ? 'Browser Storage Quota Exceeded' : 'Something went wrong in the portal'}
            </h2>
            <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              {this.state.isQuotaError 
                ? 'High-resolution photo evidence exceeded your browser’s 5MB localStorage limit. You can safely clean bloated attachments below without losing your account.' 
                : (this.state.error ? this.state.error.toString() : 'The portal encountered an unexpected runtime state.')}
            </p>

            {this.state.errorInfo && (
              <details style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.75rem', color: '#f87171', maxHeight: '180px', overflowY: 'auto' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700 }}>View Error Stack</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '6px' }}>
                  {this.state.error?.stack}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {this.state.isQuotaError && (
                <button
                  onClick={this.handleCleanQuotaAndReload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <CheckCircle2 size={16} />
                  Clean Storage Quota & Recover
                </button>
              )}

              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--brand-700, #2C5745)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <RefreshCw size={16} />
                Reload Portal
              </button>

              <button
                onClick={this.handleResetStorage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <Trash2 size={16} />
                Reset Session & Storage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

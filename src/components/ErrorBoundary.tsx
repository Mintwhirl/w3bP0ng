import { Component, ErrorInfo, ReactNode } from 'react';
import { GlassPanel, GlassButton } from '../ui/GlassHUD';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * Follows W3BP0NG liquid glass synthwave aesthetic.
 */
class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // In a real app, you might log the error to an error reporting service
    // like Sentry or LogRocket here.
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin;
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <GlassPanel variant="elevated" neonAccent="magenta" className="error-panel">
            <h1 className="error-title">SYSTEM CRITICAL ERROR</h1>
            <div className="error-icon">⚠️</div>
            <p className="error-message">
              An unexpected crash has occurred in the neural link.
              The W3BP0NG core has been stabilized.
            </p>
            {this.state.error && (
              <pre className="error-details">
                {this.state.error.message}
              </pre>
            )}
            <div className="error-actions">
              <GlassButton variant="primary" onClick={this.handleReset}>
                REBOOT SYSTEM
              </GlassButton>
            </div>
          </GlassPanel>

          <style>{`
            .error-boundary-fallback {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0b001a;
              color: #ffffff;
              font-family: 'Orbitron', sans-serif;
              padding: 2rem;
              box-sizing: border-box;
            }

            .error-panel {
              max-width: 600px;
              width: 100%;
              text-align: center;
              padding: 3rem !important;
            }

            .error-title {
              color: #ff00ff;
              text-shadow: 0 0 10px #ff00ff;
              margin-bottom: 2rem;
              letter-spacing: 0.2rem;
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 1.5rem;
              animation: blink 1s infinite;
            }

            .error-message {
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 2rem;
              color: rgba(255, 255, 255, 0.9);
            }

            .error-details {
              background: rgba(0, 0, 0, 0.5);
              padding: 1rem;
              border-radius: 4px;
              font-family: monospace;
              font-size: 0.8rem;
              color: #ff6ec4;
              text-align: left;
              margin-bottom: 2rem;
              overflow-x: auto;
              border-left: 3px solid #ff00ff;
            }

            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

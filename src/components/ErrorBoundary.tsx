import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-ink">Something went wrong</h2>
              <p className="text-sm text-ink-muted">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            {this.state.error && import.meta.env.DEV && (
              <details className="text-left rounded-lg bg-rose-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-rose-800">
                  Error Details (dev only)
                </summary>
                <pre className="mt-2 text-xs text-rose-700 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="secondary">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

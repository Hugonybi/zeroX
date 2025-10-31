import React, { Component, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).errorReporting) {
      (window as any).errorReporting.captureException(error, {
        context: 'AdminErrorBoundary',
        errorInfo,
      });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl text-red-600">⚠️</span>
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-semibold text-ink mb-2">
              Admin Panel Error
            </h1>

            {/* Error Message */}
            <p className="text-ink-muted mb-6">
              {this.isPermissionError() 
                ? 'You do not have permission to access this admin feature. Please contact your system administrator.'
                : 'An unexpected error occurred in the admin panel. Our team has been notified.'
              }
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Error Details:</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Stack Trace</summary>
                    <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={this.resetError}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = '/admin'}
                variant="secondary"
                className="w-full"
              >
                Return to Admin Dashboard
              </Button>

              {this.isPermissionError() && (
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="secondary"
                  className="w-full"
                >
                  Return to Home
                </Button>
              )}
            </div>

            {/* Support Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-ink-muted">
                If this problem persists, please contact support with error ID: {this.getErrorId()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private isPermissionError(): boolean {
    if (!this.state.error) return false;
    
    const errorMessage = this.state.error.message.toLowerCase();
    return (
      errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('access denied') ||
      this.state.error.name === 'AdminPermissionError'
    );
  }

  private getErrorId(): string {
    if (!this.state.error) return 'unknown';
    
    // Generate a simple error ID based on error message and timestamp
    const errorString = this.state.error.message + Date.now();
    let hash = 0;
    for (let i = 0; i < errorString.length; i++) {
      const char = errorString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }
}

// Higher-order component for wrapping admin components
export function withAdminErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  customFallback?: (error: Error, resetError: () => void) => ReactNode
) {
  const WrappedComponent = (props: P) => (
    <AdminErrorBoundary fallback={customFallback}>
      <Component {...props} />
    </AdminErrorBoundary>
  );

  WrappedComponent.displayName = `withAdminErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
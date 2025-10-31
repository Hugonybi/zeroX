import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '../../components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorBoundary: string;
}

export class CartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorBoundary: 'cart'
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorBoundary: 'cart'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CartErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // Log cart-specific error details
    console.error('Cart Error Context:', {
      component: errorInfo.componentStack,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearCart = () => {
    // This will be handled by the CartRecoveryActions component
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <CartErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onClearCart={this.handleClearCart}
        />
      );
    }

    return this.props.children;
  }
}

interface CartErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
  onClearCart: () => void;
}

function CartErrorFallback({ error, onReset, onClearCart }: CartErrorFallbackProps) {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-6">
      <div className="max-w-md space-y-6 text-center">
        <div className="space-y-3">
          {/* Cart-specific error icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-600"
            >
              <path
                d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V12M12 16H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900">Cart Error</h2>
          <p className="text-sm text-gray-600">
            We encountered an issue with your shopping cart. Don't worry - your items are safe.
          </p>
        </div>

        {/* Error-specific recovery options */}
        <CartRecoveryActions 
          error={error}
          onReset={onReset}
          onClearCart={onClearCart}
        />

        {/* Development error details */}
        {error && import.meta.env.DEV && (
          <details className="text-left rounded-lg bg-red-50 p-4 border border-red-200">
            <summary className="cursor-pointer text-sm font-semibold text-red-800">
              Error Details (dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-32">
              {error.toString()}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface CartRecoveryActionsProps {
  error: Error | null;
  onReset: () => void;
  onClearCart: () => void;
}

function CartRecoveryActions({ error, onReset, onClearCart }: CartRecoveryActionsProps) {
  // Determine recovery options based on error type
  const getRecoveryOptions = () => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        primary: { label: 'Retry', action: onReset },
        secondary: { label: 'Refresh Page', action: () => window.location.reload() },
        tertiary: { label: 'Clear Cart', action: onClearCart, variant: 'destructive' as const }
      };
    }
    
    if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
      return {
        primary: { label: 'Clear Cart', action: onClearCart },
        secondary: { label: 'Try Again', action: onReset },
        tertiary: { label: 'Go Home', action: () => window.location.href = '/' }
      };
    }
    
    // Default recovery options
    return {
      primary: { label: 'Try Again', action: onReset },
      secondary: { label: 'Clear Cart', action: onClearCart, variant: 'secondary' as const },
      tertiary: { label: 'Go Home', action: () => window.location.href = '/' }
    };
  };

  const { primary, secondary, tertiary } = getRecoveryOptions();

  const primaryVariant = (primary as any).variant ?? 'primary';
  const secondaryVariant = (secondary as any).variant ?? 'secondary';
  const tertiaryVariant = tertiary ? ((tertiary as any).variant ?? 'ghost') : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={primary.action} 
          variant={primaryVariant}
          size="sm"
        >
          {primary.label}
        </Button>
        
        <Button 
          onClick={secondary.action} 
          variant={secondaryVariant}
          size="sm"
        >
          {secondary.label}
        </Button>
      </div>
      
      {tertiary && (
        <Button 
          onClick={tertiary.action} 
          variant={tertiaryVariant}
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          {tertiary.label}
        </Button>
      )}
    </div>
  );
}
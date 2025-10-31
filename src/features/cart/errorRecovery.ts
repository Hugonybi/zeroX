import type { CartError } from '../../types/cart';

export interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'destructive';
  description?: string;
}

export interface ErrorRecoveryOptions {
  onRetry?: () => void | Promise<void>;
  onClearCart?: () => void | Promise<void>;
  onRefreshPage?: () => void;
  onNavigateHome?: () => void;
  onContactSupport?: () => void;
}

export function getCartErrorRecoveryActions(
  error: CartError,
  options: ErrorRecoveryOptions
): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

  switch (error.code) {
    case 'NETWORK_ERROR':
      actions.push({
        label: 'Retry',
        action: options.onRetry || (() => window.location.reload()),
        variant: 'primary',
        description: 'Try the operation again'
      });
      
      actions.push({
        label: 'Refresh Page',
        action: options.onRefreshPage || (() => window.location.reload()),
        variant: 'secondary',
        description: 'Reload the entire page'
      });
      
      if (options.onClearCart) {
        actions.push({
          label: 'Clear Cart',
          action: options.onClearCart,
          variant: 'destructive',
          description: 'Remove all items and start fresh'
        });
      }
      break;

    case 'ARTWORK_UNAVAILABLE':
      if (options.onClearCart) {
        actions.push({
          label: 'Remove Unavailable Items',
          action: options.onClearCart,
          variant: 'primary',
          description: 'Clean up cart by removing unavailable items'
        });
      }
      
      actions.push({
        label: 'Browse Gallery',
        action: options.onNavigateHome || (() => window.location.href = '/'),
        variant: 'secondary',
        description: 'Find other available artworks'
      });
      break;

    case 'VALIDATION_ERROR':
      actions.push({
        label: 'Try Again',
        action: options.onRetry || (() => window.location.reload()),
        variant: 'primary',
        description: 'Retry with corrected information'
      });
      
      if (options.onClearCart) {
        actions.push({
          label: 'Clear Cart',
          action: options.onClearCart,
          variant: 'secondary',
          description: 'Start over with a fresh cart'
        });
      }
      break;

    case 'UNKNOWN_ERROR':
    default:
      actions.push({
        label: 'Try Again',
        action: options.onRetry || (() => window.location.reload()),
        variant: 'primary',
        description: 'Attempt the operation again'
      });
      
      actions.push({
        label: 'Refresh Page',
        action: options.onRefreshPage || (() => window.location.reload()),
        variant: 'secondary',
        description: 'Reload the page completely'
      });
      
      if (options.onContactSupport) {
        actions.push({
          label: 'Contact Support',
          action: options.onContactSupport,
          variant: 'secondary',
          description: 'Get help from our support team'
        });
      }
      break;
  }

  return actions;
}

export function getCartErrorMessage(error: CartError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    
    case 'ARTWORK_UNAVAILABLE':
      return error.artworkId 
        ? 'This artwork is no longer available for purchase.'
        : 'Some items in your cart are no longer available.';
    
    case 'VALIDATION_ERROR':
      return 'There was an issue with your request. Please check your information and try again.';
    
    case 'UNKNOWN_ERROR':
    default:
      return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
}

export function getCartErrorTitle(error: CartError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Connection Error';
    
    case 'ARTWORK_UNAVAILABLE':
      return 'Item Unavailable';
    
    case 'VALIDATION_ERROR':
      return 'Invalid Request';
    
    case 'UNKNOWN_ERROR':
    default:
      return 'Something Went Wrong';
  }
}

// Utility to determine if an error is recoverable
export function isRecoverableError(error: CartError): boolean {
  return ['NETWORK_ERROR', 'VALIDATION_ERROR'].includes(error.code);
}

// Utility to determine if an error requires immediate action
export function requiresImmediateAction(error: CartError): boolean {
  return ['ARTWORK_UNAVAILABLE'].includes(error.code);
}

// Auto-recovery strategies
export class CartErrorRecovery {
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  private onRetry: () => Promise<void>;
  private onGiveUp: (error: CartError) => void;

  constructor(
    onRetry: () => Promise<void>,
    onGiveUp: (error: CartError) => void
  ) {
    this.onRetry = onRetry;
    this.onGiveUp = onGiveUp;
  }

  async attemptRecovery(error: CartError): Promise<boolean> {
    if (!isRecoverableError(error) || this.retryCount >= this.maxRetries) {
      this.onGiveUp(error);
      return false;
    }

    this.retryCount++;
    
    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await this.onRetry();
      this.reset(); // Reset on success
      return true;
    } catch (retryError) {
      return this.attemptRecovery(retryError as CartError);
    }
  }

  reset(): void {
    this.retryCount = 0;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  canRetry(): boolean {
    return this.retryCount < this.maxRetries;
  }
}
import type { PaystackCallbackResponse } from '../types/payment';

// Extend Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, unknown>;
  onClose?: () => void;
  callback?: (response: PaystackCallbackResponse) => void;
}

interface InitializePaystackParams {
  publicKey: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  onError?: (error: Error) => void;
}

/**
 * Initialize and open Paystack payment popup
 */
export function initializePaystack({
  publicKey,
  email,
  amount,
  currency,
  reference,
  metadata,
  onSuccess,
  onClose,
  onError,
}: InitializePaystackParams): void {
  try {
    // Check if Paystack is loaded
    if (!window.PaystackPop) {
      throw new Error('Paystack library not loaded. Please check your internet connection.');
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      currency,
      ref: reference,
      metadata,
      onClose: () => {
        console.log('Payment popup closed');
        onClose();
      },
      callback: (response: PaystackCallbackResponse) => {
        console.log('Payment callback received:', response);
        if (response.status === 'success') {
          onSuccess(response.reference);
        } else {
          onError?.(new Error(response.message || 'Payment failed'));
        }
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error('Paystack initialization error:', error);
    onError?.(error instanceof Error ? error : new Error('Failed to initialize payment'));
  }
}

/**
 * Get Paystack public key from environment or config
 */
export function getPaystackPublicKey(): string {
  // In production, this should come from environment variables
  // For now, we'll use a placeholder that should be configured
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';
  
  if (key === 'pk_test_placeholder') {
    console.warn('Paystack public key not configured. Set VITE_PAYSTACK_PUBLIC_KEY environment variable.');
  }
  
  return key;
}

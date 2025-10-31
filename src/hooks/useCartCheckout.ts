import { useState } from 'react';
import * as cartApi from '../features/cart/api';
import type { CartCheckoutRequest, CartCheckoutResponse, ConsolidatedOrderStatus } from '../types/order';

interface UseCartCheckoutState {
  isLoading: boolean;
  error: string | null;
  data: CartCheckoutResponse | null;
}

interface UseCartCheckoutReturn extends UseCartCheckoutState {
  checkoutCart: (request: CartCheckoutRequest) => Promise<CartCheckoutResponse | null>;
  getCheckoutStatus: (sessionId: string) => Promise<ConsolidatedOrderStatus | null>;
  reset: () => void;
}

export function useCartCheckout(): UseCartCheckoutReturn {
  const [state, setState] = useState<UseCartCheckoutState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const checkoutCart = async (request: CartCheckoutRequest): Promise<CartCheckoutResponse | null> => {
    setState({ isLoading: true, error: null, data: null });
    
    try {
      console.log('[useCartCheckout] Processing cart checkout with:', request);
      const response = await cartApi.checkoutCart(request);
      console.log('[useCartCheckout] Cart checkout successful:', response);
      setState({ isLoading: false, error: null, data: response });
      return response;
    } catch (err) {
      console.error('[useCartCheckout] Cart checkout failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process cart checkout';
      setState({ isLoading: false, error: errorMessage, data: null });
      return null;
    }
  };

  const getCheckoutStatus = async (sessionId: string): Promise<ConsolidatedOrderStatus | null> => {
    try {
      console.log('[useCartCheckout] Getting checkout status for session:', sessionId);
      const response = await cartApi.getCheckoutStatus(sessionId);
      console.log('[useCartCheckout] Checkout status:', response);
      return response;
    } catch (err) {
      console.error('[useCartCheckout] Failed to get checkout status:', err);
      return null;
    }
  };

  const reset = () => {
    setState({ isLoading: false, error: null, data: null });
  };

  return {
    ...state,
    checkoutCart,
    getCheckoutStatus,
    reset,
  };
}
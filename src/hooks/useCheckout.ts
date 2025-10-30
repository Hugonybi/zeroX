import { useState } from 'react';
import { orderService } from '../lib/orderService';
import type { CheckoutRequest, CheckoutResponse } from '../types/order';

interface UseCheckoutState {
  isLoading: boolean;
  error: string | null;
  data: CheckoutResponse | null;
}

interface UseCheckoutReturn extends UseCheckoutState {
  checkout: (request: CheckoutRequest) => Promise<CheckoutResponse | null>;
  reset: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const [state, setState] = useState<UseCheckoutState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const checkout = async (request: CheckoutRequest): Promise<CheckoutResponse | null> => {
    setState({ isLoading: true, error: null, data: null });
    
    try {
      const response = await orderService.createCheckout(request);
      setState({ isLoading: false, error: null, data: response });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout';
      setState({ isLoading: false, error: errorMessage, data: null });
      return null;
    }
  };

  const reset = () => {
    setState({ isLoading: false, error: null, data: null });
  };

  return {
    ...state,
    checkout,
    reset,
  };
}

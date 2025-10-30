import { useState, useEffect, useRef } from 'react';
import { orderService } from '../lib/orderService';
import type { Order } from '../types/order';

interface UseOrderPollingOptions {
  orderId: string;
  enabled?: boolean;
  interval?: number; // milliseconds
  onStatusChange?: (order: Order) => void;
}

interface UseOrderPollingReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to poll order status at regular intervals
 * Automatically stops polling when order status changes from 'pending' to another status
 */
export function useOrderPolling({
  orderId,
  enabled = true,
  interval = 3000, // 3 seconds default
  onStatusChange,
}: UseOrderPollingOptions): UseOrderPollingReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousStatusRef = useRef<string | null>(null);

  const fetchOrder = async () => {
    try {
      const fetchedOrder = await orderService.getOrder(orderId);
      setOrder(fetchedOrder);
      setError(null);

      // Check if status changed
      if (previousStatusRef.current && previousStatusRef.current !== fetchedOrder.orderStatus) {
        onStatusChange?.(fetchedOrder);
      }
      previousStatusRef.current = fetchedOrder.orderStatus;

      return fetchedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await fetchOrder();
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchOrder();

    // Set up polling interval
    const pollInterval = setInterval(async () => {
      try {
        const currentOrder = await fetchOrder();
        
        // Stop polling if order is no longer in pending/processing state
        if (currentOrder.orderStatus === 'fulfilled' || 
            currentOrder.orderStatus === 'cancelled' ||
            (currentOrder.paymentStatus === 'failed' && currentOrder.orderStatus !== 'processing')) {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling order:', err);
      }
    }, interval);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
    };
  }, [orderId, enabled, interval]);

  return {
    order,
    isLoading,
    error,
    refetch,
  };
}

import { useState, useEffect } from 'react';
import { orderService } from '../lib/orderService';
import type { Order } from '../types/order';

interface UseOrderHistoryReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch order history for the current user
 */
export function useOrderHistory(): UseOrderHistoryReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const fetchedOrders = await orderService.getOrdersByBuyer();
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    isLoading,
    error,
    refetch,
  };
}

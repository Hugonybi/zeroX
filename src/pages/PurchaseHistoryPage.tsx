import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createHttpClient } from '../lib/http';
import { API_BASE_URL } from '../config/api';
import type { Order } from '../types/order';
import { OrderCard } from '../components/OrderCard';
import { OrderCardSkeleton } from '../components/ui/Skeleton';

const httpClient = createHttpClient(API_BASE_URL);

export function PurchaseHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await httpClient.get<Order[]>('/orders/buyer/me');
        setOrders(data);
      } catch (err) {
        console.error('Failed to load purchase history', err);
        setError('Unable to load your purchase history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Purchase History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Purchase History</h1>
        <div className="bg-rose-50 rounded-lg p-6 text-rose-800">
          <p className="font-semibold">Error Loading Orders</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to gallery
        </Link>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Purchase History</h1>
        <div className="bg-stone/10 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">You haven't made any purchases yet.</p>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Browse artworks
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Purchase History</h1>
        <span className="text-sm text-gray-600">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}

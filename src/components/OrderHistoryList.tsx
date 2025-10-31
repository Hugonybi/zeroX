import { OrderCard } from './OrderCard';
import type { Order } from '../types/order';

interface OrderHistoryListProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

export function OrderHistoryList({ orders, isLoading, error }: OrderHistoryListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-mint border-t-transparent"></div>
          <p className="text-sm text-ink-muted">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-800">Error loading orders</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-stone/20 bg-white p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-stone/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h3 className="mt-4 font-brand text-xl uppercase tracking-[0.15em] text-ink">
          No purchases yet
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          Browse the gallery to find your first artwork.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        {orders.length} {orders.length === 1 ? 'purchase' : 'purchases'}
      </p>
      <div className="grid gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

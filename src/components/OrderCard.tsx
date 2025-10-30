import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/Badge';
import type { Order } from '../types/order';

interface OrderCardProps {
  order: Order & {
    artwork?: {
      title: string;
      mediaUrl: string;
      artistName?: string;
    };
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();

  const formatPrice = (cents: number, currency: string): string => {
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
      }).format(cents / 100);
    } catch {
      return `${currency} ${(cents / 100).toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeTone = (status: string): 'success' | 'info' | 'neutral' => {
    if (status === 'fulfilled') return 'success';
    if (status === 'processing' || status === 'created') return 'info';
    return 'neutral';
  };

  const handleClick = () => {
    if (order.orderStatus === 'fulfilled') {
      navigate(`/certificate/${order.id}`);
    } else {
      navigate(`/orders/${order.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full gap-4 rounded-xl border border-stone/20 bg-white p-4 text-left transition-all hover:border-mint hover:shadow-md"
    >
      {/* Artwork Image */}
      {order.artwork?.mediaUrl && (
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-stone/20">
          <img
            src={order.artwork.mediaUrl}
            alt={order.artwork.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Order Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-ink line-clamp-1">
              {order.artwork?.title || 'Artwork'}
            </h3>
            <Badge tone={getStatusBadgeTone(order.orderStatus)}>
              {order.orderStatus}
            </Badge>
          </div>
          {order.artwork?.artistName && (
            <p className="mt-1 text-xs text-ink-muted">by {order.artwork.artistName}</p>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-ink-muted">{formatDate(order.createdAt)}</p>
            <p className="font-semibold text-ink">{formatPrice(order.amountCents, order.currency)}</p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-mint">
            <span>View details</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

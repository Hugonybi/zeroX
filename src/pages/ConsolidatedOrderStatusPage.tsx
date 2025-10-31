import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCartCheckout } from "../hooks/useCartCheckout";
import type { ConsolidatedOrderStatus } from "../types/order";
import { Button } from "../components/ui/Button";
import { ArtworkImage } from "../components/ArtworkImage";

export function ConsolidatedOrderStatusPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getCheckoutStatus } = useCartCheckout();
  const [status, setStatus] = useState<ConsolidatedOrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/gallery');
      return;
    }

    const fetchStatus = async () => {
      try {
        const result = await getCheckoutStatus(sessionId);
        if (result) {
          setStatus(result);
        } else {
          setError('Unable to load order status');
        }
      } catch (err) {
        setError('Failed to load order status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [sessionId, getCheckoutStatus, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="animate-pulse">Loading order status...</div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The requested order could not be found.'}</p>
        <Button onClick={() => navigate('/gallery')}>
          Return to Gallery
        </Button>
      </div>
    );
  }

  const getStatusColor = (overallStatus: string) => {
    switch (overallStatus) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'partial_failure':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusText = (overallStatus: string) => {
    switch (overallStatus) {
      case 'completed':
        return 'All Orders Completed';
      case 'partial_failure':
        return 'Partially Completed';
      case 'failed':
        return 'Orders Failed';
      default:
        return 'Processing';
    }
  };

  const getOrderStatusColor = (paymentStatus: string, orderStatus: string) => {
    if (paymentStatus === 'paid' && orderStatus === 'processing') {
      return 'text-green-600';
    } else if (paymentStatus === 'failed') {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };

  const getOrderStatusText = (paymentStatus: string, orderStatus: string) => {
    if (paymentStatus === 'paid' && orderStatus === 'processing') {
      return 'Paid - Processing';
    } else if (paymentStatus === 'failed') {
      return 'Payment Failed';
    } else {
      return 'Pending Payment';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Status</h1>
        <p className="text-gray-600">Session ID: {sessionId}</p>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Overall Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.overallStatus)}`}>
            {getStatusText(status.overallStatus)}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{status.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{status.successfulOrders}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{status.failedOrders}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {status.overallStatus === 'partial_failure' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Some orders failed to process. Successful orders will proceed normally, 
              and you will only be charged for completed purchases.
            </p>
          </div>
        )}
      </div>

      {/* Individual Orders */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Individual Orders</h2>
        
        {status.orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border p-6">
            <div className="flex gap-4">
              {/* Artwork Image */}
              <div className="w-20 h-20 flex-shrink-0">
                <ArtworkImage
                  src={order.artwork?.mediaUrl || ''}
                  alt={order.artwork?.title || 'Artwork'}
                  aspectRatio="1/1"
                  wrapperClassName="rounded-md"
                  showPlaceholder={true}
                />
              </div>

              {/* Order Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{order.artwork?.title}</h3>
                    <p className="text-sm text-gray-600">by {order.artwork?.artistName}</p>
                    <p className="text-sm text-gray-500">{order.artwork?.type} artwork</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getOrderStatusColor(order.paymentStatus, order.orderStatus)}`}>
                      {getOrderStatusText(order.paymentStatus, order.orderStatus)}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {formatPrice(order.totalCents || order.amountCents, order.currency)}
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="mt-4 flex gap-2">
                  <Link 
                    to={`/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    View Details
                  </Link>
                  {order.paymentStatus === 'paid' && (
                    <Link 
                      to={`/certificates/${order.id}`}
                      className="text-sm text-green-600 hover:text-green-800 underline"
                    >
                      View Certificate
                    </Link>
                  )}
                </div>

                {/* Error Message */}
                {order.error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    Error: {order.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button variant="secondary" onClick={() => navigate('/gallery')}>
          Continue Shopping
        </Button>
        <Button variant="primary" onClick={() => navigate('/profile')}>
          View All Orders
        </Button>
      </div>
    </div>
  );
}

function formatPrice(priceCents: number, currency: string) {
  try {
    const formatter = new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 0 
    });
    return formatter.format((priceCents || 0) / 100);
  } catch (err) {
    return `${currency} ${(priceCents || 0) / 100}`;
  }
}
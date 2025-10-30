import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useOrderPolling } from '../hooks/useOrderPolling';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { orderService } from '../lib/orderService';

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isCompletingPayment, setIsCompletingPayment] = useState(false);

  const { order, isLoading, error } = useOrderPolling({
    orderId: orderId || '',
    enabled: !!orderId,
    onStatusChange: (updatedOrder) => {
      console.log('Order status changed:', updatedOrder.orderStatus);
      
      // Auto-redirect to certificate when fulfilled
      if (updatedOrder.orderStatus === 'fulfilled' && orderId) {
        setTimeout(() => {
          navigate(`/certificate/${orderId}`);
        }, 2000);
      }
    },
  });

  // Handler for demo/test payment completion
  const handleCompleteTestPayment = async () => {
    if (!orderId) return;
    
    setIsCompletingPayment(true);
    try {
      await orderService.testCompleteOrder(orderId);
      console.log('✅ Test payment completed, order will update shortly');
      // The polling hook will automatically detect the status change
    } catch (err) {
      console.error('❌ Failed to complete test payment:', err);
      alert('Failed to complete test payment. Check console for details.');
    } finally {
      setIsCompletingPayment(false);
    }
  };

  if (!orderId) {
    return (
      <div className="space-y-4">
        <h2 className="font-brand text-3xl uppercase tracking-[0.2em]">Order not found</h2>
        <Link to="/" className="text-sm text-mint hover:underline">
          Return to gallery
        </Link>
      </div>
    );
  }

  if (isLoading && !order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-mint border-t-transparent"></div>
          <p className="text-lg text-ink-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">Error loading order</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <Link to="/" className="inline-block text-sm text-mint hover:underline">
          Return to gallery
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <h2 className="font-brand text-3xl uppercase tracking-[0.2em]">Order not found</h2>
        <Link to="/" className="text-sm text-mint hover:underline">
          Return to gallery
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted transition-colors hover:text-ink">
          ← Back to gallery
        </Link>
        <h1 className="font-brand text-4xl uppercase tracking-[0.2em]">Order Status</h1>
      </div>

      <div className="space-y-6 rounded-2xl border border-stone/20 bg-white p-8 shadow-sm">
        {/* Order Status Section */}
        <div className="flex items-center justify-between border-b border-stone/20 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Order Status</p>
            <p className="mt-1 font-semibold text-ink">{getOrderStatusDisplay(order.orderStatus)}</p>
          </div>
          <Badge tone={getOrderStatusTone(order.orderStatus)}>
            {order.orderStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Payment Status Section */}
        <div className="flex items-center justify-between border-b border-stone/20 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Payment Status</p>
            <p className="mt-1 font-semibold text-ink">{getPaymentStatusDisplay(order.paymentStatus)}</p>
          </div>
          <Badge tone={getPaymentStatusTone(order.paymentStatus)}>
            {order.paymentStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Order ID</span>
            <span className="font-mono text-xs text-ink">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Reference</span>
            <span className="font-mono text-xs text-ink">{order.reference}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Amount</span>
            <span className="font-semibold text-ink">
              {formatPrice(order.amountCents, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Created</span>
            <span className="text-ink">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Status-specific actions */}
        <div className="pt-4">
          {order.orderStatus === 'fulfilled' && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate(`/certificate/${orderId}`)}
            >
              View Certificate
            </Button>
          )}

          {order.orderStatus === 'processing' && (
            <div className="rounded-lg bg-mint-soft p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-mint border-t-transparent"></div>
                <div>
                  <p className="text-sm font-semibold text-ink">Processing your order</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    We're creating your authenticity certificate. This usually takes 1-5 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.paymentStatus === 'pending' && order.orderStatus === 'created' && (
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-yellow-800">Payment pending</p>
                <p className="mt-1 text-xs text-yellow-700">
                  Waiting for payment confirmation. This page will update automatically.
                </p>
              </div>
              
              {/* Demo Mode: Allow completing test payments */}
              {order.paymentProvider === 'test' && (
                <div className="rounded-lg border-2 border-dashed border-mint/30 bg-mint-soft p-4">
                  <p className="text-sm font-semibold text-ink mb-2">🧪 Demo Mode</p>
                  <p className="text-xs text-ink-muted mb-3">
                    This is a test order. Click below to simulate payment completion and trigger minting.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCompleteTestPayment}
                    loading={isCompletingPayment}
                    disabled={isCompletingPayment}
                    className="w-full"
                  >
                    {isCompletingPayment ? 'Processing...' : 'Complete Test Payment'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {order.paymentStatus === 'failed' && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Payment failed</p>
              <p className="mt-1 text-xs text-red-700">
                Your payment could not be processed. Please contact support for assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function getOrderStatusDisplay(status: string): string {
  const displays: Record<string, string> = {
    created: 'Order Created',
    processing: 'Processing',
    fulfilled: 'Completed',
    cancelled: 'Cancelled',
  };
  return displays[status] || status;
}

function getPaymentStatusDisplay(status: string): string {
  const displays: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return displays[status] || status;
}

function getOrderStatusTone(status: string): 'success' | 'info' | 'neutral' {
  const tones: Record<string, 'success' | 'info' | 'neutral'> = {
    created: 'info',
    processing: 'info', // Map warning to info since Badge doesn't have warning
    fulfilled: 'success',
    cancelled: 'neutral',
  };
  return tones[status] || 'neutral';
}

function getPaymentStatusTone(status: string): 'success' | 'info' | 'neutral' {
  const tones: Record<string, 'success' | 'info' | 'neutral'> = {
    pending: 'info', // Map warning to info since Badge doesn't have warning
    paid: 'success',
    failed: 'neutral',
    refunded: 'info',
  };
  return tones[status] || 'neutral';
}

function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toLocaleString()}`;
  }
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

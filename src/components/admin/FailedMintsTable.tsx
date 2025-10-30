import { useState, useEffect } from 'react';
import { useAdminContext } from '../../features/admin/AdminContext';
import { useAdminNotifications } from '../../features/admin/AdminNotificationContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MintRetryConfirmDialog } from './MintRetryConfirmDialog';
import { AdminTableLoading } from './AdminLoadingState';
import { getAdminErrorMessage } from '../../features/admin/errors';

interface FailedMintsTableProps {
  onRetrySuccess?: () => void;
}

export function FailedMintsTable({ onRetrySuccess }: FailedMintsTableProps) {
  const { 
    failedMints, 
    isFailedMintsLoading, 
    failedMintsError, 
    fetchFailedMints, 
    retryMinting,
    isLoading: isRetrying 
  } = useAdminContext();
  const { showSuccess, showError } = useAdminNotifications();
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Load failed mints on component mount
  useEffect(() => {
    fetchFailedMints();
  }, [fetchFailedMints]);

  // Handle failed mints error
  useEffect(() => {
    if (failedMintsError) {
      showError(getAdminErrorMessage(failedMintsError), {
        label: 'Retry',
        onClick: fetchFailedMints
      });
    }
  }, [failedMintsError, showError, fetchFailedMints]);

  const handleRetryClick = (order: any) => {
    setSelectedOrder(order);
  };

  const handleConfirmRetry = async () => {
    if (!selectedOrder) return;
    
    try {
      setRetryingOrderId(selectedOrder.id);
      setSelectedOrder(null);
      
      await retryMinting(selectedOrder.id);
      
      showSuccess('Minting retry initiated successfully');
      
      // Call success callback if provided
      onRetrySuccess?.();
      
    } catch (error) {
      console.error('Failed to retry minting:', error);
      showError(getAdminErrorMessage(error as Error));
    } finally {
      setRetryingOrderId(null);
    }
  };

  const handleCancelRetry = () => {
    setSelectedOrder(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeTone = (status: string) => {
    switch (status) {
      case 'mint_failed':
      case 'ownership_mint_failed':
        return 'info' as const;
      default:
        return 'neutral' as const;
    }
  };

  if (isFailedMintsLoading) {
    return <AdminTableLoading />;
  }

  if (!failedMints || failedMints.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-ink-muted mb-2">No failed minting operations</div>
        <p className="text-sm text-ink-muted">All minting operations are processing successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Failed Minting Operations</h3>
        <Button 
          onClick={async () => {
            await fetchFailedMints();
            showSuccess('Failed mints list updated');
          }} 
          variant="secondary" 
          size="sm"
          disabled={isFailedMintsLoading}
        >
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                Order ID
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                Artwork
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                Buyer
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                Failed At
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {failedMints.map((operation) => (
              <tr key={operation.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-3 text-sm">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {operation.id.slice(0, 8)}...
                  </code>
                </td>
                <td className="border border-gray-200 p-3 text-sm">
                  <div>
                    <div className="font-medium">{operation.artwork.title}</div>
                    <div className="text-xs text-ink-muted">
                      Artist ID: {operation.artwork.artistId.slice(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="border border-gray-200 p-3 text-sm">
                  <div>
                    <div className="font-medium">{operation.buyer.name}</div>
                    <div className="text-xs text-ink-muted">{operation.buyer.email}</div>
                  </div>
                </td>
                <td className="border border-gray-200 p-3 text-sm">
                  <Badge tone={getStatusBadgeTone(operation.orderStatus)}>
                    {operation.orderStatus.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="border border-gray-200 p-3 text-sm text-ink-muted">
                  {formatDate(operation.updatedAt)}
                </td>
                <td className="border border-gray-200 p-3 text-sm">
                  <Button
                    onClick={() => handleRetryClick(operation)}
                    size="sm"
                    variant="secondary"
                    disabled={isRetrying || retryingOrderId === operation.id}
                  >
                    {retryingOrderId === operation.id ? 'Retrying...' : 'Retry'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Confirmation Dialog */}
      {selectedOrder && (
        <MintRetryConfirmDialog
          isOpen={!!selectedOrder}
          onConfirm={handleConfirmRetry}
          onCancel={handleCancelRetry}
          isLoading={isRetrying}
          orderDetails={{
            id: selectedOrder.id,
            artworkTitle: selectedOrder.artwork.title,
            buyerName: selectedOrder.buyer.name,
            buyerEmail: selectedOrder.buyer.email,
            orderStatus: selectedOrder.orderStatus,
            failedAt: selectedOrder.updatedAt,
            retryCount: selectedOrder.retryCount || 0
          }}
        />
      )}

    </div>
  );
}
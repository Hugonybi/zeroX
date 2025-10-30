import { AdminConfirmDialog } from './AdminConfirmDialog';

interface MintRetryConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  orderDetails: {
    id: string;
    artworkTitle: string;
    artistName?: string;
    buyerName: string;
    buyerEmail: string;
    orderStatus: string;
    failedAt: string;
    retryCount?: number;
  };
}

export function MintRetryConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  orderDetails
}: MintRetryConfirmDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRetryWarning = () => {
    const retryCount = orderDetails.retryCount || 0;
    if (retryCount >= 3) {
      return 'This order has already been retried multiple times. Consider investigating the underlying issue before retrying again.';
    }
    if (retryCount >= 1) {
      return 'This order has been retried before. The retry will reset the order status and re-queue the minting job.';
    }
    return 'This will reset the order status to processing and re-queue the minting job for blockchain processing.';
  };

  const details = [
    {
      label: 'Order ID',
      value: `${orderDetails.id.slice(0, 8)}...`,
      highlight: true
    },
    {
      label: 'Artwork',
      value: orderDetails.artworkTitle,
      highlight: true
    },
    ...(orderDetails.artistName ? [{
      label: 'Artist',
      value: orderDetails.artistName,
      highlight: false
    }] : []),
    {
      label: 'Buyer',
      value: `${orderDetails.buyerName} (${orderDetails.buyerEmail})`,
      highlight: false
    },
    {
      label: 'Current Status',
      value: orderDetails.orderStatus.replace('_', ' ').toUpperCase(),
      highlight: true
    },
    {
      label: 'Failed At',
      value: formatDate(orderDetails.failedAt),
      highlight: false
    },
    ...(orderDetails.retryCount ? [{
      label: 'Previous Retries',
      value: orderDetails.retryCount.toString(),
      highlight: true
    }] : [])
  ];

  return (
    <AdminConfirmDialog
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
      title="Retry Minting Operation"
      description="This will attempt to re-process the failed minting operation for this order."
      confirmText="Retry Minting"
      cancelText="Cancel"
      variant="warning"
      icon="🔄"
      details={details}
      warningMessage={getRetryWarning()}
    />
  );
}
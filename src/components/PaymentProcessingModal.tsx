interface PaymentProcessingModalProps {
  isOpen: boolean;
  message?: string;
}

export function PaymentProcessingModal({ isOpen, message = "Processing payment..." }: PaymentProcessingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-mint border-t-transparent"></div>
          <p className="text-center text-lg font-semibold text-ink">{message}</p>
          <p className="text-center text-sm text-ink-muted">
            Please do not close this window or navigate away.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Button } from "../ui/Button";

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'warning' | 'danger';
  icon?: string;
  details?: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  warningMessage?: string;
}

export function AdminConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  details = [],
  warningMessage
}: AdminConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          {icon && (
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg} mb-4`}>
              <span className={`text-2xl ${styles.iconColor}`}>{icon}</span>
            </div>
          )}
          <h3 className="text-xl font-semibold text-ink mb-2">
            {title}
          </h3>
          <p className="text-sm text-ink-muted">
            {description}
          </p>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div className="bg-stone/10 rounded-lg p-4 space-y-3">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.35em] text-ink-muted">
                  {detail.label}
                </span>
                <span className={`text-sm ${detail.highlight ? 'font-medium text-ink' : 'text-ink-muted'}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Important Notice
                </p>
                <p className="text-xs text-yellow-700">
                  {warningMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className={`flex-1 ${styles.confirmButton}`}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
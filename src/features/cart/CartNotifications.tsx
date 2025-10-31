import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ToastVariant } from '../../components/ui/Toast';
import type { CartError } from '../../types/cart';

interface CartNotification {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  artworkTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface CartNotificationContextType {
  showSuccess: (message: string, artworkTitle?: string) => void;
  showError: (error: CartError | string, artworkTitle?: string) => void;
  showInfo: (message: string, artworkTitle?: string) => void;
  showActionNotification: (
    message: string, 
    actionLabel: string, 
    onAction: () => void,
    variant?: ToastVariant
  ) => void;
  clearNotifications: () => void;
}

const CartNotificationContext = createContext<CartNotificationContextType | undefined>(undefined);

interface CartNotificationProviderProps {
  children: ReactNode;
}

export function CartNotificationProvider({ children }: CartNotificationProviderProps) {
  const [notifications, setNotifications] = useState<CartNotification[]>([]);

  const addNotification = useCallback((notification: Omit<CartNotification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration || 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, artworkTitle?: string) => {
    const fullMessage = artworkTitle ? `${message}: ${artworkTitle}` : message;
    addNotification({
      message: fullMessage,
      variant: 'success',
      artworkTitle,
    });
  }, [addNotification]);

  const showError = useCallback((error: CartError | string, artworkTitle?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const fullMessage = artworkTitle ? `${errorMessage}: ${artworkTitle}` : errorMessage;
    
    addNotification({
      message: fullMessage,
      variant: 'error',
      duration: 6000, // Longer duration for errors
      artworkTitle,
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, artworkTitle?: string) => {
    const fullMessage = artworkTitle ? `${message}: ${artworkTitle}` : message;
    addNotification({
      message: fullMessage,
      variant: 'info',
      artworkTitle,
    });
  }, [addNotification]);

  const showActionNotification = useCallback((
    message: string,
    actionLabel: string,
    onAction: () => void,
    variant: ToastVariant = 'info'
  ) => {
    addNotification({
      message,
      variant,
      actionLabel,
      onAction,
      duration: 8000, // Longer duration for action notifications
    });
  }, [addNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: CartNotificationContextType = {
    showSuccess,
    showError,
    showInfo,
    showActionNotification,
    clearNotifications,
  };

  return (
    <CartNotificationContext.Provider value={value}>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <CartNotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </CartNotificationContext.Provider>
  );
}

interface CartNotificationToastProps {
  notification: CartNotification;
  onClose: () => void;
}

function CartNotificationToast({ notification, onClose }: CartNotificationToastProps) {
  const handleAction = () => {
    notification.onAction?.();
    onClose();
  };

  return (
    <div className={`
      rounded-lg border shadow-lg p-4 bg-white
      ${notification.variant === 'success' ? 'border-green-200 bg-green-50' : ''}
      ${notification.variant === 'error' ? 'border-red-200 bg-red-50' : ''}
      ${notification.variant === 'info' ? 'border-blue-200 bg-blue-50' : ''}
      animate-slide-in-right
    `}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-5 h-5 mt-0.5
          ${notification.variant === 'success' ? 'text-green-600' : ''}
          ${notification.variant === 'error' ? 'text-red-600' : ''}
          ${notification.variant === 'info' ? 'text-blue-600' : ''}
        `}>
          {notification.variant === 'success' && (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          
          {notification.variant === 'error' && (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          
          {notification.variant === 'info' && (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`
            text-sm font-medium
            ${notification.variant === 'success' ? 'text-green-800' : ''}
            ${notification.variant === 'error' ? 'text-red-800' : ''}
            ${notification.variant === 'info' ? 'text-blue-800' : ''}
          `}>
            {notification.message}
          </p>
          
          {notification.actionLabel && notification.onAction && (
            <button
              onClick={handleAction}
              className={`
                mt-2 text-xs font-medium underline hover:no-underline
                ${notification.variant === 'success' ? 'text-green-700 hover:text-green-800' : ''}
                ${notification.variant === 'error' ? 'text-red-700 hover:text-red-800' : ''}
                ${notification.variant === 'info' ? 'text-blue-700 hover:text-blue-800' : ''}
              `}
            >
              {notification.actionLabel}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors
            ${notification.variant === 'success' ? 'text-green-600 hover:text-green-700' : ''}
            ${notification.variant === 'error' ? 'text-red-600 hover:text-red-700' : ''}
            ${notification.variant === 'info' ? 'text-blue-600 hover:text-blue-700' : ''}
          `}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function useCartNotifications(): CartNotificationContextType {
  const context = useContext(CartNotificationContext);
  if (context === undefined) {
    throw new Error('useCartNotifications must be used within a CartNotificationProvider');
  }
  return context;
}

// Predefined notification messages for common cart operations
export const CartNotificationMessages = {
  // Success messages
  ITEM_ADDED: 'Added to cart',
  ITEM_REMOVED: 'Removed from cart',
  ITEM_UPDATED: 'Cart item updated',
  CART_CLEARED: 'Cart cleared',
  CART_MIGRATED: 'Cart items migrated to your account',
  
  // Error messages
  ITEM_UNAVAILABLE: 'Item is no longer available',
  NETWORK_ERROR: 'Network error. Please check your connection',
  STORAGE_ERROR: 'Storage error. Please try clearing your cart',
  VALIDATION_ERROR: 'Invalid item. Please try again',
  UNKNOWN_ERROR: 'Something went wrong. Please try again',
  
  // Info messages
  CART_EXPIRING: 'Some items in your cart will expire soon',
  CART_EXPIRED: 'Some cart items have expired and were removed',
  GUEST_CART_NOTICE: 'Sign in to save your cart across devices',
} as const;
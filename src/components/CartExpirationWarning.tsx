import { useEffect, useState } from 'react';
import { useCart } from '../features/cart/CartContext';
import { useCartNotifications } from '../features/cart/CartNotifications';
import { Button } from './ui/Button';

interface CartExpirationWarningProps {
  onViewCart?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function CartExpirationWarning({ onViewCart, onDismiss, className = '' }: CartExpirationWarningProps) {
  const { expiringItems, checkExpiringItems } = useCart();
  // call hook for side-effects/registration; not used directly here
  useCartNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Check for expiring items periodically
  useEffect(() => {
    checkExpiringItems();
    
    // Check every 5 minutes
    const interval = setInterval(checkExpiringItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkExpiringItems]);

  // Update time remaining countdown
  useEffect(() => {
    if (expiringItems.length === 0) return;

    const updateTimeRemaining = () => {
      // Assuming items expire 24 hours after being added
      const oldestItem = expiringItems.reduce((oldest, item) => 
        item.addedAt < oldest.addedAt ? item : oldest
      );
      
      const expiryTime = new Date(oldestItem.addedAt).getTime() + (24 * 60 * 60 * 1000);
      const now = Date.now();
      const remaining = expiryTime - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [expiringItems]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleViewCart = () => {
    onViewCart?.();
  };

  // Don't show if dismissed or no expiring items
  if (isDismissed || expiringItems.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 ${className}`}>
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          {/* Warning icon */}
          <div className="flex-shrink-0 w-5 h-5 text-amber-600 mt-0.5">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-amber-800">
              Cart Items Expiring Soon
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} will expire in {timeRemaining}
            </p>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="primary"
                onClick={handleViewCart}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                View Cart
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs text-amber-700 hover:text-amber-800"
              >
                Dismiss
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md text-amber-600 hover:text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing cart expiration warnings
export function useCartExpirationWarning() {
  const { expiringItems } = useCart();
  const [hasShownWarning, setHasShownWarning] = useState(false);
  
  useEffect(() => {
    if (expiringItems.length > 0 && !hasShownWarning) {
      setHasShownWarning(true);
    } else if (expiringItems.length === 0) {
      setHasShownWarning(false);
    }
  }, [expiringItems.length, hasShownWarning]);
  
  return {
    shouldShowWarning: expiringItems.length > 0,
    expiringCount: expiringItems.length,
    resetWarning: () => setHasShownWarning(false),
  };
}
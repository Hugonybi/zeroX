import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { Button } from './ui/Button';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart, totalItems, totalPrice, isLoading, error } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeCurrentX, setSwipeCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeStartX(touch.clientX);
    setSwipeCurrentX(touch.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartX || !isDragging) return;
    
    const touch = e.touches[0];
    setSwipeCurrentX(touch.clientX);
  };

  const handleTouchEnd = () => {
    if (!swipeStartX || !swipeCurrentX || !isDragging) {
      setIsDragging(false);
      setSwipeStartX(null);
      setSwipeCurrentX(null);
      return;
    }

    const swipeDistance = swipeCurrentX - swipeStartX;
    const swipeThreshold = 100; // Minimum distance for swipe to close

    if (swipeDistance > swipeThreshold) {
      onClose();
    }

    setIsDragging(false);
    setSwipeStartX(null);
    setSwipeCurrentX(null);
  };

  // Calculate transform for swipe animation
  const getSwipeTransform = () => {
    if (!isDragging || !swipeStartX || !swipeCurrentX) return 'translateX(0)';
    
    const swipeDistance = Math.max(0, swipeCurrentX - swipeStartX);
    return `translateX(${swipeDistance}px)`;
  };

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const handleRemoveItem = async (artworkId: string) => {
    try {
      await removeFromCart(artworkId);
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  const handleCheckout = () => {
    onClose();
    // Navigation will be handled by the Link component
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
          sm:max-w-sm md:max-w-md
        `}
        style={{
          transform: isOpen 
            ? (isDragging ? getSwipeTransform() : 'translateX(0)')
            : 'translateX(100%)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <h2 id="cart-title" className="text-lg font-semibold text-gray-900">
              Shopping Cart ({totalItems})
            </h2>
            {/* Mobile swipe indicator */}
            <div className="sm:hidden flex items-center text-xs text-gray-400">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-1">Swipe to close</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Loading cart...</span>
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[50vh]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base px-2">
                Discover amazing artworks and add them to your cart to get started.
              </p>
              <Button
                as="a"
                href="/"
                variant="primary"
                size="sm"
                onClick={onClose}
                className="touch-manipulation min-h-[44px]"
              >
                Browse Artworks
              </Button>
              
              {/* Mobile-specific empty state tips */}
              <div className="mt-6 sm:hidden">
                <p className="text-xs text-gray-500 mb-2">💡 Quick tips:</p>
                <ul className="text-xs text-gray-500 space-y-1 text-left">
                  <li>• Tap ❤️ to save items to your wishlist</li>
                  <li>• Swipe right to close this cart</li>
                  <li>• Long press artwork images for quick preview</li>
                </ul>
              </div>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemoveItem(item.artworkId)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {!isLoading && items.length > 0 && (
          <div className="border-t border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </span>
            </div>
            
            <Link
              to="/cart/checkout"
              className="w-full block"
            >
              <Button
                onClick={handleCheckout}
                disabled={items.every(item => !item.isAvailable)}
                className="w-full touch-manipulation min-h-[48px] text-base font-medium"
                size="lg"
              >
                Proceed to Checkout ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </Button>
            </Link>

            {items.some(item => !item.isAvailable) && (
              <p className="text-xs text-gray-600 text-center px-2">
                Some items are no longer available and will be removed during checkout.
              </p>
            )}

            {/* Mobile-specific footer info */}
            <div className="sm:hidden text-center">
              <p className="text-xs text-gray-500">
                💡 Swipe items left to remove them
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Mobile-optimized cart item component with swipe-to-remove
interface CartItemProps {
  item: any; // CartItem type
  onRemove: () => void;
  formatPrice: (price: number) => string;
}

function CartItem({ item, onRemove, formatPrice }: CartItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showRemoveAction, setShowRemoveAction] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeX(0);
    setIsDragging(true);
    
    // Store initial touch position
    if (itemRef.current) {
      itemRef.current.dataset.startX = touch.clientX.toString();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !itemRef.current?.dataset.startX) return;
    
    const touch = e.touches[0];
    const startX = parseFloat(itemRef.current.dataset.startX);
    const currentX = touch.clientX;
    const deltaX = currentX - startX;
    
    // Only allow left swipe (negative values)
    const newSwipeX = Math.min(0, Math.max(-120, deltaX));
    setSwipeX(newSwipeX);
    
    // Show remove action when swiped enough
    setShowRemoveAction(newSwipeX < -60);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeX < -80) {
      // Swipe was far enough, trigger remove
      onRemove();
    } else {
      // Snap back to original position
      setSwipeX(0);
      setShowRemoveAction(false);
    }
    
    if (itemRef.current) {
      delete itemRef.current.dataset.startX;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      {/* Remove action background */}
      <div 
        className={`
          absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center
          transition-opacity duration-200
          ${showRemoveAction ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19ZM10 11V17M14 11V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Cart item content */}
      <div
        ref={itemRef}
        className={`
          flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white
          transition-transform duration-200 ease-out
          ${!item.isAvailable ? 'opacity-60 bg-gray-50' : ''}
          touch-manipulation
        `}
        style={{
          transform: `translateX(${swipeX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Artwork Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={item.artwork.mediaUrl || '/placeholder-artwork.jpg'}
            alt={item.artwork.title}
            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-artwork.jpg';
            }}
          />
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
            {item.artwork.title}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">
            by {item.artwork.artist?.name || 'Unknown Artist'}
          </p>
          
          {item.purchaseOption && (
            <p className="text-xs text-gray-500 capitalize mt-1">
              {item.purchaseOption} version
            </p>
          )}

          <p className="text-sm font-semibold text-gray-900 mt-1 sm:mt-2">
            {formatPrice(item.artwork.priceCents / 100)}
          </p>

          {!item.isAvailable && (
            <p className="text-xs text-red-600 mt-1">
              No longer available
            </p>
          )}
        </div>

        {/* Remove Button - Desktop */}
        <div className="flex-shrink-0 hidden sm:block">
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-600 active:text-red-700 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Remove ${item.artwork.title} from cart`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Mobile swipe indicator */}
        <div className="flex-shrink-0 sm:hidden flex items-center">
          <div className="text-gray-300 text-xs">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 8L8 2L8 6L14 6L14 10L8 10L8 14L2 8Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
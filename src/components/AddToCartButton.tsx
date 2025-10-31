import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { useCartNotifications } from '../features/cart/CartNotifications';
import { useAuth } from '../features/auth/hooks';
import { Button } from './ui/Button';
import type { Artwork } from '../types/artwork';

interface AddToCartButtonProps {
  artwork: Artwork;
  purchaseOption?: 'physical' | 'digital';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function AddToCartButton({
  artwork,
  purchaseOption,
  variant = 'primary',
  size = 'md',
  className = '',
  onSuccess,
  onError,
}: AddToCartButtonProps) {
  const { addToCart, items, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // call hook for side-effects/registration; not used directly here
  useCartNotifications();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if artwork is already in cart
  const isInCart = items.some(item => item.artworkId === artwork.id);

  // Check availability
  const isAvailable = artwork.status === 'published' && 
    (artwork.availableQuantity === undefined || artwork.availableQuantity > 0);

  const handleAddToCart = async () => {
    if (!isAvailable || isInCart || isAdding) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page
      navigate(`/login?redirect=/artworks/${artwork.id}`);
      return;
    }

    setIsAdding(true);
    
    try {
      await addToCart(artwork.id, purchaseOption);
      
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Error notification is already handled in the context
      onError?.(error as Error);
    } finally {
      setIsAdding(false);
    }
  };

  // Determine button state and content
  const getButtonContent = () => {
    if (showSuccess) {
      return (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-green-600"
          >
            <path
              d="M13.5 4.5L6 12L2.5 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Added to Cart!
        </>
      );
    }

    if (isInCart) {
      return (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 4.5L6 12L2.5 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          In Cart
        </>
      );
    }

    if (!isAvailable) {
      return 'Unavailable';
    }

    return (
      <>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 2H3L3.4 4M5 10H12L15 4H3.4M5 10L3.4 4M5 10L3.2 11.8C2.9 12.1 3.1 12.7 3.5 12.7H12M12 10V12.7M7 14.5C7.6 14.5 8 14.9 8 15.5S7.6 16.5 7 16.5 6 16.1 6 15.5 6.4 14.5 7 14.5ZM14 14.5C14.6 14.5 15 14.9 15 15.5S14.6 16.5 14 16.5 13 16.1 13 15.5 13.4 14.5 14 14.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Add to Cart
      </>
    );
  };

  // Determine button variant based on state
  const getButtonVariant = () => {
    if (showSuccess) return 'ghost';
    if (isInCart) return 'secondary';
    if (!isAvailable) return 'ghost';
    return variant;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      className={`
        transition-all duration-200
        ${showSuccess ? 'text-green-600 border-green-600' : ''}
        ${isInCart ? 'cursor-default' : ''}
        ${!isAvailable ? 'cursor-not-allowed opacity-60' : ''}
        ${className}
      `}
      onClick={handleAddToCart}
      disabled={!isAvailable || isInCart || isAdding || cartLoading}
      loading={isAdding}
      aria-label={
        isInCart 
          ? `${artwork.title} is already in cart`
          : !isAvailable
          ? `${artwork.title} is not available`
          : `Add ${artwork.title} to cart`
      }
    >
      {getButtonContent()}
    </Button>
  );
}
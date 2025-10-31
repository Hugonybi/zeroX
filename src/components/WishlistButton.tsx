import { useState } from 'react';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useWishlistNotifications } from '../features/wishlist/WishlistNotifications';
import { Button } from './ui/Button';
import type { Artwork } from '../types/artwork';

interface WishlistButtonProps {
  artwork: Artwork;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function WishlistButton({
  artwork,
  variant = 'ghost',
  size = 'md',
  className = '',
  showLabel = false,
  onSuccess,
  onError,
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();
  // call hook for side-effects/registration; not used directly here
  useWishlistNotifications();
  const [isToggling, setIsToggling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if artwork is in wishlist
  const inWishlist = isInWishlist(artwork.id);

  const handleToggleWishlist = async () => {
    if (isToggling) return;

    setIsToggling(true);
    
    try {
      if (inWishlist) {
        await removeFromWishlist(artwork.id);
      } else {
        await addToWishlist(artwork.id);
      }
      
      // Show success feedback briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      // Error notification is already handled in the context
      onError?.(error as Error);
    } finally {
      setIsToggling(false);
    }
  };

  // Heart icon - filled when in wishlist, outlined when not
  const HeartIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={inWishlist ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-200 ${
        inWishlist 
          ? 'text-red-500 scale-110' 
          : 'text-neutral-600 hover:text-red-400'
      } ${showSuccess ? 'animate-pulse' : ''}`}
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Success checkmark icon
  const CheckIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-green-600"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Determine button content
  const getButtonContent = () => {
    if (showSuccess) {
      return (
        <>
          <CheckIcon />
          {showLabel && (inWishlist ? 'Added!' : 'Removed!')}
        </>
      );
    }

    return (
      <>
        <HeartIcon />
        {showLabel && (inWishlist ? 'In Wishlist' : 'Add to Wishlist')}
      </>
    );
  };

  // Determine button variant based on state
  const getButtonVariant = () => {
    if (showSuccess) return 'ghost';
    return variant;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      className={`
        transition-all duration-200 touch-manipulation
        ${showSuccess ? 'text-green-600 border-green-600' : ''}
        ${inWishlist && !showSuccess ? 'text-red-500 hover:text-red-600 active:text-red-700' : ''}
        ${size === 'sm' ? 'min-h-[44px]' : ''}
        ${className}
      `}
      onClick={handleToggleWishlist}
      disabled={isToggling || wishlistLoading}
      loading={isToggling}
      aria-label={
        inWishlist 
          ? `Remove ${artwork.title} from wishlist`
          : `Add ${artwork.title} to wishlist`
      }
    >
      {getButtonContent()}
    </Button>
  );
}
import type { GuestWishlistItem, WishlistItem, WishlistError } from '../../types/wishlist';
import type { Artwork } from '../../types/artwork';

const GUEST_WISHLIST_KEY = 'zeroX_guest_wishlist';
const WISHLIST_EXPIRY_HOURS = 24 * 7; // 7 days for wishlist

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 300,
  maxDelay: 5000,
  backoffMultiplier: 1.5,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry certain error types
      if (isNonRetryableError(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

function isNonRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    // Don't retry client errors (4xx) except 408, 429
    return status >= 400 && status < 500 && status !== 408 && status !== 429;
  }
  return false;
}

export function saveGuestWishlist(items: GuestWishlistItem[]): void {
  try {
    const wishlistData = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistData));
  } catch (error) {
    console.warn('Failed to save guest wishlist to localStorage:', error);
  }
}

export function loadGuestWishlist(): GuestWishlistItem[] {
  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!stored) return [];
    
    const wishlistData = JSON.parse(stored);
    const { items, timestamp } = wishlistData;
    
    // Check if wishlist has expired
    const expiryTime = timestamp + (WISHLIST_EXPIRY_HOURS * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      clearGuestWishlist();
      return [];
    }
    
    return items || [];
  } catch (error) {
    console.warn('Failed to load guest wishlist from localStorage:', error);
    return [];
  }
}

export function clearGuestWishlist(): void {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch (error) {
    console.warn('Failed to clear guest wishlist from localStorage:', error);
  }
}

export function addToGuestWishlist(artworkId: string): void {
  const items = loadGuestWishlist();
  const existingIndex = items.findIndex(item => item.artworkId === artworkId);
  
  if (existingIndex >= 0) {
    // Update existing item timestamp
    items[existingIndex] = {
      ...items[existingIndex],
      addedAt: new Date().toISOString(),
    };
  } else {
    // Add new item
    items.push({
      artworkId,
      addedAt: new Date().toISOString(),
    });
  }
  
  saveGuestWishlist(items);
}

export function removeFromGuestWishlist(artworkId: string): void {
  const items = loadGuestWishlist();
  const filteredItems = items.filter(item => item.artworkId !== artworkId);
  saveGuestWishlist(filteredItems);
}

export function isInGuestWishlist(artworkId: string): boolean {
  const items = loadGuestWishlist();
  return items.some(item => item.artworkId === artworkId);
}

export function mapGuestItemToWishlistItem(
  guestItem: GuestWishlistItem, 
  artwork: Artwork
): WishlistItem {
  return {
    id: `guest-${guestItem.artworkId}`,
    artworkId: guestItem.artworkId,
    artwork,
    addedAt: new Date(guestItem.addedAt),
    isAvailable: artwork.status === 'published' && (artwork.availableQuantity || 0) > 0,
    availabilityChanged: false, // Guest items don't track availability changes
  };
}

export function createWishlistError(
  error: unknown, 
  artworkId?: string
): WishlistError {
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as any;
    
    switch (httpError.status) {
      case 404:
        return {
          code: 'ARTWORK_UNAVAILABLE',
          message: 'This artwork is no longer available',
          artworkId,
        };
      case 400:
        return {
          code: 'VALIDATION_ERROR',
          message: httpError.message || 'Invalid request',
          artworkId,
        };
      default:
        if (httpError.status >= 500) {
          return {
            code: 'NETWORK_ERROR',
            message: 'Server error. Please try again.',
            artworkId,
          };
        }
    }
  }
  
  if (error instanceof Error && error.name === 'TypeError') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      artworkId,
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    artworkId,
  };
}
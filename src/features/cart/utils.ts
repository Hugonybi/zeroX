import type { GuestCartItem, CartItem, CartError } from '../../types/cart';
import type { Artwork } from '../../types/artwork';

const GUEST_CART_KEY = 'zeroX_guest_cart';
const CART_EXPIRY_HOURS = 24;
const DEBOUNCE_DELAY = 300; // 300ms debounce for API calls

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

export function saveGuestCart(items: GuestCartItem[]): void {
  try {
    const cartData = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.warn('Failed to save guest cart to localStorage:', error);
  }
}

export function loadGuestCart(): GuestCartItem[] {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return [];
    
    const cartData = JSON.parse(stored);
    const { items, timestamp } = cartData;
    
    // Check if cart has expired
    const expiryTime = timestamp + (CART_EXPIRY_HOURS * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      clearGuestCart();
      return [];
    }
    
    return items || [];
  } catch (error) {
    console.warn('Failed to load guest cart from localStorage:', error);
    return [];
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.warn('Failed to clear guest cart from localStorage:', error);
  }
}

export function addToGuestCart(artworkId: string, purchaseOption?: 'physical' | 'digital'): void {
  const items = loadGuestCart();
  const existingIndex = items.findIndex(item => item.artworkId === artworkId);
  
  if (existingIndex >= 0) {
    // Update existing item
    items[existingIndex] = {
      ...items[existingIndex],
      purchaseOption,
      addedAt: new Date().toISOString(),
    };
  } else {
    // Add new item
    items.push({
      artworkId,
      purchaseOption,
      addedAt: new Date().toISOString(),
    });
  }
  
  saveGuestCart(items);
}

export function removeFromGuestCart(artworkId: string): void {
  const items = loadGuestCart();
  const filteredItems = items.filter(item => item.artworkId !== artworkId);
  saveGuestCart(filteredItems);
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    if (item.isAvailable && item.artwork) {
      return total + item.artwork.priceCents;
    }
    return total;
  }, 0);
}

export function mapGuestItemToCartItem(
  guestItem: GuestCartItem, 
  artwork: Artwork
): CartItem {
  return {
    id: `guest-${guestItem.artworkId}`,
    artworkId: guestItem.artworkId,
    artwork,
    purchaseOption: guestItem.purchaseOption,
    addedAt: new Date(guestItem.addedAt),
    isAvailable: artwork.status === 'published' && (artwork.availableQuantity || 0) > 0,
  };
}

// Debounce utility for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = DEBOUNCE_DELAY
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: number;
  let resolvePromise: (value: ReturnType<T>) => void;
  let rejectPromise: (reason?: any) => void;
  let promise: Promise<ReturnType<T>>;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Create new promise if none exists
    if (!promise) {
      promise = new Promise<ReturnType<T>>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
      });
    }

    // Set new timeout
    timeoutId = setTimeout(async () => {
      try {
        const result = await func(...args);
        resolvePromise(result);
      } catch (error) {
        rejectPromise(error);
      } finally {
        // Reset promise for next call
        promise = null as any;
      }
    }, delay);

    return promise;
  };
}

// Throttle utility for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number;

  return (...args: Parameters<T>): void => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

// Batch API calls utility
export class BatchProcessor<T, R> {
  private queue: Array<{ item: T; resolve: (value: R) => void; reject: (error: any) => void }> = [];
  private timeoutId: number | null = null;
  private readonly batchSize: number;
  private readonly delay: number;
  private readonly processor: (items: T[]) => Promise<R[]>;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    delay: number = DEBOUNCE_DELAY
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else {
        this.scheduleProcessing();
      }
    });
  }

  private scheduleProcessing(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.processBatch();
    }, this.delay);
  }

  private async processBatch(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const items = batch.map(b => b.item);

    try {
      const results = await this.processor(items);
      
      batch.forEach((b, index) => {
        if (results[index] !== undefined) {
          b.resolve(results[index]);
        } else {
          b.reject(new Error('No result for item'));
        }
      });
    } catch (error) {
      batch.forEach(b => b.reject(error));
    }
  }
}

export function createCartError(
  error: unknown, 
  artworkId?: string
): CartError {
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
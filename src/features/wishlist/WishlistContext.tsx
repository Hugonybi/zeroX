import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { WishlistItem, AddToWishlistPayload, WishlistError } from '../../types/wishlist';
import { useAuth } from '../auth/hooks';
import * as wishlistApi from './api';
import { 
  withRetry, 
  loadGuestWishlist, 
  clearGuestWishlist,
  addToGuestWishlist,
  removeFromGuestWishlist,
  isInGuestWishlist,
  createWishlistError
} from './utils';
import { useWishlistNotifications, WishlistNotificationMessages } from './WishlistNotifications';

interface WishlistPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (artworkId: string) => Promise<void>;
  removeFromWishlist: (artworkId: string) => Promise<void>;
  isInWishlist: (artworkId: string) => boolean;
  moveToCart: (artworkId: string) => Promise<void>;
  totalItems: number;
  isLoading: boolean;
  error: WishlistError | null;
  clearError: () => void;
  refreshWishlist: () => Promise<void>;
  // Pagination
  pagination: WishlistPagination;
  loadPage: (page: number) => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export { WishlistContext };

interface WishlistProviderProps {
  children: ReactNode;
}

const ITEMS_PER_PAGE = 20; // 20 items per page as per requirements

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [allItems, setAllItems] = useState<WishlistItem[]>([]); // Store all items for pagination
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<WishlistError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const notifications = useWishlistNotifications();

  // Calculate pagination values
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const pagination: WishlistPagination = {
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
  };

  // Update displayed items when page or allItems changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setItems(allItems.slice(startIndex, endIndex));
  }, [allItems, currentPage]);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Optimistic update helper
  const withOptimisticUpdate = useCallback(
    async (
      optimisticUpdate: () => void,
      operation: () => Promise<any>,
      rollback: () => void
    ): Promise<any> => {
      optimisticUpdate();
      try {
        const result = await withRetry(operation);
        return result;
      } catch (error) {
        rollback();
        throw error;
      }
    },
    []
  );

  // Load wishlist items for authenticated users
  const loadAuthenticatedWishlist = useCallback(async (): Promise<WishlistItem[]> => {
    try {
      return await withRetry(() => wishlistApi.getWishlistItems());
    } catch (error) {
      console.warn('Failed to load authenticated wishlist:', error);
      throw createWishlistError(error);
    }
  }, []);

  // Load guest wishlist items (requires fetching artwork data)
  const loadGuestWishlistItems = useCallback(async (): Promise<WishlistItem[]> => {
    const guestItems = loadGuestWishlist();
    if (guestItems.length === 0) return [];

    // TODO: This would need an API to fetch multiple artworks by IDs
    // For now, we'll return empty array and let individual operations handle it
    // In a real implementation, you'd want a batch endpoint like GET /artworks?ids=1,2,3
    return [];
  }, []);

  // Migrate guest wishlist to authenticated user
  const migrateGuestWishlist = useCallback(async (): Promise<void> => {
    const guestItems = loadGuestWishlist();
    if (guestItems.length === 0) return;

    try {
      const migratedItems = await withRetry(() => 
        wishlistApi.migrateGuestWishlist({ items: guestItems })
      );
      setItems(migratedItems);
      clearGuestWishlist();
    } catch (error) {
      console.warn('Failed to migrate guest wishlist:', error);
      // Don't throw here - let user continue with guest wishlist
    }
  }, []);

  // Initialize wishlist based on auth state
  const initializeWishlist = useCallback(async () => {
    if (authLoading || isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Try to migrate guest wishlist first, then load authenticated wishlist
        await migrateGuestWishlist();
        const authenticatedItems = await loadAuthenticatedWishlist();
        setAllItems(authenticatedItems);
      } else {
        // Load guest wishlist items
        const guestWishlistItems = await loadGuestWishlistItems();
        setAllItems(guestWishlistItems);
      }
    } catch (error) {
      setError(error as WishlistError);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isAuthenticated, authLoading, isInitialized, migrateGuestWishlist, loadAuthenticatedWishlist, loadGuestWishlistItems]);

  // Initialize wishlist when auth state changes
  useEffect(() => {
    initializeWishlist();
  }, [initializeWishlist]);

  // Check if artwork is in wishlist
  const isInWishlist = useCallback((artworkId: string): boolean => {
    if (isAuthenticated) {
      return allItems.some(item => item.artworkId === artworkId);
    } else {
      return isInGuestWishlist(artworkId);
    }
  }, [isAuthenticated, allItems]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (artworkId: string): Promise<void> => {
    setError(null);

    if (isAuthenticated) {
      // Authenticated user - use API
      const payload: AddToWishlistPayload = { artworkId };
      
      try {
        const newItem = await withRetry(() => wishlistApi.addToWishlist(payload));
        setAllItems(prevItems => {
          const existingIndex = prevItems.findIndex(item => item.artworkId === artworkId);
          if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...prevItems];
            updatedItems[existingIndex] = newItem;
            notifications.showSuccess(WishlistNotificationMessages.ITEM_ADDED, newItem.artwork.title);
            return updatedItems;
          } else {
            // Add new item
            notifications.showSuccess(WishlistNotificationMessages.ITEM_ADDED, newItem.artwork.title);
            return [...prevItems, newItem];
          }
        });
      } catch (error) {
        const wishlistError = createWishlistError(error, artworkId);
        setError(wishlistError);
        notifications.showError(wishlistError);
        throw wishlistError;
      }
    } else {
      // Guest user - use localStorage with optimistic update
      const previousItems = [...allItems];
      
      try {
        await withOptimisticUpdate(
          () => {
            addToGuestWishlist(artworkId);
            notifications.showSuccess(WishlistNotificationMessages.ITEM_ADDED);
            // For optimistic update, we'd need the artwork data
            // In a real implementation, you might cache artwork data or fetch it
            // For now, we'll just update localStorage and refresh on next load
          },
          async () => {
            // No API call needed for guest users
            return Promise.resolve();
          },
          () => {
            setAllItems(previousItems);
            notifications.showError(WishlistNotificationMessages.UNKNOWN_ERROR);
          }
        );
      } catch (error) {
        const wishlistError = createWishlistError(error, artworkId);
        setError(wishlistError);
        notifications.showError(wishlistError);
        throw wishlistError;
      }
    }
  }, [isAuthenticated, allItems, withOptimisticUpdate, notifications]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (artworkId: string): Promise<void> => {
    setError(null);
    const previousItems = [...allItems];
    const itemToRemove = allItems.find(item => item.artworkId === artworkId);

    try {
      await withOptimisticUpdate(
        () => {
          setAllItems(prevItems => prevItems.filter(item => item.artworkId !== artworkId));
          if (!isAuthenticated) {
            removeFromGuestWishlist(artworkId);
          }
          notifications.showSuccess(
            WishlistNotificationMessages.ITEM_REMOVED, 
            itemToRemove?.artwork.title
          );
        },
        async () => {
          if (isAuthenticated) {
            await withRetry(() => wishlistApi.removeFromWishlist(artworkId));
          }
          return Promise.resolve();
        },
        () => {
          setAllItems(previousItems);
          if (!isAuthenticated) {
            // Restore guest wishlist item
            addToGuestWishlist(artworkId);
          }
          notifications.showError(WishlistNotificationMessages.UNKNOWN_ERROR);
        }
      );
    } catch (error) {
      const wishlistError = createWishlistError(error, artworkId);
      setError(wishlistError);
      notifications.showError(wishlistError, itemToRemove?.artwork.title);
      throw wishlistError;
    }
  }, [isAuthenticated, allItems, withOptimisticUpdate, notifications]);

  // Move item from wishlist to cart
  const moveToCart = useCallback(async (artworkId: string): Promise<void> => {
    setError(null);
    const previousItems = [...allItems];
    const itemToMove = allItems.find(item => item.artworkId === artworkId);

    try {
      await withOptimisticUpdate(
        () => {
          // Optimistically remove from wishlist
          setAllItems(prevItems => prevItems.filter(item => item.artworkId !== artworkId));
          if (!isAuthenticated) {
            removeFromGuestWishlist(artworkId);
          }
          notifications.showSuccess(
            WishlistNotificationMessages.MOVED_TO_CART, 
            itemToMove?.artwork.title
          );
        },
        async () => {
          if (isAuthenticated) {
            await withRetry(() => wishlistApi.moveToCart(artworkId));
          } else {
            // For guest users, we need to handle this differently
            // This would typically involve adding to guest cart
            // For now, we'll just remove from wishlist
            return Promise.resolve();
          }
        },
        () => {
          setAllItems(previousItems);
          if (!isAuthenticated) {
            // Restore guest wishlist item
            addToGuestWishlist(artworkId);
          }
          notifications.showError(WishlistNotificationMessages.UNKNOWN_ERROR);
        }
      );
    } catch (error) {
      const wishlistError = createWishlistError(error, artworkId);
      setError(wishlistError);
      notifications.showError(wishlistError, itemToMove?.artwork.title);
      throw wishlistError;
    }
  }, [isAuthenticated, allItems, withOptimisticUpdate, notifications]);

  // Refresh wishlist from server
  const refreshWishlist = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const freshItems = await loadAuthenticatedWishlist();
      setAllItems(freshItems);
    } catch (error) {
      setError(error as WishlistError);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadAuthenticatedWishlist]);

  // Pagination functions
  const loadPage = useCallback(async (page: number): Promise<void> => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);

  const loadNextPage = useCallback(async (): Promise<void> => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const loadPreviousPage = useCallback(async (): Promise<void> => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const value: WishlistContextType = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    moveToCart,
    totalItems,
    isLoading,
    error,
    clearError,
    refreshWishlist,
    pagination,
    loadPage,
    loadNextPage,
    loadPreviousPage,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
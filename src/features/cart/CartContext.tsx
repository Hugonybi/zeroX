import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, AddToCartPayload, CartError } from '../../types/cart';
import { useAuth } from '../auth/hooks';
import * as cartApi from './api';
import { 
  withRetry, 
  loadGuestCart, 
  clearGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  calculateCartTotal,
  createCartError,
  debounce
} from './utils';
import { useCartNotifications, CartNotificationMessages } from './CartNotifications';

interface CartContextType {
  items: CartItem[];
  addToCart: (artworkId: string, purchaseOption?: 'physical' | 'digital') => Promise<void>;
  removeFromCart: (artworkId: string) => Promise<void>;
  updateCartItem: (artworkId: string, purchaseOption?: 'physical' | 'digital') => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: CartError | null;
  clearError: () => void;
  refreshCart: () => Promise<void>;
  expiringItems: CartItem[];
  checkExpiringItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export { CartContext };

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CartError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const notifications = useCartNotifications();

  // Create debounced API functions
  const debouncedAddToCart = useCallback(
    debounce((payload: AddToCartPayload) => cartApi.addToCart(payload)),
    []
  );

  const debouncedRemoveFromCart = useCallback(
    debounce((artworkId: string) => cartApi.removeFromCart(artworkId)),
    []
  );

  const debouncedUpdateCartItem = useCallback(
    debounce((artworkId: string, payload: AddToCartPayload) => 
      cartApi.updateCartItem(artworkId, payload)
    ),
    []
  );

  const debouncedClearCart = useCallback(
    debounce(() => cartApi.clearCart()),
    []
  );

  // Calculate derived values
  const totalItems = items.length;
  const totalPrice = calculateCartTotal(items);

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

  // Load cart items for authenticated users
  const loadAuthenticatedCart = useCallback(async (): Promise<CartItem[]> => {
    try {
      return await withRetry(() => cartApi.getCartItems());
    } catch (error) {
      console.warn('Failed to load authenticated cart:', error);
      throw createCartError(error);
    }
  }, []);

  // Load guest cart items (requires fetching artwork data)
  const loadGuestCartItems = useCallback(async (): Promise<CartItem[]> => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return [];

    // TODO: This would need an API to fetch multiple artworks by IDs
    // For now, we'll return empty array and let individual operations handle it
    // In a real implementation, you'd want a batch endpoint like GET /artworks?ids=1,2,3
    return [];
  }, []);

  // Migrate guest cart to authenticated user
  const migrateGuestCart = useCallback(async (): Promise<void> => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;

    try {
      const migratedItems = await withRetry(() => 
        cartApi.migrateGuestCart({ items: guestItems })
      );
      setItems(migratedItems);
      clearGuestCart();
    } catch (error) {
      console.warn('Failed to migrate guest cart:', error);
      // Don't throw here - let user continue with guest cart
    }
  }, []);

  // Initialize cart based on auth state
  const initializeCart = useCallback(async () => {
    if (authLoading || isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Try to migrate guest cart first, then load authenticated cart
        await migrateGuestCart();
        const authenticatedItems = await loadAuthenticatedCart();
        setItems(authenticatedItems);
      } else {
        // Load guest cart items
        const guestCartItems = await loadGuestCartItems();
        setItems(guestCartItems);
      }
    } catch (error) {
      setError(error as CartError);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isAuthenticated, authLoading, isInitialized, migrateGuestCart, loadAuthenticatedCart, loadGuestCartItems]);

  // Initialize cart when auth state changes
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Add item to cart
  const addToCart = useCallback(async (
    artworkId: string, 
    purchaseOption?: 'physical' | 'digital'
  ): Promise<void> => {
    setError(null);

    if (isAuthenticated) {
      // Authenticated user - use API
      const payload: AddToCartPayload = { artworkId, purchaseOption };
      
      try {
        const newItem = await withRetry(() => debouncedAddToCart(payload));
        setItems(prevItems => {
          const existingIndex = prevItems.findIndex(item => item.artworkId === artworkId);
          if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...prevItems];
            updatedItems[existingIndex] = newItem;
            notifications.showSuccess(CartNotificationMessages.ITEM_UPDATED, newItem.artwork.title);
            return updatedItems;
          } else {
            // Add new item
            notifications.showSuccess(CartNotificationMessages.ITEM_ADDED, newItem.artwork.title);
            return [...prevItems, newItem];
          }
        });
      } catch (error) {
        const cartError = createCartError(error, artworkId);
        setError(cartError);
        notifications.showError(cartError);
        throw cartError;
      }
    } else {
      // Guest user - use localStorage with optimistic update
      const previousItems = [...items];
      
      try {
        await withOptimisticUpdate(
          () => {
            addToGuestCart(artworkId, purchaseOption);
            notifications.showSuccess(CartNotificationMessages.ITEM_ADDED);
            // For optimistic update, we'd need the artwork data
            // In a real implementation, you might cache artwork data or fetch it
            // For now, we'll just update localStorage and refresh on next load
          },
          async () => {
            // No API call needed for guest users
            return Promise.resolve();
          },
          () => {
            setItems(previousItems);
            notifications.showError(CartNotificationMessages.UNKNOWN_ERROR);
          }
        );
      } catch (error) {
        const cartError = createCartError(error, artworkId);
        setError(cartError);
        notifications.showError(cartError);
        throw cartError;
      }
    }
  }, [isAuthenticated, items, withOptimisticUpdate, notifications]);

  // Remove item from cart
  const removeFromCart = useCallback(async (artworkId: string): Promise<void> => {
    setError(null);
    const previousItems = [...items];
    const itemToRemove = items.find(item => item.artworkId === artworkId);

    try {
      await withOptimisticUpdate(
        () => {
          setItems(prevItems => prevItems.filter(item => item.artworkId !== artworkId));
          if (!isAuthenticated) {
            removeFromGuestCart(artworkId);
          }
          notifications.showSuccess(
            CartNotificationMessages.ITEM_REMOVED, 
            itemToRemove?.artwork.title
          );
        },
        async () => {
          if (isAuthenticated) {
            await withRetry(() => debouncedRemoveFromCart(artworkId));
          }
          return Promise.resolve();
        },
        () => {
          setItems(previousItems);
          if (!isAuthenticated) {
            // Restore guest cart item
            const removedItem = previousItems.find(item => item.artworkId === artworkId);
            if (removedItem) {
              addToGuestCart(artworkId, removedItem.purchaseOption);
            }
          }
          notifications.showError(CartNotificationMessages.UNKNOWN_ERROR);
        }
      );
    } catch (error) {
      const cartError = createCartError(error, artworkId);
      setError(cartError);
      notifications.showError(cartError, itemToRemove?.artwork.title);
      throw cartError;
    }
  }, [isAuthenticated, items, withOptimisticUpdate, notifications]);

  // Update cart item
  const updateCartItem = useCallback(async (
    artworkId: string, 
    purchaseOption?: 'physical' | 'digital'
  ): Promise<void> => {
    setError(null);
    const previousItems = [...items];

    await withOptimisticUpdate(
      () => {
        setItems(prevItems => 
          prevItems.map(item => 
            item.artworkId === artworkId 
              ? { ...item, purchaseOption }
              : item
          )
        );
        if (!isAuthenticated) {
          addToGuestCart(artworkId, purchaseOption);
        }
      },
      async () => {
        if (isAuthenticated) {
          const updatedItem = await withRetry(() => 
            debouncedUpdateCartItem(artworkId, { artworkId, purchaseOption })
          );
          setItems(prevItems => 
            prevItems.map(item => 
              item.artworkId === artworkId ? updatedItem : item
            )
          );
        }
        return Promise.resolve();
      },
      () => {
        setItems(previousItems);
      }
    );
  }, [isAuthenticated, items, withOptimisticUpdate]);

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<void> => {
    setError(null);
    const previousItems = [...items];

    try {
      await withOptimisticUpdate(
        () => {
          setItems([]);
          if (!isAuthenticated) {
            clearGuestCart();
          }
          notifications.showSuccess(CartNotificationMessages.CART_CLEARED);
        },
        async () => {
          if (isAuthenticated) {
            await withRetry(() => debouncedClearCart());
          }
          return Promise.resolve();
        },
        () => {
          setItems(previousItems);
          notifications.showError(CartNotificationMessages.UNKNOWN_ERROR);
        }
      );
    } catch (error) {
      const cartError = createCartError(error);
      setError(cartError);
      notifications.showError(cartError);
      throw cartError;
    }
  }, [isAuthenticated, items, withOptimisticUpdate, notifications]);

  // Refresh cart from server
  const refreshCart = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const freshItems = await loadAuthenticatedCart();
      setItems(freshItems);
    } catch (error) {
      setError(error as CartError);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadAuthenticatedCart]);

  // Check for expiring cart items
  const checkExpiringItems = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const expiring = await withRetry(() => cartApi.getExpiringCartItems());
      setExpiringItems(expiring);
      
      // Show warning notification if there are expiring items
      if (expiring.length > 0) {
        notifications.showActionNotification(
          `${expiring.length} cart item${expiring.length > 1 ? 's' : ''} will expire in 2 hours`,
          'View Cart',
          () => {
            // This could trigger opening the cart sidebar or navigating to cart page
            console.log('Navigate to cart');
          },
          'info'
        );
      }
    } catch (error) {
      console.warn('Failed to check expiring cart items:', error);
      // Don't set error state for this - it's a background check
    }
  }, [isAuthenticated, notifications]);

  // Check for expiring items periodically (every 30 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check immediately
    checkExpiringItems();

    // Set up periodic check
    const interval = setInterval(checkExpiringItems, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkExpiringItems]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    totalItems,
    totalPrice,
    isLoading,
    error,
    clearError,
    refreshCart,
    expiringItems,
    checkExpiringItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
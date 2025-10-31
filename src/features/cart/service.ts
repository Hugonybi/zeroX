import * as cartApi from './api';
import { withRetry, createCartError } from './utils';
import type { 
  CartItem, 
  AddToCartPayload, 
  UpdateCartItemPayload, 
  MigrateCartPayload,
  CartValidationResult,
  CartError 
} from '../../types/cart';

/**
 * Cart service with built-in retry logic and error handling
 * This provides a higher-level interface over the raw API calls
 */
export class CartService {
  /**
   * Get all cart items with retry logic
   */
  static async getItems(): Promise<CartItem[]> {
    try {
      return await withRetry(() => cartApi.getCartItems());
    } catch (error) {
      throw createCartError(error);
    }
  }

  /**
   * Add item to cart with retry logic
   */
  static async addItem(payload: AddToCartPayload): Promise<CartItem> {
    try {
      return await withRetry(() => cartApi.addToCart(payload));
    } catch (error) {
      throw createCartError(error, payload.artworkId);
    }
  }

  /**
   * Remove item from cart with retry logic
   */
  static async removeItem(artworkId: string): Promise<void> {
    try {
      await withRetry(() => cartApi.removeFromCart(artworkId));
    } catch (error) {
      throw createCartError(error, artworkId);
    }
  }

  /**
   * Update cart item with retry logic
   */
  static async updateItem(artworkId: string, payload: UpdateCartItemPayload): Promise<CartItem> {
    try {
      return await withRetry(() => cartApi.updateCartItem(artworkId, payload));
    } catch (error) {
      throw createCartError(error, artworkId);
    }
  }

  /**
   * Clear entire cart with retry logic
   */
  static async clearAll(): Promise<void> {
    try {
      await withRetry(() => cartApi.clearCart());
    } catch (error) {
      throw createCartError(error);
    }
  }

  /**
   * Migrate guest cart to authenticated user with retry logic
   */
  static async migrateGuestCart(payload: MigrateCartPayload): Promise<CartItem[]> {
    try {
      return await withRetry(() => cartApi.migrateGuestCart(payload));
    } catch (error) {
      throw createCartError(error);
    }
  }

  /**
   * Validate cart items with retry logic
   */
  static async validateCart(): Promise<CartValidationResult> {
    try {
      return await withRetry(() => cartApi.validateCart());
    } catch (error) {
      throw createCartError(error);
    }
  }

  /**
   * Batch operation helper for multiple cart operations
   */
  static async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    options: { 
      continueOnError?: boolean;
      maxConcurrent?: number;
    } = {}
  ): Promise<Array<{ success: boolean; result?: T; error?: CartError }>> {
    const { continueOnError = true, maxConcurrent = 3 } = options;
    const results: Array<{ success: boolean; result?: T; error?: CartError }> = [];

    // Process operations in batches to avoid overwhelming the server
    for (let i = 0; i < operations.length; i += maxConcurrent) {
      const batch = operations.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (operation) => {
        try {
          const result = await operation();
          return { success: true, result };
        } catch (error) {
          const cartError = createCartError(error);
          if (!continueOnError) {
            throw cartError;
          }
          return { success: false, error: cartError };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}
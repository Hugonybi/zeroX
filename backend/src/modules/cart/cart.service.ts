import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheService } from '@common/cache/cache.service';
import { ArtworkStatus, Prisma } from '@prisma/client';
import { AddToCartDto, MigrateCartDto } from './dto';
import { CartItemWithArtwork, ValidationResult, CartSummary } from './interfaces';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Add an artwork to user's cart
   * Requirement 1.1: Add artwork to cart with confirmation
   */
  async addToCart(userId: string, dto: AddToCartDto): Promise<CartItemWithArtwork> {
    // Check if artwork exists and is available (with caching)
    const artworkCacheKey = this.cacheService.getArtworkCacheKey(dto.artworkId);
    let artwork = await this.cacheService.get<any>(artworkCacheKey);
    
    if (!artwork) {
      artwork = await this.prisma.artwork.findUnique({
        where: { id: dto.artworkId }
      });
      
      if (artwork) {
        // Cache artwork for 5 minutes
        await this.cacheService.set(artworkCacheKey, artwork, 300);
      }
    }

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    if (artwork.status !== ArtworkStatus.published) {
      throw new BadRequestException('Artwork is not available for purchase');
    }

    if (artwork.availableQuantity <= 0) {
      throw new ConflictException('Artwork is out of stock');
    }

    // Check if item already exists in cart (upsert behavior)
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId: dto.artworkId
        }
      }
    });

    if (existingItem) {
      // Update existing item with new purchase options
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          purchaseOption: (dto.purchaseOption ?? existingItem.purchaseOption) as Prisma.InputJsonValue,
          updatedAt: new Date()
        },
        include: {
          artwork: true
        }
      });
      return updatedItem as CartItemWithArtwork;
    }

    // Create new cart item
    const cartItem = await this.prisma.cartItem.create({
      data: {
        userId,
        artworkId: dto.artworkId,
        purchaseOption: dto.purchaseOption as Prisma.InputJsonValue
      },
      include: {
        artwork: true
      }
    });

    // Invalidate cart cache
    await this.cacheService.del(this.cacheService.getCartCacheKey(userId));

    return cartItem as CartItemWithArtwork;
  }

  /**
   * Remove an artwork from user's cart
   * Requirement 1.3: Remove item and update cart immediately
   */
  async removeFromCart(userId: string, artworkId: string): Promise<void> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id }
    });

    // Invalidate cart cache
    await this.cacheService.del(this.cacheService.getCartCacheKey(userId));
  }

  /**
   * Get all cart items for a user
   * Requirement 1.2: Display all cart items with details
   */
  async getCartItems(userId: string): Promise<CartItemWithArtwork[]> {
    // Try to get from cache first
    const cacheKey = this.cacheService.getCartCacheKey(userId);
    let cartItems = await this.cacheService.get<CartItemWithArtwork[]>(cacheKey);
    
    if (!cartItems) {
      cartItems = await this.prisma.cartItem.findMany({
        where: { userId },
        include: {
          artwork: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, cartItems, 300);
    }

    // Filter out items where artwork is no longer available
    const availableItems = cartItems.filter(item => 
      item.artwork.status === ArtworkStatus.published && 
      item.artwork.availableQuantity > 0
    );

    // Remove unavailable items from cart
    const unavailableItems = cartItems.filter(item => 
      item.artwork.status !== ArtworkStatus.published || 
      item.artwork.availableQuantity <= 0
    );

    if (unavailableItems.length > 0) {
      await this.prisma.cartItem.deleteMany({
        where: {
          id: {
            in: unavailableItems.map(item => item.id)
          }
        }
      });
      
      // Invalidate cache since we removed items
      await this.cacheService.del(cacheKey);
    }

    return availableItems;
  }

  /**
   * Clear all items from user's cart
   */
  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { userId }
    });
    
    // Invalidate cart cache
    await this.cacheService.del(this.cacheService.getCartCacheKey(userId));
  }

  /**
   * Migrate guest cart items to authenticated user
   * Requirement 3.4: Migrate cart items when guest creates account
   */
  async migrateGuestCart(userId: string, dto: MigrateCartDto): Promise<CartItemWithArtwork[]> {
    const migratedItems: CartItemWithArtwork[] = [];

    for (const guestItem of dto.items) {
      try {
        // Check if artwork exists and is available
        const artwork = await this.prisma.artwork.findUnique({
          where: { id: guestItem.artworkId }
        });

        if (!artwork || artwork.status !== ArtworkStatus.published || artwork.availableQuantity <= 0) {
          continue; // Skip unavailable items
        }

        // Check if item already exists in user's cart
        const existingItem = await this.prisma.cartItem.findUnique({
          where: {
            userId_artworkId: {
              userId,
              artworkId: guestItem.artworkId
            }
          }
        });

        if (existingItem) {
          continue; // Skip if already in cart
        }

        // Add to cart
        const cartItem = await this.prisma.cartItem.create({
          data: {
            userId,
            artworkId: guestItem.artworkId,
            purchaseOption: guestItem.purchaseOption as Prisma.InputJsonValue
          },
          include: {
            artwork: true
          }
        });

        migratedItems.push(cartItem as CartItemWithArtwork);
      } catch (error) {
        // Continue with other items if one fails
        console.error(`Failed to migrate cart item ${guestItem.artworkId}:`, error);
      }
    }

    return migratedItems;
  }

  /**
   * Validate all cart items for availability
   * Requirement 1.5: Check availability before operations
   */
  async validateCartItems(userId: string): Promise<ValidationResult> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        artwork: true
      }
    });

    const invalidItems: string[] = [];
    const unavailableItems: string[] = [];

    for (const item of cartItems) {
      if (!item.artwork) {
        invalidItems.push(item.artworkId);
        continue;
      }

      if (item.artwork.status !== ArtworkStatus.published) {
        unavailableItems.push(item.artworkId);
        continue;
      }

      if (item.artwork.availableQuantity <= 0) {
        unavailableItems.push(item.artworkId);
      }
    }

    // Remove invalid and unavailable items
    if (invalidItems.length > 0 || unavailableItems.length > 0) {
      const itemsToRemove = [...invalidItems, ...unavailableItems];
      await this.prisma.cartItem.deleteMany({
        where: {
          userId,
          artworkId: {
            in: itemsToRemove
          }
        }
      });
    }

    return {
      isValid: invalidItems.length === 0 && unavailableItems.length === 0,
      invalidItems,
      unavailableItems
    };
  }

  /**
   * Get cart summary with totals
   * Requirement 1.2: Display cart with totals
   */
  async getCartSummary(userId: string): Promise<CartSummary> {
    const cartItems = await this.getCartItems(userId);
    
    const totalPrice = cartItems.reduce((sum, item) => sum + item.artwork.priceCents, 0);
    const currency = cartItems.length > 0 ? cartItems[0].artwork.currency : 'USD';

    return {
      items: cartItems,
      totalItems: cartItems.length,
      totalPrice,
      currency
    };
  }

  /**
   * Check if artwork is in user's cart
   */
  async isInCart(userId: string, artworkId: string): Promise<boolean> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      }
    });

    return !!cartItem;
  }

  /**
   * Cleanup expired cart items (for background job)
   * Requirement 3.5: Remove expired items after 24 hours
   */
  async cleanupExpiredCarts(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await this.prisma.cartItem.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo
        }
      }
    });

    return result.count;
  }

  /**
   * Get cart items that will expire soon (for notifications)
   * Requirement 6.5: Warning notifications 2 hours before expiry
   */
  async getExpiringCartItems(userId: string): Promise<CartItemWithArtwork[]> {
    const twentyTwoHoursAgo = new Date(Date.now() - 22 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return this.prisma.cartItem.findMany({
      where: {
        userId,
        createdAt: {
          gte: twentyFourHoursAgo,
          lt: twentyTwoHoursAgo
        }
      },
      include: {
        artwork: true
      }
    });
  }

  /**
   * Get all users with expiring cart items (for system notifications)
   * Requirement 6.5: Warning notifications 2 hours before expiry
   */
  async getUsersWithExpiringCarts(): Promise<Array<{
    userId: string;
    userEmail: string;
    expiringItems: CartItemWithArtwork[];
  }>> {
    const twentyTwoHoursAgo = new Date(Date.now() - 22 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get all cart items that will expire in the next 2 hours
    const expiringCartItems = await this.prisma.cartItem.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
          lt: twentyTwoHoursAgo
        }
      },
      include: {
        artwork: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Group by user
    const userGroups = new Map<string, {
      userId: string;
      userEmail: string;
      expiringItems: CartItemWithArtwork[];
    }>();

    for (const item of expiringCartItems) {
      const userId = item.user.id;
      if (!userGroups.has(userId)) {
        userGroups.set(userId, {
          userId,
          userEmail: item.user.email,
          expiringItems: []
        });
      }
      userGroups.get(userId)!.expiringItems.push(item as CartItemWithArtwork);
    }

    return Array.from(userGroups.values());
  }

  /**
   * Process cart checkout - create individual orders for each cart item
   * Requirement 4.2: Create individual orders for each artwork
   */
  async processCartCheckout(userId: string, paymentProvider: string, shippingAddress?: any, shippingMethod?: string): Promise<{
    orders: any[];
    sessionId: string;
    totalAmount: number;
    currency: string;
  }> {
    // Get all valid cart items
    const cartItems = await this.getCartItems(userId);
    
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Generate session ID for tracking this checkout
    const sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const orders: any[] = [];
    let totalAmount = 0;
    const currency = cartItems[0].artwork.currency;

    // Create individual orders for each cart item
    for (const cartItem of cartItems) {
      try {
        const artwork = cartItem.artwork;
        
        // Calculate pricing for this item
        const unitPriceCents = artwork.priceCents;
        const quantity = 1; // Cart items are individual artworks
        const subtotalCents = unitPriceCents * quantity;
        const shippingCents = shippingMethod ? this.calculateShipping(shippingMethod, artwork.type) : 0;
        const taxCents = 0;
        const itemTotalCents = subtotalCents + shippingCents + taxCents;

        // Reserve inventory
        await this.prisma.artwork.update({
          where: { id: artwork.id },
          data: {
            availableQuantity: artwork.availableQuantity - quantity,
            reservedQuantity: artwork.reservedQuantity + quantity,
          },
        });

        // Create order
        const order = await this.prisma.order.create({
          data: {
            buyerId: userId,
            artworkId: artwork.id,
            amountCents: subtotalCents,
            currency: artwork.currency,
            paymentProvider,
            reference: `${sessionId}_${artwork.id}`,
            quantity,
            unitPriceCents,
            shippingCents,
            taxCents,
            totalCents: itemTotalCents,
            shippingAddress: shippingAddress ? (shippingAddress as any) : undefined,
            shippingMethod,
          },
          include: {
            artwork: {
              select: {
                id: true,
                title: true,
                mediaUrl: true,
                type: true,
                artist: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        });

        orders.push(order);
        totalAmount += itemTotalCents;
      } catch (error) {
        console.error(`Failed to create order for artwork ${cartItem.artworkId}:`, error);
        // Continue with other items - partial failures are handled
      }
    }

    // Clear cart after successful order creation
    if (orders.length > 0) {
      await this.clearCart(userId);
    }

    return {
      orders,
      sessionId,
      totalAmount,
      currency
    };
  }

  private calculateShipping(shippingMethod: string, artworkType: string): number {
    // Simple shipping calculation - can be enhanced later
    if (artworkType === 'digital') {
      return 0;
    }
    
    switch (shippingMethod) {
      case 'standard':
        return 1000; // $10 in cents
      case 'express':
        return 2500; // $25 in cents
      case 'international':
        return 5000; // $50 in cents
      default:
        return 0;
    }
  }
}
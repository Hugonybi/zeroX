import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheService } from '@common/cache/cache.service';
import { ArtworkStatus } from '@prisma/client';
import { WishlistItemWithArtwork, WishlistSummary, AvailabilityChangeNotification } from './interfaces';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Add an artwork to user's wishlist
   * Requirement 2.1: Add artwork to wishlist and update icon state
   */
  async addToWishlist(userId: string, artworkId: string): Promise<WishlistItemWithArtwork> {
    // Check if artwork exists
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId }
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    // Check if item already exists in wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      }
    });

    if (existingItem) {
      // Return existing item with artwork details
      return this.prisma.wishlistItem.findUnique({
        where: { id: existingItem.id },
        include: { artwork: true }
      }) as Promise<WishlistItemWithArtwork>;
    }

    // Create new wishlist item
    const wishlistItem = await this.prisma.wishlistItem.create({
      data: {
        userId,
        artworkId
      },
      include: {
        artwork: true
      }
    });

    // Invalidate wishlist cache
    await this.cacheService.del(this.cacheService.getWishlistCacheKey(userId));

    return wishlistItem as WishlistItemWithArtwork;
  }

  /**
   * Remove an artwork from user's wishlist
   * Requirement 2.3: Remove artwork from wishlist immediately
   */
  async removeFromWishlist(userId: string, artworkId: string): Promise<void> {
    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      }
    });

    if (!wishlistItem) {
      throw new NotFoundException('Item not found in wishlist');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    // Invalidate wishlist cache
    await this.cacheService.del(this.cacheService.getWishlistCacheKey(userId));
  }

  /**
   * Get all wishlist items for a user
   * Requirement 2.2: Display all wishlist items with availability status
   */
  async getWishlistItems(userId: string): Promise<WishlistItemWithArtwork[]> {
    // Try to get from cache first
    const cacheKey = this.cacheService.getWishlistCacheKey(userId);
    let wishlistItems = await this.cacheService.get<WishlistItemWithArtwork[]>(cacheKey);
    
    if (!wishlistItems) {
      wishlistItems = await this.prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          artwork: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, wishlistItems, 300);
    }

    return wishlistItems;
  }

  /**
   * Move an artwork from wishlist to cart
   * Requirement 2.5: Move item to cart and optionally remove from wishlist
   */
  async moveToCart(userId: string, artworkId: string, removeFromWishlist: boolean = true): Promise<void> {
    // Check if artwork exists in wishlist
    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      },
      include: {
        artwork: true
      }
    });

    if (!wishlistItem) {
      throw new NotFoundException('Item not found in wishlist');
    }

    // Check if artwork is available for purchase
    if (wishlistItem.artwork.status !== ArtworkStatus.published) {
      throw new BadRequestException('Artwork is not available for purchase');
    }

    if (wishlistItem.artwork.availableQuantity <= 0) {
      throw new ConflictException('Artwork is out of stock');
    }

    // Check if item already exists in cart
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      }
    });

    if (existingCartItem) {
      // Item already in cart, just remove from wishlist if requested
      if (removeFromWishlist) {
        await this.prisma.wishlistItem.delete({
          where: { id: wishlistItem.id }
        });
      }
      return;
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Add to cart
      await tx.cartItem.create({
        data: {
          userId,
          artworkId
        }
      });

      // Remove from wishlist if requested
      if (removeFromWishlist) {
        await tx.wishlistItem.delete({
          where: { id: wishlistItem.id }
        });
      }
    });
  }

  /**
   * Check if artwork is in user's wishlist
   */
  async isInWishlist(userId: string, artworkId: string): Promise<boolean> {
    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId
        }
      }
    });

    return !!wishlistItem;
  }

  /**
   * Get wishlist summary with totals
   */
  async getWishlistSummary(userId: string): Promise<WishlistSummary> {
    const wishlistItems = await this.getWishlistItems(userId);

    return {
      items: wishlistItems,
      totalItems: wishlistItems.length
    };
  }

  /**
   * Notify users when wishlisted artwork availability changes
   * Requirement 2.6: Notify wishlist owners when artwork is purchased by another buyer
   * Requirement 2.4: Update availability status when artwork becomes available/unavailable
   */
  async notifyAvailabilityChange(artworkId: string): Promise<AvailabilityChangeNotification[]> {
    // Get artwork details
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId }
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    // Get all users who have this artwork in their wishlist
    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: { artworkId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Determine availability status
    const isAvailable = artwork.status === ArtworkStatus.published && artwork.availableQuantity > 0;

    // Create notifications for each user
    const notifications: AvailabilityChangeNotification[] = wishlistItems.map(item => ({
      artworkId,
      artworkTitle: artwork.title,
      isAvailable,
      userId: item.userId
    }));

    // If artwork is sold (not available), we could optionally remove it from wishlists
    // For now, we'll keep it in wishlist but mark as unavailable
    // This allows users to see what they were interested in

    return notifications;
  }

  /**
   * Get wishlist items for artworks that have changed availability
   * This can be used by a background job to check for availability changes
   */
  async getWishlistItemsForAvailabilityCheck(): Promise<WishlistItemWithArtwork[]> {
    return this.prisma.wishlistItem.findMany({
      include: {
        artwork: true
      }
    });
  }

  /**
   * Remove wishlist items for artworks that are no longer available
   * This is an optional cleanup method
   */
  async cleanupUnavailableItems(userId?: string): Promise<number> {
    const whereClause: any = {
      artwork: {
        OR: [
          { status: { not: ArtworkStatus.published } },
          { availableQuantity: { lte: 0 } }
        ]
      }
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const result = await this.prisma.wishlistItem.deleteMany({
      where: whereClause
    });

    return result.count;
  }

  /**
   * Get users who have a specific artwork in their wishlist
   * Useful for targeted notifications
   */
  async getUsersWithArtworkInWishlist(artworkId: string): Promise<string[]> {
    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: { artworkId },
      select: { userId: true }
    });

    return wishlistItems.map(item => item.userId);
  }
}
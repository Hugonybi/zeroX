import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto, MoveToCartDto } from './dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * GET /api/wishlist - Get user's wishlist items
   * Requirement 2.2: Display all wishlist items with availability status
   */
  @Get()
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlistSummary(req.user.sub);
  }

  /**
   * POST /api/wishlist/items - Add item to wishlist
   * Requirement 2.1: Add artwork to wishlist and update icon state
   */
  @Post('items')
  async addToWishlist(@Request() req, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.sub, dto.artworkId);
  }

  /**
   * DELETE /api/wishlist/items/:artworkId - Remove item from wishlist
   * Requirement 2.3: Remove artwork from wishlist immediately
   */
  @Delete('items/:artworkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWishlist(@Request() req, @Param('artworkId') artworkId: string) {
    await this.wishlistService.removeFromWishlist(req.user.sub, artworkId);
  }

  /**
   * POST /api/wishlist/move-to-cart/:artworkId - Move item from wishlist to cart
   * Requirement 2.5: Move item to cart and optionally remove from wishlist
   */
  @Post('move-to-cart/:artworkId')
  async moveToCart(
    @Request() req, 
    @Param('artworkId') artworkId: string,
    @Body() dto: MoveToCartDto
  ) {
    await this.wishlistService.moveToCart(
      req.user.sub, 
      artworkId, 
      dto.removeFromWishlist
    );
    return { message: 'Item moved to cart successfully' };
  }

  /**
   * GET /api/wishlist/check/:artworkId - Check if artwork is in wishlist
   */
  @Get('check/:artworkId')
  async checkInWishlist(@Request() req, @Param('artworkId') artworkId: string) {
    const isInWishlist = await this.wishlistService.isInWishlist(req.user.sub, artworkId);
    return { isInWishlist };
  }

  /**
   * GET /api/wishlist/availability/:artworkId - Get availability notifications for artwork
   * Requirement 2.4: Update availability status when artwork becomes available/unavailable
   */
  @Get('availability/:artworkId')
  async getAvailabilityNotifications(@Param('artworkId') artworkId: string) {
    return this.wishlistService.notifyAvailabilityChange(artworkId);
  }
}
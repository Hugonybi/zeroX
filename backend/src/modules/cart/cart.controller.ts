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
import { CartService } from './cart.service';
import { AddToCartDto, MigrateCartDto, CartCheckoutDto } from './dto';
import { PaystackService } from '@modules/payments/paystack.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly paystackService: PaystackService
  ) {}

  /**
   * GET /api/cart - Get user's cart items
   * Requirement 1.2: Display all cart items with details
   */
  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCartSummary(req.user.sub);
  }

  /**
   * POST /api/cart/items - Add item to cart
   * Requirement 1.1: Add artwork to cart with confirmation
   */
  @Post('items')
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.sub, dto);
  }

  /**
   * DELETE /api/cart/items/:artworkId - Remove item from cart
   * Requirement 1.3: Remove item and update cart immediately
   */
  @Delete('items/:artworkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromCart(@Request() req, @Param('artworkId') artworkId: string) {
    await this.cartService.removeFromCart(req.user.sub, artworkId);
  }

  /**
   * DELETE /api/cart - Clear entire cart
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Request() req) {
    await this.cartService.clearCart(req.user.sub);
  }

  /**
   * POST /api/cart/migrate - Migrate guest cart to authenticated user
   * Requirement 3.4: Migrate cart items when guest creates account
   */
  @Post('migrate')
  async migrateCart(@Request() req, @Body() dto: MigrateCartDto) {
    return this.cartService.migrateGuestCart(req.user.sub, dto);
  }

  /**
   * GET /api/cart/validate - Validate cart items availability
   * Requirement 1.5: Check availability before operations
   */
  @Get('validate')
  async validateCart(@Request() req) {
    return this.cartService.validateCartItems(req.user.sub);
  }

  /**
   * GET /api/cart/check/:artworkId - Check if artwork is in cart
   */
  @Get('check/:artworkId')
  async checkInCart(@Request() req, @Param('artworkId') artworkId: string) {
    const isInCart = await this.cartService.isInCart(req.user.sub, artworkId);
    return { isInCart };
  }

  /**
   * GET /api/cart/expiring - Get cart items that will expire soon
   * Requirement 6.5: Warning notifications 2 hours before expiry
   */
  @Get('expiring')
  async getExpiringItems(@Request() req) {
    return this.cartService.getExpiringCartItems(req.user.sub);
  }

  /**
   * POST /api/cart/checkout - Process cart checkout
   * Requirement 4.1, 4.2: Create individual orders for each cart item
   */
  @Post('checkout')
  async checkoutCart(@Request() req, @Body() dto: CartCheckoutDto) {
    const userId = req.user.sub;
    
    // Process cart checkout to create individual orders
    const checkoutResult = await this.cartService.processCartCheckout(
      userId,
      dto.paymentProvider,
      dto.shippingAddress,
      dto.shippingMethod
    );

    // If using Paystack, initialize payment for the total amount
    if (dto.paymentProvider === 'paystack' && checkoutResult.orders.length > 0) {
      // Get user email for payment
      const userEmail = await this.getUserEmail(userId);
      
      const paystackResponse = await this.paystackService.initializeTransaction({
        email: userEmail,
        amount: checkoutResult.totalAmount,
        currency: checkoutResult.currency,
        reference: checkoutResult.sessionId,
        metadata: { 
          sessionId: checkoutResult.sessionId,
          orderIds: checkoutResult.orders.map(o => o.id),
          type: 'cart_checkout'
        }
      });

      return {
        orders: checkoutResult.orders,
        sessionId: checkoutResult.sessionId,
        payment: paystackResponse,
        totalAmount: checkoutResult.totalAmount,
        currency: checkoutResult.currency
      };
    }

    return checkoutResult;
  }

  /**
   * GET /api/cart/checkout/:sessionId - Get consolidated checkout status
   * Requirement 4.4: Consolidated order status display
   */
  @Get('checkout/:sessionId')
  async getCheckoutStatus(@Request() req, @Param('sessionId') sessionId: string) {
    const userId = req.user.sub;
    
    // Get all orders for this checkout session
    const orders = await this.getOrdersBySession(sessionId, userId);
    
    const totalOrders = orders.length;
    const successfulOrders = orders.filter(o => o.paymentStatus === 'paid').length;
    const failedOrders = orders.filter(o => o.paymentStatus === 'failed').length;
    
    let overallStatus: 'processing' | 'completed' | 'partial_failure' | 'failed';
    if (successfulOrders === totalOrders) {
      overallStatus = 'completed';
    } else if (successfulOrders > 0) {
      overallStatus = 'partial_failure';
    } else if (failedOrders === totalOrders) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'processing';
    }

    return {
      sessionId,
      orders: orders.map(order => ({
        ...order,
        artwork: order.artwork ? {
          id: order.artwork.id,
          title: order.artwork.title,
          artistName: order.artwork.artist?.name || 'Unknown Artist',
          mediaUrl: order.artwork.mediaUrl,
          type: order.artwork.type,
        } : undefined
      })),
      totalOrders,
      successfulOrders,
      failedOrders,
      overallStatus,
      createdAt: orders[0]?.createdAt || new Date().toISOString()
    };
  }

  private async getUserEmail(userId: string): Promise<string> {
    // This would typically be injected as a service
    // For now, we'll use Prisma directly
    const { PrismaService } = await import('@common/prisma/prisma.service');
    const prisma = new PrismaService();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.email || '';
  }

  private async getOrdersBySession(sessionId: string, userId: string) {
    // Get orders that match the session reference pattern
    const { PrismaService } = await import('@common/prisma/prisma.service');
    const prisma = new PrismaService();
    
    return prisma.order.findMany({
      where: {
        buyerId: userId,
        reference: {
          startsWith: sessionId
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
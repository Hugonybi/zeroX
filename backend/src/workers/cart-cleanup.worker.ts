import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CartService } from '../modules/cart/cart.service';
import { CartCleanupQueueName } from '../queue/queue.constants';

@Injectable()
@Processor(CartCleanupQueueName)
export class CartCleanupWorker {
  private readonly logger = new Logger(CartCleanupWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService
  ) {}

  @Process('cleanup_expired_carts')
  async processCleanup(job: Job): Promise<void> {
    this.logger.log('🧹 Starting cart cleanup job');

    try {
      // Step 1: Send expiration warnings to users with items expiring in 2 hours
      await this.sendExpirationWarnings();

      // Step 2: Clean up expired cart items (older than 24 hours)
      const cleanupResult = await this.cartService.cleanupExpiredCarts();
      this.logger.log(`✅ Cart cleanup completed: ${cleanupResult} expired items removed`);

      // Step 3: Log statistics
      const remainingItems = await this.prisma.cartItem.count();
      this.logger.log(`📊 Remaining cart items: ${remainingItems}`);

    } catch (error) {
      this.logger.error('❌ Cart cleanup job failed:', error);
      throw error;
    }
  }

  /**
   * Send expiration warnings to users with cart items expiring in 2 hours
   * Requirement 6.5: Warning notifications 2 hours before expiry
   */
  private async sendExpirationWarnings(): Promise<void> {
    try {
      const usersWithExpiringCarts = await this.cartService.getUsersWithExpiringCarts();
      
      if (usersWithExpiringCarts.length === 0) {
        this.logger.log('📭 No users have expiring cart items');
        return;
      }

      this.logger.log(`⚠️ Found ${usersWithExpiringCarts.length} users with expiring cart items`);

      for (const userGroup of usersWithExpiringCarts) {
        try {
          await this.sendExpirationNotification(userGroup);
          this.logger.log(`📧 Sent expiration warning to user ${userGroup.userId} (${userGroup.expiringItems.length} items)`);
        } catch (error) {
          this.logger.error(`❌ Failed to send expiration warning to user ${userGroup.userId}:`, error);
          // Continue with other users
        }
      }

    } catch (error) {
      this.logger.error('❌ Failed to process expiration warnings:', error);
      // Don't throw - let cleanup continue
    }
  }

  /**
   * Send expiration notification to a specific user
   * In a real implementation, this would integrate with an email service or notification system
   */
  private async sendExpirationNotification(userGroup: {
    userId: string;
    userEmail: string;
    expiringItems: any[];
  }): Promise<void> {
    // For now, we'll just log the notification
    // In a real implementation, you would:
    // 1. Use an email service (SendGrid, AWS SES, etc.)
    // 2. Create in-app notifications
    // 3. Send push notifications if mobile app exists
    
    const itemTitles = userGroup.expiringItems.map(item => item.artwork.title).join(', ');
    
    this.logger.log(`📧 [NOTIFICATION] To: ${userGroup.userEmail}`);
    this.logger.log(`📧 [NOTIFICATION] Subject: Your cart items will expire soon`);
    this.logger.log(`📧 [NOTIFICATION] Items: ${itemTitles}`);
    this.logger.log(`📧 [NOTIFICATION] Message: ${userGroup.expiringItems.length} items in your cart will expire in 2 hours. Complete your purchase to secure these artworks.`);

    // TODO: Implement actual notification sending
    // Example integration points:
    // - await this.emailService.sendExpirationWarning(userGroup);
    // - await this.notificationService.createInAppNotification(userGroup);
    // - await this.pushNotificationService.sendPushNotification(userGroup);
  }
}
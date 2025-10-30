import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@common/prisma/prisma.service';
import { UsersService } from '@modules/users/users.service';
import { ArtworksService } from '@modules/artworks/artworks.service';
import { OrdersService } from '@modules/orders/orders.service';
import { UserRole, OrderStatus } from '@prisma/client';
import { MintQueueName } from '../../queue/queue.constants';
import {
  AdminDashboardStats,
  AdminUserList,
  AdminArtworkList,
  SystemHealthStatus,
  FailedMintOperation,
  QueueStatus,
} from './interfaces/admin.interfaces';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly artworksService: ArtworksService,
    private readonly ordersService: OrdersService,
    @InjectQueue(MintQueueName) private mintQueue: Queue,
  ) {}

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [userCount, artworkCount, recentOrderCount, failedMintCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.artwork.count(),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      this.prisma.order.count({
        where: {
          orderStatus: {
            in: [OrderStatus.mint_failed, OrderStatus.ownership_mint_failed],
          },
        },
      }),
    ]);

    const queueStatus = await this.getQueueStatus();

    return {
      totalUsers: userCount,
      totalArtworks: artworkCount,
      recentOrders: recentOrderCount,
      failedMints: failedMintCount,
      queueStatus,
    };
  }

  async getAllUsers(
    page: number = 1, 
    limit: number = 50,
    search?: string,
    roleFilter?: UserRole
  ): Promise<AdminUserList> {
    const skip = (page - 1) * limit;
    
    // Build where clause for search and filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (roleFilter) {
      where.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          kycStatus: true,
          createdAt: true,
          _count: {
            select: {
              artworks: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    // Get current user to validate role transition
    const currentUser = await this.usersService.findById(userId);
    const oldRole = currentUser.role;
    
    // Validate role transition (basic validation)
    this.validateRoleTransition(oldRole, newRole);
    
    // Update the user role
    await this.usersService.update(userId, { role: newRole });
    
    // Log the admin action
    await this.logAdminAction('user_role_change', userId, { 
      oldRole, 
      newRole,
      userEmail: currentUser.email 
    });
  }

  private validateRoleTransition(oldRole: UserRole, newRole: UserRole): void {
    // Basic validation - prevent invalid transitions
    // For now, allow all transitions but could add business rules here
    if (oldRole === newRole) {
      throw new BadRequestException('User already has this role');
    }
    
    // Could add more specific validation rules here, such as:
    // - Preventing demotion of the last admin
    // - Requiring additional verification for admin promotions
    // - Checking if user meets requirements for artist role
  }

  async getAllArtworks(
    page: number = 1, 
    limit: number = 50,
    search?: string
  ): Promise<AdminArtworkList> {
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { artist: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }},
      ];
    }

    const [artworks, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        skip,
        take: limit,
        include: {
          artist: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return { artworks, total, page, limit };
  }

  async getFailedMints(): Promise<FailedMintOperation[]> {
    const failedOrders = await this.prisma.order.findMany({
      where: {
        orderStatus: {
          in: [OrderStatus.mint_failed, OrderStatus.ownership_mint_failed],
        },
      },
      include: {
        artwork: { select: { title: true, artistId: true } },
        buyer: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return failedOrders.map((order) => ({
      id: order.id,
      orderId: order.id,
      artworkTitle: order.artwork.title,
      buyerEmail: order.buyer.email,
      failureReason: order.orderStatus,
      lastAttempt: order.updatedAt,
      retryCount: 0, // TODO: Track retry count in future enhancement
    }));
  }

  async retryMinting(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { artwork: true, buyer: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Reset order status and re-queue
    await this.prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: OrderStatus.processing },
    });

    // Re-add to mint queue
    await this.mintQueue.add('mint', {
      orderId: order.id,
      artworkId: order.artwork.id,
      metadata: this.buildMintMetadata(order),
    });

    await this.logAdminAction('mint_retry', orderId, { reason: 'admin_retry' });
  }

  async getSystemHealth(): Promise<SystemHealthStatus> {
    const queueStatus = await this.getQueueStatus();
    const recentErrors = await this.getRecentErrors();

    return {
      database: 'healthy', // Could add actual DB health check
      queue: queueStatus.failed > 10 ? 'warning' : 'healthy',
      externalServices: 'healthy', // Could add Hedera/Paystack health checks
      recentErrors: recentErrors.length,
      lastChecked: new Date(),
    };
  }

  private async getQueueStatus(): Promise<QueueStatus> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.mintQueue.getWaiting(),
      this.mintQueue.getActive(),
      this.mintQueue.getCompleted(),
      this.mintQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  private async getRecentErrors(): Promise<any[]> {
    // Get recent audit logs with error actions
    return this.prisma.auditLog.findMany({
      where: {
        action: { contains: 'error' },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  private buildMintMetadata(order: any): any {
    return {
      orderId: order.id,
      artworkId: order.artwork.id,
      buyerId: order.buyer.id,
      artworkTitle: order.artwork.title,
      artworkType: order.artwork.type,
    };
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    actionFilter?: string,
    entityTypeFilter?: string,
  ): Promise<{
    logs: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (actionFilter) {
      where.action = { contains: actionFilter, mode: 'insensitive' };
    }
    if (entityTypeFilter) {
      where.entityType = entityTypeFilter;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }

  private async logAdminAction(action: string, entityId: string, metadata: any): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'admin_action',
        entityId,
        action,
        metaJson: metadata,
      },
    });
  }
}
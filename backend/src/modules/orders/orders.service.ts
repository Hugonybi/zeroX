import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { PaystackService } from '@modules/payments/paystack.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentProvider } from './orders.types';
import { randomUUID } from 'crypto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MintQueueName } from '../../queue/queue.constants';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    @InjectQueue(MintQueueName) private mintQueue: Queue,
  ) {}

  async createCheckout(buyerId: string, dto: CreateOrderDto) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id: dto.artworkId } });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    // Determine quantity
    const quantity = dto.quantity || 1;

    // Check inventory availability
    if (artwork.availableQuantity < quantity) {
      throw new Error(`Insufficient inventory. Only ${artwork.availableQuantity} available.`);
    }

    // Calculate pricing
    const unitPriceCents = artwork.priceCents;
    const subtotalCents = unitPriceCents * quantity;
    const shippingCents = dto.shippingMethod ? this.calculateShipping(dto.shippingMethod, artwork.type) : 0;
    const taxCents = 0; // Tax calculation can be added later
    const totalCents = subtotalCents + shippingCents + taxCents;

    const reference = randomUUID();

    // Reserve inventory
    await this.prisma.artwork.update({
      where: { id: artwork.id },
      data: {
        availableQuantity: artwork.availableQuantity - quantity,
        reservedQuantity: artwork.reservedQuantity + quantity,
      },
    });

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        artworkId: artwork.id,
        amountCents: subtotalCents,
        currency: artwork.currency,
        paymentProvider: dto.paymentProvider,
        reference,
        quantity,
        unitPriceCents,
        shippingCents,
        taxCents,
        totalCents,
        shippingAddress: dto.shippingAddress ? (dto.shippingAddress as any) : undefined,
        shippingMethod: dto.shippingMethod,
      }
    });

    if (dto.paymentProvider === PaymentProvider.paystack) {
      const paystackResponse = await this.paystack.initializeTransaction({
        email: await this.resolveBuyerEmail(buyerId),
        amount: totalCents,
        currency: artwork.currency,
        reference,
        metadata: { orderId: order.id, artworkId: artwork.id, quantity }
      });

      return { order, payment: paystackResponse };
    }

    return { order };
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

  async resolveBuyerEmail(buyerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: buyerId } });
    if (!user) {
      throw new NotFoundException('Buyer not found');
    }
    return user.email;
  }

  findByReference(reference: string) {
    return this.prisma.order.findUnique({ where: { reference } });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        artwork: true,
        buyer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify the user owns this order or is the artist/admin
    if (order.buyerId !== userId && order.artwork.artistId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: {
        artwork: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  updatePaymentStatus(reference: string, paymentStatus: PaymentStatus, orderStatus: OrderStatus) {
    return this.prisma.order.update({
      where: { reference },
      data: {
        paymentStatus,
        orderStatus
      }
    });
  }

  // TEST METHOD - Complete order and trigger minting without payment
  async testCompleteOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { artwork: true, buyer: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Mark order as paid and processing
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.paid,
        orderStatus: OrderStatus.processing,
      },
    });

    // Prepare metadata for minting
    const metadata = {
      name: order.artwork.title,
      description: order.artwork.description,
      image: order.artwork.mediaUrl,
      mediaUrl: order.artwork.mediaUrl,
      artworkId: order.artwork.id,
      orderId: order.id,
      buyerEmail: order.buyer.email,
      buyerName: order.buyer.name,
      priceCents: order.amountCents,
      currency: order.currency,
      type: order.artwork.type,
      // Artist-defined serial number (e.g., "ART-2024-001" or "Edition 5 of 10")
      // This is different from the Hedera NFT serial which is auto-assigned during minting
      serialNumber: order.artwork.serialNumber,
      edition: order.artwork.edition,
    };

    // Enqueue minting job with proper payload
    await this.mintQueue.add('mint', {
      orderId: order.id,
      artworkId: order.artwork.id,
      metadata,
    });

    return {
      success: true,
      message: 'Order marked as paid and minting job enqueued',
      orderId,
    };
  }
}

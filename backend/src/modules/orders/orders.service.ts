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

    const reference = randomUUID();
    const order = await this.prisma.order.create({
      data: {
        buyerId,
        artworkId: artwork.id,
        amountCents: artwork.priceCents,
        currency: artwork.currency,
        paymentProvider: dto.paymentProvider,
        reference
      }
    });

    if (dto.paymentProvider === PaymentProvider.paystack) {
      const paystackResponse = await this.paystack.initializeTransaction({
        email: await this.resolveBuyerEmail(buyerId),
        amount: artwork.priceCents,
        currency: artwork.currency,
        reference,
        metadata: { orderId: order.id, artworkId: artwork.id }
      });

      return { order, payment: paystackResponse };
    }

    return { order };
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

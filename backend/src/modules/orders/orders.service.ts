import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { PaystackService } from '@modules/payments/paystack.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentProvider } from './orders.types';
import { randomUUID } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly paystack: PaystackService) {}

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

  updatePaymentStatus(reference: string, paymentStatus: PaymentStatus, orderStatus: OrderStatus) {
    return this.prisma.order.update({
      where: { reference },
      data: {
        paymentStatus,
        orderStatus
      }
    });
  }
}

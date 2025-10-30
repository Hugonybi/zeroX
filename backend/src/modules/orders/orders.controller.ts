import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { TestCompleteOrderDto } from './dto/test-complete-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  @Post('checkout')
  createCheckout(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = req.user as { userId: string };
    return this.ordersService.createCheckout(user.userId, dto);
  }

  // TEST ENDPOINT - Complete order without payment (for testing only)
  @UseGuards(JwtAuthGuard)
  @Post('test/complete-order')
  async testCompleteOrder(@Body() dto: TestCompleteOrderDto) {
    return this.ordersService.testCompleteOrder(dto.orderId);
  }
}

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('buyer')
  @Post('checkout')
  createCheckout(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = req.user as { userId: string };
    return this.ordersService.createCheckout(user.userId, dto);
  }
}

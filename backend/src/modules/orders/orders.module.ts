import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [PrismaModule, PaymentsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService]
})
export class OrdersModule {}

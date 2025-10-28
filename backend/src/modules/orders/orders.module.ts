import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '@common/prisma/prisma.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MintQueueName } from '../../queue/queue.constants';

@Module({
  imports: [
    PrismaModule,
    PaymentsModule,
    BullModule.registerQueue({
      name: MintQueueName,
    }),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService]
})
export class OrdersModule {}

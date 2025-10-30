import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { ArtworksModule } from '@modules/artworks/artworks.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { MintQueueName } from '../../queue/queue.constants';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ArtworksModule,
    OrdersModule,
    BullModule.registerQueue({
      name: MintQueueName,
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
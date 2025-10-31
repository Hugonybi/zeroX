import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CacheModule } from '@common/cache/cache.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [PrismaModule, CacheModule, PaymentsModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
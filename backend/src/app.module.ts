import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { PrismaModule } from '@common/prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ArtworksModule } from '@modules/artworks/artworks.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { QueueModule } from './queue/queue.module';
import { IpfsModule } from '@modules/ipfs/ipfs.module';
import { HederaModule } from '@modules/hedera/hedera.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ArtworksModule,
    OrdersModule,
    PaymentsModule,
    QueueModule,
    IpfsModule,
    HederaModule
  ]
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { TokenizationModule } from '@modules/tokenization/tokenization.module';
import { AdminModule } from '@modules/admin/admin.module';
import { ArtistsModule } from '@modules/artists/artists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema
    }),
    // Rate limiting: 100 requests per minute per IP (global default)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ArtworksModule,
    OrdersModule,
    PaymentsModule,
    QueueModule,
    IpfsModule,
    HederaModule,
    TokenizationModule,
    AdminModule,
    ArtistsModule
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

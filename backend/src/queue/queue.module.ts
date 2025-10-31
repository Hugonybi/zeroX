import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueInitializationService } from './queue-initialization.service';
import { MintQueueName, CartCleanupQueueName } from './queue.constants';
import { MintAuthenticityWorker } from '../workers/mint-authenticity.worker';
import { CartCleanupWorker } from '../workers/cart-cleanup.worker';
import { HederaModule } from '../modules/hedera/hedera.module';
import { PinataModule } from '../modules/pinata/pinata.module';
import { TokenizationModule } from '../modules/tokenization/tokenization.module';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { CartModule } from '../modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port')
        }
      }),
      inject: [ConfigService]
    }),
    BullModule.registerQueue({
      name: MintQueueName
    }),
    BullModule.registerQueue({
      name: CartCleanupQueueName
    }),
    PrismaModule,
    HederaModule,
    PinataModule,
    TokenizationModule,
    CartModule
  ],
  providers: [QueueService, QueueInitializationService, MintAuthenticityWorker, CartCleanupWorker],
  exports: [QueueService, BullModule]
})
export class QueueModule {}

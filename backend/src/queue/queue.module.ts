import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { MintQueueName } from './queue.constants';
import { MintAuthenticityWorker } from '../workers/mint-authenticity.worker';
import { HederaModule } from '../modules/hedera/hedera.module';
import { PinataModule } from '../modules/pinata/pinata.module';
import { TokenizationModule } from '../modules/tokenization/tokenization.module';
import { PrismaModule } from '../modules/prisma/prisma.module';

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
    PrismaModule,
    HederaModule,
    PinataModule,
    TokenizationModule
  ],
  providers: [QueueService, MintAuthenticityWorker],
  exports: [QueueService, BullModule]
})
export class QueueModule {}

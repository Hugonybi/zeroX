import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenizationService } from './tokenization.service';
import { TokenizationController } from './tokenization.controller';
import { HederaModule } from '../hedera/hedera.module';
import { PinataModule } from '../pinata/pinata.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    HederaModule,
    PinataModule,
    PrismaModule
  ],
  controllers: [TokenizationController],
  providers: [TokenizationService],
  exports: [TokenizationService]
})
export class TokenizationModule {}

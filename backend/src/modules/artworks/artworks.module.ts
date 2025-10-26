import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { ArtworksService } from './artworks.service';
import { ArtworksController, MarketplaceController } from './artworks.controller';
import { ArtworksProxyController } from './artworks-proxy.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ArtworksController, MarketplaceController, ArtworksProxyController],
  providers: [ArtworksService],
  exports: [ArtworksService]
})
export class ArtworksModule {}

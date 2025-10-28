import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtworkStatus, Prisma, Artwork } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@Injectable()
export class ArtworksService {
  private readonly apiBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('apiBaseUrl', 'http://localhost:4000');
  }

  /**
   * Transforms Azure Blob Storage URLs to use the backend proxy to avoid CORS issues.
   * Example: https://zerox.blob.core.windows.net/artwork/image.jpg
   * becomes: http://localhost:4000/proxy/image/zerox.blob.core.windows.net/artwork/image.jpg
   */
  private transformAzureUrl(url: string | null): string | null {
    if (!url || !url.startsWith('https://') || !url.includes('.blob.core.windows.net')) {
      return url;
    }

    // Extract the part after https://
    const pathAfterProtocol = url.replace('https://', '');
    return `${this.apiBaseUrl}/proxy/image/${pathAfterProtocol}`;
  }

  /**
   * Transforms an artwork object to use proxied URLs for media.
   */
  private transformArtwork(artwork: Artwork): Artwork {
    const transformed = { ...artwork };
    if (artwork.mediaUrl) {
      transformed.mediaUrl = this.transformAzureUrl(artwork.mediaUrl) || artwork.mediaUrl;
    }
    if (artwork.metadataUrl) {
      transformed.metadataUrl = this.transformAzureUrl(artwork.metadataUrl) || artwork.metadataUrl;
    }
    return transformed;
  }

  async create(artistId: string, dto: CreateArtworkDto) {
    const artwork = await this.prisma.artwork.create({
      data: {
        artistId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        mediaUrl: dto.mediaUrl,
        metadataUrl: dto.metadataUrl,
        serialNumber: dto.serialNumber,
        edition: dto.edition,
        priceCents: dto.priceCents,
        currency: dto.currency,
        status: dto.status ?? ArtworkStatus.draft
      }
    });
    return this.transformArtwork(artwork);
  }

  async findById(id: string) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    return this.transformArtwork(artwork);
  }

  async update(id: string, dto: UpdateArtworkDto) {
    await this.findById(id);
    const data: Prisma.ArtworkUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.mediaUrl !== undefined) data.mediaUrl = dto.mediaUrl;
    if (dto.metadataUrl !== undefined) data.metadataUrl = dto.metadataUrl;
    if (dto.serialNumber !== undefined) data.serialNumber = dto.serialNumber;
    if (dto.edition !== undefined) data.edition = dto.edition;
    if (dto.priceCents !== undefined) data.priceCents = dto.priceCents;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.status !== undefined) data.status = dto.status;
    const artwork = await this.prisma.artwork.update({ where: { id }, data });
    return this.transformArtwork(artwork);
  }

  async findPublished(filters: {
    type?: string;
    artist?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const where: Prisma.ArtworkWhereInput = { status: ArtworkStatus.published };
    if (filters.type) {
      where.type = filters.type as Prisma.EnumArtworkTypeFilter;
    }
    if (filters.artist) {
      where.artistId = filters.artist;
    }
    if (filters.minPrice && filters.maxPrice) {
      where.priceCents = { gte: filters.minPrice, lte: filters.maxPrice };
    } else if (filters.minPrice) {
      where.priceCents = { gte: filters.minPrice };
    } else if (filters.maxPrice) {
      where.priceCents = { lte: filters.maxPrice };
    }
    const artworks = await this.prisma.artwork.findMany({ where, orderBy: { createdAt: 'desc' } });
    return artworks.map(artwork => this.transformArtwork(artwork));
  }

  async findPublishedById(id: string) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id, status: ArtworkStatus.published } });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    return this.transformArtwork(artwork);
  }
}

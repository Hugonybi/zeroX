import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtworkStatus, Prisma, Artwork } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { SearchArtworksDto } from './dto/search-artworks.dto';

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
        status: dto.status ?? ArtworkStatus.draft,
        // Enhanced fields
        medium: dto.medium,
        category: dto.category,
        tags: dto.tags || [],
        yearCreated: dto.yearCreated,
        dimensionHeight: dto.dimensionHeight,
        dimensionWidth: dto.dimensionWidth,
        dimensionDepth: dto.dimensionDepth,
        dimensionUnit: dto.dimensionUnit || 'cm',
        isUnique: dto.isUnique ?? true,
        totalQuantity: dto.totalQuantity ?? 1,
        availableQuantity: dto.availableQuantity ?? (dto.totalQuantity ?? 1),
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

  async searchArtworks(dto: SearchArtworksDto) {
    const {
      query,
      minPrice,
      maxPrice,
      type,
      category,
      artistId,
      sortBy = 'date_desc',
      page = 1,
      limit = 20,
    } = dto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ArtworkWhereInput = {
      status: ArtworkStatus.published,
    };

    // Text search on title, description, and artist name
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { medium: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
        {
          artist: {
            name: { contains: query, mode: 'insensitive' },
          },
        },
      ];
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceCents = {};
      if (minPrice !== undefined) {
        where.priceCents.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.priceCents.lte = maxPrice;
      }
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Artist filter
    if (artistId) {
      where.artistId = artistId;
    }

    // Build orderBy clause
    let orderBy: Prisma.ArtworkOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { priceCents: 'asc' };
        break;
      case 'price_desc':
        orderBy = { priceCents: 'desc' };
        break;
      case 'date_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'date_desc':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Execute query with pagination
    const [artworks, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return {
      artworks: artworks.map(artwork => this.transformArtwork(artwork)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateInventory(artworkId: string, quantityChange: number) {
    const artwork = await this.findById(artworkId);
    
    const newAvailableQuantity = artwork.availableQuantity + quantityChange;
    
    if (newAvailableQuantity < 0) {
      throw new Error('Insufficient inventory');
    }

    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: {
        availableQuantity: newAvailableQuantity,
      },
    });
  }

  async reserveInventory(artworkId: string, quantity: number) {
    const artwork = await this.findById(artworkId);
    
    if (artwork.availableQuantity < quantity) {
      throw new Error('Insufficient inventory available');
    }

    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: {
        availableQuantity: artwork.availableQuantity - quantity,
        reservedQuantity: artwork.reservedQuantity + quantity,
      },
    });
  }

  async releaseReservedInventory(artworkId: string, quantity: number) {
    const artwork = await this.findById(artworkId);

    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: {
        availableQuantity: artwork.availableQuantity + quantity,
        reservedQuantity: Math.max(0, artwork.reservedQuantity - quantity),
      },
    });
  }

  async confirmSale(artworkId: string, quantity: number) {
    const artwork = await this.findById(artworkId);

    return this.prisma.artwork.update({
      where: { id: artworkId },
      data: {
        reservedQuantity: Math.max(0, artwork.reservedQuantity - quantity),
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { ArtworkStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(artistId: string, dto: CreateArtworkDto) {
    return this.prisma.artwork.create({
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
  }

  async findById(id: string) {
    const artwork = await this.prisma.artwork.findUnique({ where: { id } });
    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }
    return artwork;
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
    return this.prisma.artwork.update({ where: { id }, data });
  }

  findPublished(filters: {
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
    return this.prisma.artwork.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}

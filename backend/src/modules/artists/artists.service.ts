import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateArtistProfileDto } from './dto/create-artist-profile.dto';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateArtistProfileDto) {
    return this.prisma.artistProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return profile;
  }

  async getProfileById(profileId: string) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateArtistProfileDto) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return this.prisma.artistProfile.update({
      where: { userId },
      data: dto,
    });
  }

  async getArtistPortfolio(userId: string, includeStats = true) {
    const artworks = await this.prisma.artwork.findMany({
      where: {
        artistId: userId,
        status: 'published',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!includeStats) {
      return { artworks };
    }

    const stats = {
      totalArtworks: artworks.length,
      availableArtworks: artworks.filter(a => a.availableQuantity > 0).length,
      soldArtworks: artworks.filter(a => a.availableQuantity === 0).length,
    };

    return { artworks, stats };
  }

  async getAllArtistProfiles(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.prisma.artistProfile.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artistProfile.count(),
    ]);

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

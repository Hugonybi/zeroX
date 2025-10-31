import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from '../src/modules/wishlist/wishlist.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ArtworkStatus } from '@prisma/client';

describe('WishlistService', () => {
  let service: WishlistService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    artwork: {
      findUnique: jest.fn(),
    },
    wishlistItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockArtwork = {
    id: 'artwork-1',
    title: 'Test Artwork',
    status: ArtworkStatus.published,
    availableQuantity: 5,
    price: 100,
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockWishlistItem = {
    id: 'wishlist-1',
    userId: 'user-1',
    artworkId: 'artwork-1',
    createdAt: new Date(),
    artwork: mockArtwork,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../src/modules/admin/admin.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { UsersService } from '../src/modules/users/users.service';
import { ArtworksService } from '../src/modules/artworks/artworks.service';
import { OrdersService } from '../src/modules/orders/orders.service';
import { getQueueToken } from '@nestjs/bull';
import { UserRole } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    artwork: {
      count: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockQueue = {
    getWaiting: jest.fn().mockResolvedValue([]),
    getActive: jest.fn().mockResolvedValue([]),
    getCompleted: jest.fn().mockResolvedValue([]),
    getFailed: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ArtworksService,
          useValue: {},
        },
        {
          provide: OrdersService,
          useValue: {},
        },
        {
          provide: getQueueToken('mint_authenticity'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return paginated users with search', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.buyer,
          kycStatus: 'pending',
          createdAt: new Date(),
          _count: { artworks: 0, orders: 1 },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.getAllUsers(1, 50, 'test', UserRole.buyer);

      expect(result).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        limit: 50,
      });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { name: { contains: 'test', mode: 'insensitive' } },
          ],
          role: UserRole.buyer,
        },
        skip: 0,
        take: 50,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          kycStatus: true,
          createdAt: true,
          _count: {
            select: {
              artworks: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role and log action', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.buyer,
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.updateUserRole('1', UserRole.artist);

      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
      expect(mockUsersService.update).toHaveBeenCalledWith('1', { role: UserRole.artist });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          entityType: 'admin_action',
          entityId: '1',
          action: 'user_role_change',
          metaJson: {
            oldRole: UserRole.buyer,
            newRole: UserRole.artist,
            userEmail: 'test@example.com',
          },
        },
      });
    });

    it('should throw error when trying to set same role', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.buyer,
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      await expect(service.updateUserRole('1', UserRole.buyer)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
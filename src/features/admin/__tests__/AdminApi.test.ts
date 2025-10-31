import { adminApi } from '../api';
import { createHttpClient } from '../../../lib/http';
import { handleAdminApiError } from '../errors';

// Mock the HTTP client
jest.mock('../../../lib/http');
const mockCreateHttpClient = createHttpClient as jest.MockedFunction<typeof createHttpClient>;

// Mock error handler
jest.mock('../errors');
const mockHandleAdminApiError = handleAdminApiError as jest.MockedFunction<typeof handleAdminApiError>;

describe('AdminApiClient', () => {
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    mockCreateHttpClient.mockReturnValue(mockHttpClient);
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats = {
        totalUsers: 100,
        totalArtworks: 50,
        recentOrders: 10,
        failedMints: 2,
        queueStatus: {
          waiting: 5,
          active: 2,
          completed: 100,
          failed: 2,
        },
      };

      mockHttpClient.get.mockResolvedValue(mockStats);

      const result = await adminApi.getDashboardStats();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/admin/dashboard');
      expect(result).toEqual(mockStats);
    });

    it('should handle dashboard stats error', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(mockError);
      mockHandleAdminApiError.mockImplementation(() => {
        throw mockError;
      });

      await expect(adminApi.getDashboardStats()).rejects.toThrow('Network error');
      expect(mockHandleAdminApiError).toHaveBeenCalledWith(mockError, '/admin/dashboard');
    });
  });

  describe('getAllUsers', () => {
    it('should fetch users with pagination', async () => {
      const mockUserList = {
        users: [
          {
            id: 'user1',
            email: 'user1@example.com',
            name: 'User One',
            role: 'buyer',
            kycStatus: 'approved',
            createdAt: '2023-01-01T00:00:00Z',
            _count: { artworks: 0, orders: 5 },
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      };

      mockHttpClient.get.mockResolvedValue(mockUserList);

      const result = await adminApi.getAllUsers(1, 50);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/admin/users?page=1&limit=50');
      expect(result).toEqual(mockUserList);
    });

    it('should use default pagination parameters', async () => {
      const mockUserList = {
        users: [],
        total: 0,
        page: 1,
        limit: 50,
      };

      mockHttpClient.get.mockResolvedValue(mockUserList);

      await adminApi.getAllUsers();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/admin/users?page=1&limit=50');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      mockHttpClient.put.mockResolvedValue(undefined);

      await adminApi.updateUserRole('user1', { role: 'admin' });

      expect(mockHttpClient.put).toHaveBeenCalledWith('/admin/users/user1/role', { role: 'admin' });
    });

    it('should handle role update error', async () => {
      const mockError = new Error('Forbidden');
      mockHttpClient.put.mockRejectedValue(mockError);
      mockHandleAdminApiError.mockImplementation(() => {
        throw mockError;
      });

      await expect(adminApi.updateUserRole('user1', { role: 'admin' })).rejects.toThrow('Forbidden');
      expect(mockHandleAdminApiError).toHaveBeenCalledWith(mockError, '/admin/users/user1/role');
    });
  });

  describe('getFailedMints', () => {
    it('should fetch failed mints successfully', async () => {
      const mockFailedMints = [
        {
          id: 'order1',
          orderStatus: 'mint_failed',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T01:00:00Z',
          artwork: {
            title: 'Test Artwork',
            artistId: 'artist1',
          },
          buyer: {
            name: 'Test Buyer',
            email: 'buyer@example.com',
          },
        },
      ];

      mockHttpClient.get.mockResolvedValue(mockFailedMints);

      const result = await adminApi.getFailedMints();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/admin/orders/failed-mints');
      expect(result).toEqual(mockFailedMints);
    });
  });

  describe('retryMinting', () => {
    it('should retry minting successfully', async () => {
      mockHttpClient.post.mockResolvedValue(undefined);

      await adminApi.retryMinting('order1');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/admin/orders/order1/retry-mint');
    });
  });

  describe('getSystemHealth', () => {
    it('should fetch system health successfully', async () => {
      const mockHealth = {
        database: 'healthy' as const,
        queue: 'healthy' as const,
        externalServices: 'healthy' as const,
        recentErrors: 0,
        lastChecked: '2023-01-01T00:00:00Z',
      };

      mockHttpClient.get.mockResolvedValue(mockHealth);

      const result = await adminApi.getSystemHealth();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/admin/system/health');
      expect(result).toEqual(mockHealth);
    });
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with filters', async () => {
      const mockLogs = {
        logs: [
          {
            id: 'log1',
            entityType: 'user',
            entityId: 'user1',
            action: 'role_change',
            metaJson: { newRole: 'admin' },
            createdAt: '2023-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      };

      mockHttpClient.get.mockResolvedValue(mockLogs);

      const result = await adminApi.getAuditLogs(1, 50, 'role_change', 'user');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/admin/audit-logs?page=1&limit=50&action=role_change&entityType=user'
      );
      expect(result).toEqual(mockLogs);
    });

    it('should fetch audit logs without filters', async () => {
      const mockLogs = {
        logs: [],
        total: 0,
        page: 1,
        limit: 50,
      };

      mockHttpClient.get.mockResolvedValue(mockLogs);

      await adminApi.getAuditLogs();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/admin/audit-logs?page=1&limit=50');
    });
  });
});
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminProvider, useAdminContext } from '../AdminContext';
import { adminApi } from '../api';
import type { AdminDashboardStats, AdminUserList } from '../types';

// Mock the admin API
jest.mock('../api');
const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

// Test component that uses the admin context
function TestComponent() {
  const {
    dashboardStats,
    isDashboardLoading,
    dashboardError,
    fetchDashboardStats,
    userList,
    isUsersLoading,
    usersError,
    fetchUsers,
    updateUserRole,
    refreshAll,
  } = useAdminContext();

  return (
    <div>
      <div data-testid="dashboard-loading">{isDashboardLoading.toString()}</div>
      <div data-testid="dashboard-error">{dashboardError?.message || 'none'}</div>
      <div data-testid="dashboard-stats">{JSON.stringify(dashboardStats)}</div>
      
      <div data-testid="users-loading">{isUsersLoading.toString()}</div>
      <div data-testid="users-error">{usersError?.message || 'none'}</div>
      <div data-testid="users-count">{userList?.users.length || 0}</div>
      
      <button onClick={fetchDashboardStats} data-testid="fetch-dashboard">
        Fetch Dashboard
      </button>
      <button onClick={() => fetchUsers(1, 50)} data-testid="fetch-users">
        Fetch Users
      </button>
      <button onClick={() => updateUserRole('user1', 'admin')} data-testid="update-role">
        Update Role
      </button>
      <button onClick={refreshAll} data-testid="refresh-all">
        Refresh All
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AdminProvider>
      <TestComponent />
    </AdminProvider>
  );
}

describe('AdminContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Stats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats: AdminDashboardStats = {
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

      mockAdminApi.getDashboardStats.mockResolvedValue(mockStats);

      renderWithProvider();

      const fetchButton = screen.getByTestId('fetch-dashboard');
      
      // Initially not loading
      expect(screen.getByTestId('dashboard-loading')).toHaveTextContent('false');
      
      // Click fetch button
      await act(async () => {
        await userEvent.click(fetchButton);
      });

      // Should show loading state
      expect(screen.getByTestId('dashboard-loading')).toHaveTextContent('true');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-loading')).toHaveTextContent('false');
      });

      // Should have stats data
      expect(screen.getByTestId('dashboard-stats')).toHaveTextContent(JSON.stringify(mockStats));
      expect(screen.getByTestId('dashboard-error')).toHaveTextContent('none');
    });

    it('should handle dashboard stats error', async () => {
      const mockError = new Error('Failed to fetch dashboard stats');
      mockAdminApi.getDashboardStats.mockRejectedValue(mockError);

      renderWithProvider();

      const fetchButton = screen.getByTestId('fetch-dashboard');
      
      await act(async () => {
        await userEvent.click(fetchButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toHaveTextContent(mockError.message);
      });

      expect(screen.getByTestId('dashboard-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('dashboard-stats')).toHaveTextContent('null');
    });
  });

  describe('User Management', () => {
    it('should fetch users successfully', async () => {
      const mockUserList: AdminUserList = {
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
          {
            id: 'user2',
            email: 'user2@example.com',
            name: 'User Two',
            role: 'artist',
            kycStatus: 'pending',
            createdAt: '2023-01-02T00:00:00Z',
            _count: { artworks: 3, orders: 0 },
          },
        ],
        total: 2,
        page: 1,
        limit: 50,
      };

      mockAdminApi.getAllUsers.mockResolvedValue(mockUserList);

      renderWithProvider();

      const fetchButton = screen.getByTestId('fetch-users');
      
      await act(async () => {
        await userEvent.click(fetchButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('users-count')).toHaveTextContent('2');
      });

      expect(screen.getByTestId('users-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('users-error')).toHaveTextContent('none');
    });

    it('should update user role successfully', async () => {
      const mockUserList: AdminUserList = {
        users: [
          {
            id: 'user1',
            email: 'user1@example.com',
            name: 'User One',
            role: 'admin', // Updated role
            kycStatus: 'approved',
            createdAt: '2023-01-01T00:00:00Z',
            _count: { artworks: 0, orders: 5 },
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      };

      mockAdminApi.updateUserRole.mockResolvedValue();
      mockAdminApi.getAllUsers.mockResolvedValue(mockUserList);

      renderWithProvider();

      const updateButton = screen.getByTestId('update-role');
      
      await act(async () => {
        await userEvent.click(updateButton);
      });

      await waitFor(() => {
        expect(mockAdminApi.updateUserRole).toHaveBeenCalledWith('user1', { role: 'admin' });
      });

      // Should refetch users after update
      expect(mockAdminApi.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('Refresh All', () => {
    it('should refresh all data successfully', async () => {
      const mockStats: AdminDashboardStats = {
        totalUsers: 100,
        totalArtworks: 50,
        recentOrders: 10,
        failedMints: 0,
        queueStatus: {
          waiting: 0,
          active: 0,
          completed: 100,
          failed: 0,
        },
      };

      const mockUserList: AdminUserList = {
        users: [],
        total: 0,
        page: 1,
        limit: 50,
      };

      mockAdminApi.getDashboardStats.mockResolvedValue(mockStats);
      mockAdminApi.getAllUsers.mockResolvedValue(mockUserList);
      mockAdminApi.getFailedMints.mockResolvedValue([]);
      mockAdminApi.getSystemHealth.mockResolvedValue({
        database: 'healthy',
        queue: 'healthy',
        externalServices: 'healthy',
        recentErrors: 0,
        lastChecked: '2023-01-01T00:00:00Z',
      });

      renderWithProvider();

      const refreshButton = screen.getByTestId('refresh-all');
      
      await act(async () => {
        await userEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockAdminApi.getDashboardStats).toHaveBeenCalled();
        expect(mockAdminApi.getFailedMints).toHaveBeenCalled();
        expect(mockAdminApi.getSystemHealth).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle multiple concurrent errors gracefully', async () => {
      const dashboardError = new Error('Dashboard failed');
      const usersError = new Error('Users failed');

      mockAdminApi.getDashboardStats.mockRejectedValue(dashboardError);
      mockAdminApi.getAllUsers.mockRejectedValue(usersError);

      renderWithProvider();

      const dashboardButton = screen.getByTestId('fetch-dashboard');
      const usersButton = screen.getByTestId('fetch-users');
      
      await act(async () => {
        await userEvent.click(dashboardButton);
        await userEvent.click(usersButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toHaveTextContent(dashboardError.message);
        expect(screen.getByTestId('users-error')).toHaveTextContent(usersError.message);
      });
    });
  });
});
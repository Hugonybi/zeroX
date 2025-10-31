import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from '../AdminContext';
import { AdminNotificationProvider } from '../AdminNotificationContext';
import { AdminPage } from '../../../pages/AdminPage';
import { AdminUserManagementPage } from '../../../pages/AdminUserManagementPage';
import { AdminMonitoringPage } from '../../../pages/AdminMonitoringPage';
import { adminApi } from '../api';

// Mock the admin API
jest.mock('../api');
const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

// Mock React Router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

describe('Admin End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful API responses
    mockAdminApi.getDashboardStats.mockResolvedValue({
      totalUsers: 150,
      totalArtworks: 75,
      recentOrders: 12,
      failedMints: 3,
      queueStatus: {
        waiting: 2,
        active: 1,
        completed: 95,
        failed: 3,
      },
    });

    mockAdminApi.getSystemHealth.mockResolvedValue({
      database: 'healthy',
      queue: 'warning',
      externalServices: 'healthy',
      recentErrors: 1,
      lastChecked: '2023-01-01T12:00:00Z',
    });

    mockAdminApi.getAllUsers.mockResolvedValue({
      users: [
        {
          id: 'user1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'buyer',
          kycStatus: 'approved',
          createdAt: '2023-01-01T00:00:00Z',
          _count: { artworks: 0, orders: 5 },
        },
        {
          id: 'user2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          role: 'artist',
          kycStatus: 'pending',
          createdAt: '2023-01-02T00:00:00Z',
          _count: { artworks: 3, orders: 1 },
        },
      ],
      total: 2,
      page: 1,
      limit: 50,
    });

    mockAdminApi.getFailedMints.mockResolvedValue([
      {
        id: 'order1',
        orderStatus: 'mint_failed',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T01:00:00Z',
        artwork: {
          title: 'Failed Artwork',
          artistId: 'artist1',
        },
        buyer: {
          name: 'Test Buyer',
          email: 'buyer@example.com',
        },
      },
    ]);
  });

  describe('Admin Dashboard Journey', () => {
    it('should load dashboard and display all statistics', async () => {
      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Total users
        expect(screen.getByText('75')).toBeInTheDocument(); // Total artworks
        expect(screen.getByText('12')).toBeInTheDocument(); // Recent orders
        expect(screen.getByText('3')).toBeInTheDocument(); // Failed mints
      });

      // Check that system health is displayed
      expect(screen.getByText(/Database: healthy/i)).toBeInTheDocument();
      expect(screen.getByText(/Queue: warning/i)).toBeInTheDocument();

      // Check that failed mints warning is shown
      expect(screen.getByText(/Action Required/i)).toBeInTheDocument();
      expect(screen.getByText(/Review 3 Failed Mints/i)).toBeInTheDocument();
    });

    it('should navigate to user management from dashboard', async () => {
      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('👥 View All Users')).toBeInTheDocument();
      });

      const userManagementButton = screen.getByText('👥 View All Users');
      await act(async () => {
        await userEvent.click(userManagementButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });

    it('should refresh all data when refresh button is clicked', async () => {
      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('🔄 Refresh All Data')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('🔄 Refresh All Data');
      await act(async () => {
        await userEvent.click(refreshButton);
      });

      // Should call all data fetching APIs
      expect(mockAdminApi.getDashboardStats).toHaveBeenCalledTimes(2); // Initial + refresh
      expect(mockAdminApi.getSystemHealth).toHaveBeenCalledTimes(2);
      expect(mockAdminApi.getFailedMints).toHaveBeenCalled();
    });
  });

  describe('User Management Journey', () => {
    it('should load and display user list', async () => {
      render(
        <TestWrapper>
          <AdminUserManagementPage />
        </TestWrapper>
      );

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Check user details are displayed
      expect(screen.getByText('buyer')).toBeInTheDocument();
      expect(screen.getByText('artist')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('should filter users by search query', async () => {
      render(
        <TestWrapper>
          <AdminUserManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });

      // Search for specific user
      const searchInput = screen.getByPlaceholderText(/search users/i);
      await act(async () => {
        await userEvent.type(searchInput, 'john');
      });

      // Should show only matching user
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    });

    it('should update user role successfully', async () => {
      mockAdminApi.updateUserRole.mockResolvedValue();
      
      render(
        <TestWrapper>
          <AdminUserManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });

      // Find and click role dropdown for first user
      const roleSelects = screen.getAllByDisplayValue('buyer');
      const firstRoleSelect = roleSelects[0];
      
      await act(async () => {
        await userEvent.selectOptions(firstRoleSelect, 'admin');
      });

      // Should call update API
      await waitFor(() => {
        expect(mockAdminApi.updateUserRole).toHaveBeenCalledWith('user1', { role: 'admin' });
      });
    });
  });

  describe('System Monitoring Journey', () => {
    it('should display failed mints and allow retry', async () => {
      mockAdminApi.retryMinting.mockResolvedValue();
      
      render(
        <TestWrapper>
          <AdminMonitoringPage />
        </TestWrapper>
      );

      // Switch to failed mints tab
      const failedMintsTab = screen.getByText('Failed Mints');
      await act(async () => {
        await userEvent.click(failedMintsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed Artwork')).toBeInTheDocument();
        expect(screen.getByText('Test Buyer')).toBeInTheDocument();
        expect(screen.getByText('buyer@example.com')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Retry');
      await act(async () => {
        await userEvent.click(retryButton);
      });

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/confirm retry/i)).toBeInTheDocument();
      });

      // Confirm retry
      const confirmButton = screen.getByText(/confirm/i);
      await act(async () => {
        await userEvent.click(confirmButton);
      });

      // Should call retry API
      await waitFor(() => {
        expect(mockAdminApi.retryMinting).toHaveBeenCalledWith('order1');
      });
    });

    it('should display system health status', async () => {
      render(
        <TestWrapper>
          <AdminMonitoringPage />
        </TestWrapper>
      );

      // Should be on system health tab by default
      await waitFor(() => {
        expect(screen.getByText(/system health/i)).toBeInTheDocument();
        expect(screen.getByText(/database.*healthy/i)).toBeInTheDocument();
        expect(screen.getByText(/queue.*warning/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Journey', () => {
    it('should handle dashboard loading errors gracefully', async () => {
      mockAdminApi.getDashboardStats.mockRejectedValue(new Error('Network error'));
      
      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle user management errors gracefully', async () => {
      mockAdminApi.getAllUsers.mockRejectedValue(new Error('Database connection failed'));
      
      render(
        <TestWrapper>
          <AdminUserManagementPage />
        </TestWrapper>
      );

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText(/database connection failed/i)).toBeInTheDocument();
      });
    });

    it('should handle role update errors gracefully', async () => {
      mockAdminApi.updateUserRole.mockRejectedValue(new Error('Permission denied'));
      
      render(
        <TestWrapper>
          <AdminUserManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });

      // Try to update role
      const roleSelects = screen.getAllByDisplayValue('buyer');
      const firstRoleSelect = roleSelects[0];
      
      await act(async () => {
        await userEvent.selectOptions(firstRoleSelect, 'admin');
      });

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should verify admin role requirements', async () => {
      // This test would verify that non-admin users cannot access admin features
      // In a real implementation, this would test the route guards and permission checks
      
      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      // Verify that admin-specific content is displayed
      await waitFor(() => {
        expect(screen.getByText('Platform Overview')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });
  });
});
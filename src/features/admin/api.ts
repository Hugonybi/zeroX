import { API_BASE_URL } from '../../config/api';
import { createHttpClient } from '../../lib/http';
import { handleAdminApiError } from './errors';
import type {
  AdminDashboardStats,
  AdminUserList,
  AdminArtworkList,
  FailedMintOperation,
  SystemHealthStatus,
  UpdateUserRolePayload,
  AdminAuditLogList,
} from './types';

const httpClient = createHttpClient(API_BASE_URL);

export class AdminApiClient {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      return await httpClient.get('/admin/dashboard');
    } catch (error) {
      handleAdminApiError(error, '/admin/dashboard');
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 50): Promise<AdminUserList> {
    try {
      return await httpClient.get(`/admin/users?page=${page}&limit=${limit}`);
    } catch (error) {
      handleAdminApiError(error, '/admin/users');
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, payload: UpdateUserRolePayload): Promise<void> {
    try {
      return await httpClient.put(`/admin/users/${userId}/role`, payload);
    } catch (error) {
      handleAdminApiError(error, `/admin/users/${userId}/role`);
    }
  }

  /**
   * Get all artworks with pagination
   */
  async getAllArtworks(page: number = 1, limit: number = 50): Promise<AdminArtworkList> {
    try {
      return await httpClient.get(`/admin/artworks?page=${page}&limit=${limit}`);
    } catch (error) {
      handleAdminApiError(error, '/admin/artworks');
    }
  }

  /**
   * Get failed minting operations
   */
  async getFailedMints(): Promise<FailedMintOperation[]> {
    try {
      return await httpClient.get('/admin/orders/failed-mints');
    } catch (error) {
      handleAdminApiError(error, '/admin/orders/failed-mints');
    }
  }

  /**
   * Retry minting for a failed order
   */
  async retryMinting(orderId: string): Promise<void> {
    try {
      return await httpClient.post(`/admin/orders/${orderId}/retry-mint`);
    } catch (error) {
      handleAdminApiError(error, `/admin/orders/${orderId}/retry-mint`);
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    try {
      return await httpClient.get('/admin/system/health');
    } catch (error) {
      handleAdminApiError(error, '/admin/system/health');
    }
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    actionFilter?: string,
    entityTypeFilter?: string
  ): Promise<AdminAuditLogList> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (actionFilter) {
        params.append('action', actionFilter);
      }
      if (entityTypeFilter) {
        params.append('entityType', entityTypeFilter);
      }

      return await httpClient.get(`/admin/audit-logs?${params.toString()}`);
    } catch (error) {
      handleAdminApiError(error, '/admin/audit-logs');
    }
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
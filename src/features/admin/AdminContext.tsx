import React, { createContext, useContext, useCallback, useState } from 'react';
import { adminApi } from './api';
import { getAdminErrorMessage, getAdminErrorSeverity, isAdminError } from './errors';
import type {
  AdminDashboardStats,
  AdminUserList,
  AdminArtworkList,
  FailedMintOperation,
  SystemHealthStatus,
  UpdateUserRolePayload,
  AdminAuditLogList,
  UserRole,
} from './types';

interface AdminContextState {
  // Loading states
  isLoading: boolean;
  isDashboardLoading: boolean;
  isUsersLoading: boolean;
  isArtworksLoading: boolean;
  isFailedMintsLoading: boolean;
  isSystemHealthLoading: boolean;
  isAuditLogsLoading: boolean;
  
  // Data
  dashboardStats: AdminDashboardStats | null;
  userList: AdminUserList | null;
  artworkList: AdminArtworkList | null;
  failedMints: FailedMintOperation[];
  systemHealth: SystemHealthStatus | null;
  auditLogs: AdminAuditLogList | null;
  
  // Error states
  error: Error | null;
  dashboardError: Error | null;
  usersError: Error | null;
  artworksError: Error | null;
  failedMintsError: Error | null;
  systemHealthError: Error | null;
  auditLogsError: Error | null;
  
  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchArtworks: (page?: number, limit?: number) => Promise<void>;
  fetchFailedMints: () => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchAuditLogs: (page?: number, limit?: number, actionFilter?: string, entityTypeFilter?: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  retryMinting: (orderId: string) => Promise<void>;
  clearError: (errorType?: string) => void;
  refreshAll: () => Promise<void>;
}

const AdminContext = createContext<AdminContextState | null>(null);

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isArtworksLoading, setIsArtworksLoading] = useState(false);
  const [isFailedMintsLoading, setIsFailedMintsLoading] = useState(false);
  const [isSystemHealthLoading, setIsSystemHealthLoading] = useState(false);
  const [isAuditLogsLoading, setIsAuditLogsLoading] = useState(false);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [userList, setUserList] = useState<AdminUserList | null>(null);
  const [artworkList, setArtworkList] = useState<AdminArtworkList | null>(null);
  const [failedMints, setFailedMints] = useState<FailedMintOperation[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogList | null>(null);
  
  // Error states
  const [error, setError] = useState<Error | null>(null);
  const [dashboardError, setDashboardError] = useState<Error | null>(null);
  const [usersError, setUsersError] = useState<Error | null>(null);
  const [artworksError, setArtworksError] = useState<Error | null>(null);
  const [failedMintsError, setFailedMintsError] = useState<Error | null>(null);
  const [systemHealthError, setSystemHealthError] = useState<Error | null>(null);
  const [auditLogsError, setAuditLogsError] = useState<Error | null>(null);

  // Helper function to handle errors consistently
  const handleError = useCallback((error: Error, setSpecificError: (error: Error | null) => void, context?: string) => {
    console.error('Admin API Error:', error);
    setSpecificError(error);
    setError(error);
    
    // Log error details for debugging
    if (isAdminError(error)) {
      console.error('Admin Error Details:', {
        message: getAdminErrorMessage(error),
        severity: getAdminErrorSeverity(error),
        context: context || 'unknown',
        timestamp: new Date().toISOString(),
        originalError: error
      });
    }

    // Report to error monitoring service if available
    if (typeof window !== 'undefined' && (window as any).errorReporting) {
      (window as any).errorReporting.captureException(error, {
        context: `AdminContext${context ? `:${context}` : ''}`,
        severity: getAdminErrorSeverity(error),
      });
    }
  }, []);

  // Dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsDashboardLoading(true);
      setDashboardError(null);
      const stats = await adminApi.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      handleError(error as Error, setDashboardError, 'dashboard');
    } finally {
      setIsDashboardLoading(false);
    }
  }, [handleError]);

  // Users
  const fetchUsers = useCallback(async (page: number = 1, limit: number = 50) => {
    try {
      setIsUsersLoading(true);
      setUsersError(null);
      const users = await adminApi.getAllUsers(page, limit);
      setUserList(users);
    } catch (error) {
      handleError(error as Error, setUsersError, 'users');
    } finally {
      setIsUsersLoading(false);
    }
  }, [handleError]);

  // Artworks
  const fetchArtworks = useCallback(async (page: number = 1, limit: number = 50) => {
    try {
      setIsArtworksLoading(true);
      setArtworksError(null);
      const artworks = await adminApi.getAllArtworks(page, limit);
      setArtworkList(artworks);
    } catch (error) {
      handleError(error as Error, setArtworksError, 'artworks');
    } finally {
      setIsArtworksLoading(false);
    }
  }, [handleError]);

  // Failed mints
  const fetchFailedMints = useCallback(async () => {
    try {
      setIsFailedMintsLoading(true);
      setFailedMintsError(null);
      const mints = await adminApi.getFailedMints();
      setFailedMints(mints);
    } catch (error) {
      handleError(error as Error, setFailedMintsError, 'failedMints');
    } finally {
      setIsFailedMintsLoading(false);
    }
  }, [handleError]);

  // System health
  const fetchSystemHealth = useCallback(async () => {
    try {
      setIsSystemHealthLoading(true);
      setSystemHealthError(null);
      const health = await adminApi.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      handleError(error as Error, setSystemHealthError, 'systemHealth');
    } finally {
      setIsSystemHealthLoading(false);
    }
  }, [handleError]);

  // Audit logs
  const fetchAuditLogs = useCallback(async (
    page: number = 1, 
    limit: number = 50, 
    actionFilter?: string, 
    entityTypeFilter?: string
  ) => {
    try {
      setIsAuditLogsLoading(true);
      setAuditLogsError(null);
      const logs = await adminApi.getAuditLogs(page, limit, actionFilter, entityTypeFilter);
      setAuditLogs(logs);
    } catch (error) {
      handleError(error as Error, setAuditLogsError, 'auditLogs');
    } finally {
      setIsAuditLogsLoading(false);
    }
  }, [handleError]);

  // Update user role
  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    try {
      setIsLoading(true);
      await adminApi.updateUserRole(userId, { role });
      // Refresh users list after successful update
      await fetchUsers(userList?.page, userList?.limit);
    } catch (error) {
      handleError(error as Error, setUsersError, 'updateUserRole');
      throw error; // Re-throw to allow component-level error handling
    } finally {
      setIsLoading(false);
    }
  }, [handleError, fetchUsers, userList?.page, userList?.limit]);

  // Retry minting
  const retryMinting = useCallback(async (orderId: string) => {
    try {
      setIsLoading(true);
      await adminApi.retryMinting(orderId);
      // Refresh failed mints and dashboard stats after successful retry
      await Promise.all([
        fetchFailedMints(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      handleError(error as Error, setFailedMintsError, 'retryMinting');
      throw error; // Re-throw to allow component-level error handling
    } finally {
      setIsLoading(false);
    }
  }, [handleError, fetchFailedMints, fetchDashboardStats]);

  // Clear specific errors
  const clearError = useCallback((errorType?: string) => {
    if (!errorType) {
      setError(null);
      setDashboardError(null);
      setUsersError(null);
      setArtworksError(null);
      setFailedMintsError(null);
      setSystemHealthError(null);
      setAuditLogsError(null);
      return;
    }

    switch (errorType) {
      case 'dashboard':
        setDashboardError(null);
        break;
      case 'users':
        setUsersError(null);
        break;
      case 'artworks':
        setArtworksError(null);
        break;
      case 'failedMints':
        setFailedMintsError(null);
        break;
      case 'systemHealth':
        setSystemHealthError(null);
        break;
      case 'auditLogs':
        setAuditLogsError(null);
        break;
      default:
        setError(null);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.allSettled([
        fetchDashboardStats(),
        fetchUsers(userList?.page, userList?.limit),
        fetchFailedMints(),
        fetchSystemHealth()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDashboardStats, fetchUsers, fetchFailedMints, fetchSystemHealth, userList?.page, userList?.limit]);

  const contextValue: AdminContextState = {
    // Loading states
    isLoading,
    isDashboardLoading,
    isUsersLoading,
    isArtworksLoading,
    isFailedMintsLoading,
    isSystemHealthLoading,
    isAuditLogsLoading,
    
    // Data
    dashboardStats,
    userList,
    artworkList,
    failedMints,
    systemHealth,
    auditLogs,
    
    // Errors
    error,
    dashboardError,
    usersError,
    artworksError,
    failedMintsError,
    systemHealthError,
    auditLogsError,
    
    // Actions
    fetchDashboardStats,
    fetchUsers,
    fetchArtworks,
    fetchFailedMints,
    fetchSystemHealth,
    fetchAuditLogs,
    updateUserRole,
    retryMinting,
    clearError,
    refreshAll,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}

// Convenience hooks for specific admin operations
export function useAdminDashboard() {
  const { dashboardStats, isDashboardLoading, dashboardError, fetchDashboardStats } = useAdminContext();
  return {
    data: dashboardStats,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: fetchDashboardStats,
  };
}

export function useAdminUsers() {
  const { userList, isUsersLoading, usersError, fetchUsers } = useAdminContext();
  return {
    data: userList,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: fetchUsers,
  };
}

export function useAdminSystemHealth() {
  const { systemHealth, isSystemHealthLoading, systemHealthError, fetchSystemHealth } = useAdminContext();
  return {
    data: systemHealth,
    isLoading: isSystemHealthLoading,
    error: systemHealthError,
    refetch: fetchSystemHealth,
  };
}
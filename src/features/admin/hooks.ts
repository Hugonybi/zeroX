import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from './api';
import type {
  AdminDashboardStats,
  AdminUserList,
  AdminArtworkList,
  FailedMintOperation,
  SystemHealthStatus,
  UpdateUserRolePayload,
  AdminAuditLogList,
} from './types';

// Dashboard hook with auto-refresh
export function useAdminDashboard(refreshInterval: number = 30000) {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const stats = await adminApi.getDashboardStats();
      if (mountedRef.current) {
        setData(stats);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDashboard();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchDashboard, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchDashboard, refreshInterval]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    return fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Users hook with pagination
export function useAdminUsers(page: number = 1, limit: number = 50) {
  const [data, setData] = useState<AdminUserList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const users = await adminApi.getAllUsers(page, limit);
      if (mountedRef.current) {
        setData(users);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchUsers();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// User role update mutation hook
export function useUpdateUserRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (userId: string, payload: UpdateUserRolePayload) => {
    try {
      setIsLoading(true);
      setError(null);
      await adminApi.updateUserRole(userId, payload);
      return { success: true };
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading,
    error,
  };
}

// Artworks hook with pagination
export function useAdminArtworks(page: number = 1, limit: number = 50) {
  const [data, setData] = useState<AdminArtworkList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchArtworks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const artworks = await adminApi.getAllArtworks(page, limit);
      if (mountedRef.current) {
        setData(artworks);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchArtworks();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchArtworks]);

  const refetch = useCallback(() => {
    return fetchArtworks();
  }, [fetchArtworks]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Failed mints hook with auto-refresh
export function useFailedMints(refreshInterval: number = 60000) {
  const [data, setData] = useState<FailedMintOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const fetchFailedMints = useCallback(async () => {
    try {
      setError(null);
      const failedMints = await adminApi.getFailedMints();
      if (mountedRef.current) {
        setData(failedMints);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchFailedMints();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchFailedMints, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFailedMints, refreshInterval]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    return fetchFailedMints();
  }, [fetchFailedMints]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Retry minting mutation hook
export function useRetryMinting() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await adminApi.retryMinting(orderId);
      return { success: true };
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading,
    error,
  };
}

// System health hook
export function useSystemHealth(refreshInterval: number = 60000) {
  const [data, setData] = useState<SystemHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const fetchSystemHealth = useCallback(async () => {
    try {
      setError(null);
      const health = await adminApi.getSystemHealth();
      if (mountedRef.current) {
        setData(health);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSystemHealth();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchSystemHealth, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSystemHealth, refreshInterval]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    return fetchSystemHealth();
  }, [fetchSystemHealth]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Audit logs hook with pagination and filtering
export function useAdminAuditLogs(
  page: number = 1,
  limit: number = 50,
  actionFilter?: string,
  entityTypeFilter?: string
) {
  const [data, setData] = useState<AdminAuditLogList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const logs = await adminApi.getAuditLogs(page, limit, actionFilter, entityTypeFilter);
      if (mountedRef.current) {
        setData(logs);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, actionFilter, entityTypeFilter]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAuditLogs();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchAuditLogs]);

  const refetch = useCallback(() => {
    return fetchAuditLogs();
  }, [fetchAuditLogs]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
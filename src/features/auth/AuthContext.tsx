import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from './types';
import { login, register, refreshSession, logout, fetchCurrentUser } from './api';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Try to refresh session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshSession();
        await refreshUser();
      } catch {
        // Refresh failed, user is not authenticated
        console.log('No valid session found');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      await login(payload);
      await refreshUser();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const signUp = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await register(payload);
      await refreshUser();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      await logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.warn('Logout failed on server:', error);
    }
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
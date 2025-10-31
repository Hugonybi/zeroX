import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useProtectedRoute(requiredRoles?: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasRequiredRole = !requiredRoles || (user && requiredRoles.includes(user.role));

  return {
    isAllowed: isAuthenticated && hasRequiredRole,
    isLoading,
    user,
  };
}
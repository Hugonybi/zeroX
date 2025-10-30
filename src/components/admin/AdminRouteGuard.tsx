import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { AdminPermissionError } from '../../features/admin/errors';
import { AdminErrorBoundary } from './AdminErrorBoundary';

interface AdminRouteGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

export function AdminRouteGuard({ 
  children, 
  requiredPermission,
}: AdminRouteGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-ink-muted">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role
  if (user.role !== 'admin') {
    const error = new AdminPermissionError('access admin features');
    
    return (
      <AdminErrorBoundary
        fallback={() => (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="text-3xl text-red-600">🚫</span>
              </div>
              
              <h1 className="text-xl font-semibold text-ink mb-2">
                Access Denied
              </h1>
              
              <p className="text-ink-muted mb-6">
                You need administrator privileges to access this area. 
                Please contact your system administrator if you believe this is an error.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.history.back()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Return to Home
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-ink-muted">
                  Current role: <span className="font-medium capitalize">{user.role}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      >
        {/* This will trigger the error boundary */}
        {(() => { throw error; })()}
      </AdminErrorBoundary>
    );
  }

  // Check specific permission if required
  if (requiredPermission) {
    const hasPermission = checkAdminPermission(user, requiredPermission);
    
    if (!hasPermission) {
      const error = new AdminPermissionError(requiredPermission);
      
      return (
        <AdminErrorBoundary
          fallback={() => (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <span className="text-3xl text-yellow-600">⚠️</span>
                </div>
                
                <h1 className="text-xl font-semibold text-ink mb-2">
                  Insufficient Permissions
                </h1>
                
                <p className="text-ink-muted mb-6">
                  You don't have the required permissions to access this specific admin feature: 
                  <span className="font-medium"> {requiredPermission}</span>
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Return to Admin Dashboard
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        >
          {/* This will trigger the error boundary */}
          {(() => { throw error; })()}
        </AdminErrorBoundary>
      );
    }
  }

  // Wrap children in error boundary for runtime errors
  return (
    <AdminErrorBoundary>
      {children}
    </AdminErrorBoundary>
  );
}

/**
 * Check if user has specific admin permission
 * In a more complex system, this would check against a permissions system
 */
function checkAdminPermission(user: any, permission: string): boolean {
  // For now, all admin users have all permissions
  // In the future, this could be expanded to check specific permissions
  if (user.role !== 'admin') {
    return false;
  }

  // Define permission mappings
  const permissionMap: Record<string, boolean> = {
    'user_management': true,
    'system_monitoring': true,
    'audit_logs': true,
    'failed_mints': true,
    'artwork_oversight': true,
  };

  return permissionMap[permission] ?? false;
}

/**
 * Hook to check admin permissions
 */
export function useAdminPermission(permission?: string) {
  const { user } = useAuth();
  
  const hasAdminRole = user?.role === 'admin';
  const hasPermission = permission ? checkAdminPermission(user, permission) : hasAdminRole;
  
  return {
    hasAdminRole,
    hasPermission,
    user,
  };
}
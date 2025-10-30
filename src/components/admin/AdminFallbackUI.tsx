import React from 'react';
import { Button } from '../ui/Button';
import { useAdminContext } from '../../features/admin/AdminContext';
import { useAdminNotifications } from '../../features/admin/AdminNotificationContext';

interface AdminFallbackUIProps {
  type: 'dashboard' | 'users' | 'artworks' | 'monitoring' | 'generic';
  error?: Error;
  onRetry?: () => void;
  message?: string;
}

export function AdminFallbackUI({ type, error, onRetry, message }: AdminFallbackUIProps) {
  const { refreshAll } = useAdminContext();
  const { showSuccess } = useAdminNotifications();

  const getFallbackContent = () => {
    switch (type) {
      case 'dashboard':
        return {
          icon: '📊',
          title: 'Dashboard Unavailable',
          description: 'Unable to load admin dashboard statistics. This may be due to a temporary service issue.',
          suggestions: [
            'Check your network connection',
            'Verify admin service is running',
            'Try refreshing the page'
          ]
        };
      
      case 'users':
        return {
          icon: '👥',
          title: 'User Management Unavailable',
          description: 'Unable to load user data. User management features are temporarily unavailable.',
          suggestions: [
            'Verify database connectivity',
            'Check admin permissions',
            'Try refreshing the data'
          ]
        };
      
      case 'artworks':
        return {
          icon: '🎨',
          title: 'Artwork Management Unavailable',
          description: 'Unable to load artwork data. Artwork management features are temporarily unavailable.',
          suggestions: [
            'Check artwork service status',
            'Verify database connectivity',
            'Try refreshing the data'
          ]
        };
      
      case 'monitoring':
        return {
          icon: '📈',
          title: 'System Monitoring Unavailable',
          description: 'Unable to load system monitoring data. Health checks and queue status are temporarily unavailable.',
          suggestions: [
            'Check monitoring service status',
            'Verify queue system connectivity',
            'Try refreshing the monitoring data'
          ]
        };
      
      default:
        return {
          icon: '⚠️',
          title: 'Service Unavailable',
          description: message || 'This admin feature is temporarily unavailable due to a service issue.',
          suggestions: [
            'Check your network connection',
            'Verify service status',
            'Try again in a few moments'
          ]
        };
    }
  };

  const content = getFallbackContent();

  const handleRefreshAll = async () => {
    try {
      await refreshAll();
      showSuccess('Admin data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh admin data:', error);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="text-6xl mb-4">
          {content.icon}
        </div>
        
        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {content.title}
          </h2>
          <p className="text-gray-600">
            {content.description}
          </p>
        </div>
        
        {/* Error details (if provided) */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left">
            <h4 className="text-sm font-medium text-red-800 mb-1">Error Details:</h4>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}
        
        {/* Suggestions */}
        <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Troubleshooting Steps:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {content.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
          
          <Button onClick={handleRefreshAll} variant="secondary" className="w-full">
            Refresh All Data
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="secondary" 
            className="w-full"
          >
            Reload Page
          </Button>
          
          <Button 
            onClick={() => window.history.back()} 
            variant="secondary" 
            className="w-full"
          >
            Go Back
          </Button>
        </div>
        
        {/* Support information */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact technical support with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
}

// Specialized fallback components for different admin sections
export function AdminDashboardFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return <AdminFallbackUI type="dashboard" error={error} onRetry={onRetry} />;
}

export function AdminUsersFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return <AdminFallbackUI type="users" error={error} onRetry={onRetry} />;
}

export function AdminArtworksFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return <AdminFallbackUI type="artworks" error={error} onRetry={onRetry} />;
}

export function AdminMonitoringFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return <AdminFallbackUI type="monitoring" error={error} onRetry={onRetry} />;
}
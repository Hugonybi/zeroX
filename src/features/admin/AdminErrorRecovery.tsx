import React, { useState, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { useAdminContext } from './AdminContext';
import { useAdminNotifications } from './AdminNotificationContext';
import { getAdminErrorMessage, getAdminErrorSeverity, isAdminError } from './errors';

interface AdminErrorRecoveryProps {
  error: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  context?: string;
}

export function AdminErrorRecovery({ error, onRetry, onDismiss, context }: AdminErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const { refreshAll } = useAdminContext();
  const { showSuccess, showError } = useAdminNotifications();

  const errorMessage = getAdminErrorMessage(error);
  const severity = getAdminErrorSeverity(error);
  const isAdminSpecific = isAdminError(error);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;
    
    try {
      setIsRetrying(true);
      await onRetry();
      showSuccess('Operation completed successfully');
      onDismiss?.();
    } catch (retryError) {
      showError(`Retry failed: ${getAdminErrorMessage(retryError as Error)}`);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, onDismiss, showSuccess, showError]);

  const handleRefreshAll = useCallback(async () => {
    try {
      setIsRetrying(true);
      await refreshAll();
      showSuccess('All admin data refreshed successfully');
      onDismiss?.();
    } catch (refreshError) {
      showError(`Refresh failed: ${getAdminErrorMessage(refreshError as Error)}`);
    } finally {
      setIsRetrying(false);
    }
  }, [refreshAll, onDismiss, showSuccess, showError]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${getSeverityColor(severity)}`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl flex-shrink-0">
          {getSeverityIcon(severity)}
        </span>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">
            {isAdminSpecific ? 'Admin Operation Error' : 'System Error'}
            {context && <span className="text-sm font-normal text-gray-600"> in {context}</span>}
          </h3>
          
          <p className="text-gray-700 mb-3">
            {errorMessage}
          </p>
          
          {/* Error severity warning */}
          {(severity === 'high' || severity === 'critical') && (
            <div className="mb-3 p-2 bg-white border border-gray-200 rounded text-sm">
              <strong>⚠️ High Priority:</strong> This error may affect admin operations. 
              Consider contacting technical support if the problem persists.
            </div>
          )}
          
          {/* Recovery actions */}
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                size="sm"
                variant="primary"
              >
                {isRetrying ? 'Retrying...' : 'Retry Operation'}
              </Button>
            )}
            
            <Button
              onClick={handleRefreshAll}
              disabled={isRetrying}
              size="sm"
              variant="secondary"
            >
              {isRetrying ? 'Refreshing...' : 'Refresh All Data'}
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              disabled={isRetrying}
              size="sm"
              variant="secondary"
            >
              Reload Page
            </Button>
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                disabled={isRetrying}
                size="sm"
                variant="secondary"
              >
                Dismiss
              </Button>
            )}
          </div>
          
          {/* Development error details */}
          {import.meta.env.DEV && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show Technical Details (Development)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 border rounded text-xs overflow-auto max-h-32 text-gray-700">
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for using error recovery in components
export function useAdminErrorRecovery() {
  const [recoveryError, setRecoveryError] = useState<Error | null>(null);
  const [recoveryContext, setRecoveryContext] = useState<string>('');

  const showErrorRecovery = useCallback((error: Error, context?: string) => {
    setRecoveryError(error);
    setRecoveryContext(context || '');
  }, []);

  const hideErrorRecovery = useCallback(() => {
    setRecoveryError(null);
    setRecoveryContext('');
  }, []);

  return {
    recoveryError,
    recoveryContext,
    showErrorRecovery,
    hideErrorRecovery,
  };
}

// Higher-order component for wrapping admin operations with error recovery
export function withAdminErrorRecovery<P extends object>(
  Component: React.ComponentType<P>,
  context?: string
) {
  const WrappedComponent = (props: P) => {
    const { recoveryError, recoveryContext, showErrorRecovery, hideErrorRecovery } = useAdminErrorRecovery();

    if (recoveryError) {
      return (
        <AdminErrorRecovery
          error={recoveryError}
          context={recoveryContext || context}
          onDismiss={hideErrorRecovery}
        />
      );
    }

    return (
      <Component 
        {...props} 
        onError={showErrorRecovery}
      />
    );
  };

  WrappedComponent.displayName = `withAdminErrorRecovery(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
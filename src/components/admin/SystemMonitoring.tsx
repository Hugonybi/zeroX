import { useState } from 'react';
import { useSystemHealth, useAdminDashboard } from '../../features/admin/hooks';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Toast } from '../ui/Toast';
import type { QueueStatus, HealthStatus } from '../../features/admin/types';

interface SystemMonitoringProps {
  refreshInterval?: number;
}

export function SystemMonitoring({ refreshInterval = 60000 }: SystemMonitoringProps) {
  const { data: systemHealth, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useSystemHealth(refreshInterval);
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useAdminDashboard(0); // No auto-refresh for stats in this component
  const { toast, showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Refresh both system health and dashboard stats
      await Promise.all([
        refetchHealth(),
        refetchStats()
      ]);
      
      showToast({
        variant: 'success',
        message: 'System monitoring data refreshed',
      });
    } catch (error) {
      showToast({
        variant: 'error',
        message: 'Failed to update system monitoring data',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHealthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getQueueStatusSeverity = (queueStatus: QueueStatus) => {
    if (queueStatus.failed > 10) return 'error';
    if (queueStatus.failed > 5 || queueStatus.waiting > 50) return 'warning';
    return 'healthy';
  };

  const formatLastChecked = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
  };

  if (healthLoading && statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-ink-muted">Loading system monitoring data...</div>
      </div>
    );
  }

  if (healthError) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 font-medium">Error loading system health</p>
        <p className="text-red-500 text-sm mt-1">{healthError.message}</p>
        <Button 
          onClick={handleRefresh} 
          variant="secondary" 
          size="sm" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Monitoring</h3>
        <div className="flex items-center gap-3">
          {systemHealth && (
            <span className="text-sm text-ink-muted">
              Last updated: {formatLastChecked(systemHealth.lastChecked)}
            </span>
          )}
          <Button 
            onClick={handleRefresh} 
            variant="secondary" 
            size="sm"
            disabled={isRefreshing || healthLoading}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${getHealthStatusColor(systemHealth.database)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs opacity-75">PostgreSQL Connection</p>
              </div>
              <span className="text-xl">{getHealthStatusIcon(systemHealth.database)}</span>
            </div>
            <div className="mt-2">
              <Badge tone={systemHealth.database === 'healthy' ? 'success' : 'info'}>
                {systemHealth.database}
              </Badge>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getHealthStatusColor(systemHealth.queue)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Queue System</p>
                <p className="text-xs opacity-75">Bull/Redis Queue</p>
              </div>
              <span className="text-xl">{getHealthStatusIcon(systemHealth.queue)}</span>
            </div>
            <div className="mt-2">
              <Badge tone={systemHealth.queue === 'healthy' ? 'success' : 'info'}>
                {systemHealth.queue}
              </Badge>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getHealthStatusColor(systemHealth.externalServices)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">External Services</p>
                <p className="text-xs opacity-75">Hedera, Paystack, IPFS</p>
              </div>
              <span className="text-xl">{getHealthStatusIcon(systemHealth.externalServices)}</span>
            </div>
            <div className="mt-2">
              <Badge tone={systemHealth.externalServices === 'healthy' ? 'success' : 'info'}>
                {systemHealth.externalServices}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Queue Status Details */}
      {dashboardStats?.queueStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3">Queue Status Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {dashboardStats.queueStatus.waiting}
              </div>
              <div className="text-sm text-ink-muted">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {dashboardStats.queueStatus.active}
              </div>
              <div className="text-sm text-ink-muted">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {dashboardStats.queueStatus.completed}
              </div>
              <div className="text-sm text-ink-muted">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">
                {dashboardStats.queueStatus.failed}
              </div>
              <div className="text-sm text-ink-muted">Failed</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Queue Health:</span>
              <Badge 
                tone={getQueueStatusSeverity(dashboardStats.queueStatus) === 'healthy' ? 'success' : 'info'}
              >
                {getQueueStatusSeverity(dashboardStats.queueStatus)}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {systemHealth && systemHealth.recentErrors > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-medium text-yellow-800">Recent Errors Detected</h4>
              <p className="text-sm text-yellow-700">
                {systemHealth.recentErrors} error{systemHealth.recentErrors > 1 ? 's' : ''} occurred in the last hour.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-2">System Status Summary</h4>
        <div className="text-sm text-ink-muted space-y-1">
          <p>• Monitoring refreshes automatically every {Math.floor(refreshInterval / 1000)} seconds</p>
          <p>• Queue health is considered warning if failed jobs {'>'}5 or waiting jobs {'>'}50</p>
          <p>• Recent errors are counted from the last hour of system operations</p>
          {systemHealth && (
            <p>• Last health check: {formatLastChecked(systemHealth.lastChecked)}</p>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toast && <Toast {...toast} />}
    </div>
  );
}
import type { SystemHealthStatus, AdminDashboardStats } from '../../features/admin/types';

interface AdminSystemHealthProps {
  health: SystemHealthStatus;
  queueStatus?: AdminDashboardStats['queueStatus'];
}

export function AdminSystemHealth({ health, queueStatus }: AdminSystemHealthProps) {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthTextColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getHealthColor(health.database)}`}></div>
            <span className={`text-sm font-medium ${getHealthTextColor(health.database)}`}>
              Database: {health.database}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getHealthColor(health.queue)}`}></div>
            <span className={`text-sm font-medium ${getHealthTextColor(health.queue)}`}>
              Queue: {health.queue}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getHealthColor(health.externalServices)}`}></div>
            <span className={`text-sm font-medium ${getHealthTextColor(health.externalServices)}`}>
              External Services: {health.externalServices}
            </span>
          </div>
        </div>
        
        {health.recentErrors > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ {health.recentErrors} recent errors detected
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-ink-muted">
          Last checked: {new Date(health.lastChecked).toLocaleString()}
        </div>
      </div>

      {/* Queue Status */}
      {queueStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Minting Queue Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">{queueStatus.waiting}</p>
              <p className="text-sm text-ink-muted">Waiting</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-yellow-600">{queueStatus.active}</p>
              <p className="text-sm text-ink-muted">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">{queueStatus.completed}</p>
              <p className="text-sm text-ink-muted">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600">{queueStatus.failed}</p>
              <p className="text-sm text-ink-muted">Failed</p>
            </div>
          </div>
          
          {queueStatus.failed > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                ⚠️ {queueStatus.failed} failed jobs require attention
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
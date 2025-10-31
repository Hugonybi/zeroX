import { useState } from 'react';
import { FailedMintsTable, SystemMonitoring } from '../components/admin';
import { Button } from '../components/ui/Button';

export function AdminMonitoringPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'failed-mints'>('system');

  const handleRetrySuccess = () => {
    // This callback can be used to refresh other components or show notifications
    console.log('Minting retry was successful, refreshing monitoring data...');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-4xl uppercase tracking-[0.15em]">
          System Monitoring
        </h1>
        <p className="text-ink-muted">
          Monitor system health, queue status, and handle failed operations
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-black text-black'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-gray-300'
            }`}
          >
            System Health
          </button>
          <button
            onClick={() => setActiveTab('failed-mints')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'failed-mints'
                ? 'border-black text-black'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-gray-300'
            }`}
          >
            Failed Mints
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'system' && (
          <SystemMonitoring refreshInterval={60000} />
        )}
        
        {activeTab === 'failed-mints' && (
          <FailedMintsTable onRetrySuccess={handleRetrySuccess} />
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setActiveTab('system')}
            variant={activeTab === 'system' ? 'primary' : 'secondary'}
            size="sm"
          >
            View System Health
          </Button>
          <Button
            onClick={() => setActiveTab('failed-mints')}
            variant={activeTab === 'failed-mints' ? 'primary' : 'secondary'}
            size="sm"
          >
            Check Failed Mints
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Refresh All Data
          </Button>
        </div>
      </div>
    </div>
  );
}
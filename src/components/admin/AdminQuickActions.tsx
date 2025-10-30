import { Button } from '../ui/Button';
import type { AdminDashboardStats } from '../../features/admin/types';

interface AdminQuickActionsProps {
  dashboardStats?: AdminDashboardStats | null;
  onNavigateToUsers?: () => void;
  onNavigateToArtworks?: () => void;
  onNavigateToFailedMints?: () => void;
  onRefreshAll?: () => void;
}

export function AdminQuickActions({ 
  dashboardStats, 
  onNavigateToUsers,
  onNavigateToArtworks,
  onNavigateToFailedMints,
  onRefreshAll
}: AdminQuickActionsProps) {
  const hasFailedMints = dashboardStats?.failedMints && dashboardStats.failedMints > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="secondary" 
          disabled={!dashboardStats}
          onClick={onNavigateToUsers}
        >
          👥 View All Users
        </Button>
        
        <Button 
          variant="secondary" 
          disabled={!dashboardStats}
          onClick={onNavigateToArtworks}
        >
          🎨 Manage Artworks
        </Button>
        
        <Button 
          variant={hasFailedMints ? "primary" : "secondary"}
          disabled={!dashboardStats}
          onClick={onNavigateToFailedMints}
        >
          {hasFailedMints 
            ? `⚠️ Review ${dashboardStats.failedMints} Failed Mints` 
            : '📦 Monitor Orders'
          }
        </Button>
        
        <Button 
          variant="secondary" 
          disabled={!dashboardStats}
          onClick={onRefreshAll}
        >
          🔄 Refresh All Data
        </Button>
        
        {hasFailedMints && (
          <div className="w-full mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Action Required:</strong> There are failed minting operations that need attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
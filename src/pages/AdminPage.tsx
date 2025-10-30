import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAdminContext, useAdminDashboard, useAdminSystemHealth } from "../features/admin/AdminContext";
import { useAdminNotifications } from "../features/admin/AdminNotificationContext";
import { AdminStatsGrid, AdminSystemHealth, AdminQuickActions } from "../components/admin";
import { AdminDashboardLoading } from "../components/admin/AdminLoadingState";
import { getAdminErrorMessage } from "../features/admin/errors";

export function AdminPage() {
  const navigate = useNavigate();
  const { refreshAll } = useAdminContext();
  const { data: dashboardStats, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useAdminDashboard();
  const { data: systemHealth, error: systemHealthError, refetch: refetchSystemHealth } = useAdminSystemHealth();
  const { showError, showInfo } = useAdminNotifications();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          refetchDashboard(),
          refetchSystemHealth()
        ]);
      } catch (error) {
        showError('Failed to load admin dashboard data');
      }
    };

    loadInitialData();
  }, [refetchDashboard, refetchSystemHealth, showError]);

  // Handle dashboard errors
  useEffect(() => {
    if (dashboardError) {
      showError(getAdminErrorMessage(dashboardError), {
        label: 'Retry',
        onClick: refetchDashboard
      });
    }
  }, [dashboardError, showError, refetchDashboard]);

  // Handle system health errors
  useEffect(() => {
    if (systemHealthError) {
      showError('Failed to load system health status', {
        label: 'Retry',
        onClick: refetchSystemHealth
      });
    }
  }, [systemHealthError, showError, refetchSystemHealth]);

  // Loading state with proper skeleton
  if (dashboardLoading) {
    return <AdminDashboardLoading />;
  }

  // Main dashboard content
  return (
    <section className="space-y-8">
      {/* Dashboard Header */}
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Admin Dashboard</p>
        <h2 className="font-brand text-4xl uppercase tracking-[0.15em]">Platform Overview</h2>
        <p className="max-w-xl text-sm text-ink-muted mt-2">
          Monitor platform activity, manage users, and oversee system operations.
        </p>
      </header>

      {/* Dashboard Statistics */}
      {dashboardStats && (
        <AdminStatsGrid stats={dashboardStats} />
      )}

      {/* System Health and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        {systemHealth && (
          <AdminSystemHealth 
            health={systemHealth} 
            queueStatus={dashboardStats?.queueStatus}
          />
        )}

        {/* Quick Actions */}
        <AdminQuickActions 
          dashboardStats={dashboardStats}
          onNavigateToUsers={() => navigate('/admin/users')}
          onNavigateToArtworks={() => {
            // TODO: Implement navigation to artwork management
            console.log('Navigate to artwork management');
          }}
          onNavigateToFailedMints={() => navigate('/admin/monitoring')}
          onRefreshAll={refreshAll}
        />
      </div>

      {/* Quick refresh button */}
      <div className="flex justify-end">
        <button
          onClick={refreshAll}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          🔄 Refresh All Data
        </button>
      </div>
    </section>
  );
}

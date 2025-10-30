import type { AdminDashboardStats } from '../../features/admin/types';

interface AdminStatsGridProps {
  stats: AdminDashboardStats;
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const statItems = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: '👥',
      variant: 'default' as const
    },
    { 
      label: 'Total Artworks', 
      value: stats.totalArtworks, 
      icon: '🎨',
      variant: 'default' as const
    },
    { 
      label: 'Recent Orders (24h)', 
      value: stats.recentOrders, 
      icon: '📦',
      variant: 'default' as const
    },
    { 
      label: 'Failed Mints', 
      value: stats.failedMints, 
      icon: stats.failedMints > 0 ? '⚠️' : '✅',
      variant: stats.failedMints > 0 ? 'warning' as const : 'default' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div 
          key={item.label}
          className={`p-6 rounded-lg border ${
            item.variant === 'warning' 
              ? 'border-yellow-200 bg-yellow-50' 
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">{item.label}</p>
              <p className="text-3xl font-semibold">{item.value}</p>
            </div>
            <span className="text-2xl">{item.icon}</span>
          </div>
          {item.variant === 'warning' && item.value > 0 && (
            <div className="mt-2">
              <p className="text-xs text-yellow-700">Requires attention</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
import { useState } from 'react';
import { useAdminAuditLogs } from '../../features/admin/hooks';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/SelectField';
import { TextField } from '../ui/TextField';
import { AdminPagination } from './AdminPagination';

interface AdminAuditLogProps {
  className?: string;
}

export function AdminAuditLog({ className = '' }: AdminAuditLogProps) {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const limit = 20;

  const { data: auditLogs, isLoading, error, refetch } = useAdminAuditLogs(
    page,
    limit,
    actionFilter || undefined,
    entityTypeFilter || undefined
  );

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionColor = (action: string) => {
    if (action.includes('error') || action.includes('failed')) {
      return 'text-red-600';
    }
    if (action.includes('retry') || action.includes('update')) {
      return 'text-yellow-600';
    }
    if (action.includes('create') || action.includes('success')) {
      return 'text-green-600';
    }
    return 'text-blue-600';
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'admin_action':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'order':
        return 'bg-green-100 text-green-800';
      case 'artwork':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMetadata = (metaJson: any) => {
    if (!metaJson || typeof metaJson !== 'object') {
      return null;
    }

    return Object.entries(metaJson).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="font-medium text-ink-muted">{key}:</span>{' '}
        <span className="text-ink">{String(value)}</span>
      </div>
    ));
  };

  if (isLoading && !auditLogs) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-ink-muted">Loading audit logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 border border-red-200 bg-red-50 rounded-lg ${className}`}>
        <p className="text-red-600 font-medium">Error loading audit logs</p>
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
        <Button 
          onClick={() => refetch()} 
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin Audit Log</h2>
        <Button 
          onClick={() => refetch()} 
          variant="secondary" 
          size="sm"
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-stone/10 rounded-lg">
        <TextField
          label="Action Filter"
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            handleFilterChange();
          }}
          placeholder="e.g., user_role_change"
          size="sm"
        />
        
        <SelectField
          label="Entity Type"
          value={entityTypeFilter}
          onChange={(e) => {
            setEntityTypeFilter(e.target.value);
            handleFilterChange();
          }}
          size="sm"
        >
          <option value="">All Types</option>
          <option value="admin_action">Admin Actions</option>
          <option value="user">User</option>
          <option value="order">Order</option>
          <option value="artwork">Artwork</option>
        </SelectField>

        <div className="flex items-end">
          <Button
            onClick={() => {
              setActionFilter('');
              setEntityTypeFilter('');
              setPage(1);
            }}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Audit Log Table */}
      {auditLogs && auditLogs.logs.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                    Timestamp
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                    Entity Type
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                    Entity ID
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 text-sm text-ink-muted">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="border border-gray-200 p-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEntityTypeColor(log.entityType)}`}>
                        {log.entityType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-3 text-sm">
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-3 text-sm">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.entityId.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="border border-gray-200 p-3 text-sm">
                      <div className="space-y-1">
                        {formatMetadata(log.metaJson)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(auditLogs.total / limit)}
            onPageChange={setPage}
          />

          {/* Results Info */}
          <div className="text-sm text-ink-muted text-center">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, auditLogs.total)} of {auditLogs.total} audit log entries
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <div className="text-ink-muted mb-2">No audit log entries found</div>
          <p className="text-sm text-ink-muted">
            {actionFilter || entityTypeFilter 
              ? 'Try adjusting your filters to see more results.'
              : 'Admin actions will appear here as they occur.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
import { Outlet, NavLink } from 'react-router-dom';
import { AdminProvider } from '../features/admin/AdminContext';
import { AdminNotificationProvider } from '../features/admin/AdminNotificationContext';
import { AdminErrorBoundary } from '../components/admin/AdminErrorBoundary';

export function AdminLayout() {
  return (
    <AdminErrorBoundary>
      <AdminProvider>
        <AdminNotificationProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Admin Navigation Header */}
            <AdminHeader />
            
            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
              <Outlet />
            </main>
          </div>
        </AdminNotificationProvider>
      </AdminProvider>
    </AdminErrorBoundary>
  );
}

function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              zeroX Admin Panel
            </h1>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Admin
            </span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <AdminNavLink to="/admin" label="Dashboard" />
            <AdminNavLink to="/admin/users" label="Users" />
            <AdminNavLink to="/admin/monitoring" label="Monitoring" />
            <AdminNavLink to="/" label="← Back to Site" />
          </nav>
        </div>
      </div>
    </header>
  );
}

interface AdminNavLinkProps {
  to: string;
  label: string;
}

function AdminNavLink({ to, label }: AdminNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium transition-colors ${
          isActive
            ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
            : 'text-gray-600 hover:text-gray-900'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
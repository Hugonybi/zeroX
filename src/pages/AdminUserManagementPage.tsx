import { useState, useEffect } from "react";
import { useAdminContext } from "../features/admin/AdminContext";
import { useAdminNotifications } from "../features/admin/AdminNotificationContext";
import { AdminUserTable } from "../components/admin/AdminUserTable";
import { AdminUserSearch } from "../components/admin/AdminUserSearch";
import { AdminPagination } from "../components/admin/AdminPagination";
import { AdminTableLoading } from "../components/admin/AdminLoadingState";
import { getAdminErrorMessage } from "../features/admin/errors";
import type { UserRole } from "../features/admin/types";

export function AdminUserManagementPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const limit = 50;

  const { 
    userList, 
    isUsersLoading, 
    usersError, 
    fetchUsers, 
    updateUserRole,
    isLoading: isUpdating 
  } = useAdminContext();
  const { showSuccess, showError } = useAdminNotifications();

  // Load users when page changes
  useEffect(() => {
    fetchUsers(page, limit);
  }, [page, limit, fetchUsers]);

  // Handle users error
  useEffect(() => {
    if (usersError) {
      showError(getAdminErrorMessage(usersError), {
        label: 'Retry',
        onClick: () => fetchUsers(page, limit)
      });
    }
  }, [usersError, showError, fetchUsers, page, limit]);

  const handleRoleChange = async (userId: string, newRole: UserRole, currentRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      showSuccess(`User role updated from ${currentRole} to ${newRole}`);
    } catch (error) {
      showError(`Failed to update user role: ${getAdminErrorMessage(error as Error)}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  const handleRoleFilter = (role: UserRole | "all") => {
    setRoleFilter(role);
    setPage(1); // Reset to first page when filtering
  };

  // Filter users based on search and role filter
  const filteredUsers = userList?.users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  // Loading state
  if (isUsersLoading) {
    return <AdminTableLoading />;
  }

  const totalPages = Math.ceil((userList?.total || 0) / limit);
  const displayedTotal = filteredUsers.length;
  const actualTotal = userList?.total || 0;

  return (
    <section className="space-y-8">
      {/* Page Header */}
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Admin</p>
        <h2 className="font-brand text-4xl uppercase tracking-[0.15em]">User Management</h2>
        <p className="max-w-xl text-sm text-ink-muted mt-2">
          Manage user accounts, roles, and permissions across the platform.
        </p>
      </header>

      {/* Search and Filter Controls */}
      <AdminUserSearch
        searchQuery={searchQuery}
        roleFilter={roleFilter}
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
        totalUsers={actualTotal}
        filteredUsers={displayedTotal}
      />

      {/* User Table */}
      <AdminUserTable
        users={filteredUsers}
        onRoleChange={handleRoleChange}
        isUpdatingRole={isUpdating}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={actualTotal}
          itemsPerPage={limit}
        />
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && !isUsersLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
          <p className="text-ink-muted">
            {searchQuery || roleFilter !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "No users have been registered yet."
            }
          </p>
        </div>
      )}
    </section>
  );
}
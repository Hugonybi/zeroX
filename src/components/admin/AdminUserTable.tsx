import { useState } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { RoleSelect } from "./RoleSelect";
import { RoleChangeConfirmDialog } from "./RoleChangeConfirmDialog";
import type { AdminUserSummary, UserRole } from "../../features/admin/types";

interface AdminUserTableProps {
  users: AdminUserSummary[];
  onRoleChange: (userId: string, newRole: UserRole, currentRole: UserRole) => Promise<void>;
  isUpdatingRole: boolean;
}

export function AdminUserTable({ users, onRoleChange, isUpdatingRole }: AdminUserTableProps) {
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    currentRole: UserRole;
    newRole: UserRole;
    userName: string;
    userEmail: string;
  } | null>(null);

  const handleRoleChangeRequest = (
    userId: string, 
    newRole: UserRole, 
    currentRole: UserRole,
    userName: string,
    userEmail: string
  ) => {
    setPendingRoleChange({
      userId,
      currentRole,
      newRole,
      userName,
      userEmail,
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    
    try {
      await onRoleChange(
        pendingRoleChange.userId, 
        pendingRoleChange.newRole, 
        pendingRoleChange.currentRole
      );
    } finally {
      setPendingRoleChange(null);
    }
  };

  const handleCancelRoleChange = () => {
    setPendingRoleChange(null);
  };

  const getKycStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'neutral';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-stone/20 overflow-hidden">
        {/* Table Header */}
        <div className="bg-stone/10 px-6 py-4 border-b border-stone/20">
          <div className="grid grid-cols-12 gap-4 text-xs uppercase tracking-[0.35em] text-ink-muted font-medium">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">KYC Status</div>
            <div className="col-span-2">Activity</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-stone/10">
          {users.map((user) => (
            <div key={user.id} className="px-6 py-4 hover:bg-stone/5 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* User Info */}
                <div className="col-span-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{user.name || 'No name'}</p>
                    <p className="text-xs text-ink-muted">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <RoleSelect
                    value={user.role}
                    onChange={(newRole) => handleRoleChangeRequest(
                      user.id, 
                      newRole, 
                      user.role,
                      user.name || user.email,
                      user.email
                    )}
                    disabled={isUpdatingRole}
                  />
                </div>

                {/* KYC Status */}
                <div className="col-span-2">
                  <Badge tone={getKycStatusVariant(user.kycStatus)}>
                    {user.kycStatus}
                  </Badge>
                </div>

                {/* Activity Stats */}
                <div className="col-span-2">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted">Artworks:</span>
                      <span className="font-medium">{user._count.artworks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted">Orders:</span>
                      <span className="font-medium">{user._count.orders}</span>
                    </div>
                  </div>
                </div>

                {/* Join Date */}
                <div className="col-span-2">
                  <p className="text-xs text-ink-muted">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Implement user details view
                      console.log('View user details:', user.id);
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Change Confirmation Dialog */}
      {pendingRoleChange && (
        <RoleChangeConfirmDialog
          userName={pendingRoleChange.userName}
          userEmail={pendingRoleChange.userEmail}
          currentRole={pendingRoleChange.currentRole}
          newRole={pendingRoleChange.newRole}
          onConfirm={handleConfirmRoleChange}
          onCancel={handleCancelRoleChange}
          isLoading={isUpdatingRole}
        />
      )}
    </>
  );
}
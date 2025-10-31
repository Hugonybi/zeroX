import { Button } from "../ui/Button";
import type { UserRole } from "../../features/admin/types";

interface RoleChangeConfirmDialogProps {
  userName: string;
  userEmail: string;
  currentRole: UserRole;
  newRole: UserRole;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function RoleChangeConfirmDialog({
  userName,
  userEmail,
  currentRole,
  newRole,
  onConfirm,
  onCancel,
  isLoading
}: RoleChangeConfirmDialogProps) {
  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'buyer':
        return 'Can purchase artworks and view certificates';
      case 'artist':
        return 'Can create and sell artworks, plus buyer permissions';
      case 'admin':
        return 'Full platform access including user management and system oversight';
      default:
        return '';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'text-red-600';
      case 'artist':
        return 'text-blue-600';
      case 'buyer':
        return 'text-green-600';
      default:
        return 'text-ink';
    }
  };

  const isElevatingToAdmin = newRole === 'admin' && currentRole !== 'admin';
  const isDemotingFromAdmin = currentRole === 'admin' && newRole !== 'admin';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">
            {isElevatingToAdmin ? '🔐' : isDemotingFromAdmin ? '⚠️' : '👤'}
          </div>
          <h3 className="text-xl font-semibold">
            {isElevatingToAdmin ? 'Grant Admin Access' : 'Change User Role'}
          </h3>
          <p className="text-sm text-ink-muted mt-1">
            This action will immediately update the user's permissions
          </p>
        </div>

        {/* User Info */}
        <div className="bg-stone/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-[0.35em] text-ink-muted">User</span>
            <span className="text-sm font-medium">{userName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-[0.35em] text-ink-muted">Email</span>
            <span className="text-sm text-ink-muted">{userEmail}</span>
          </div>
        </div>

        {/* Role Change Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-ink-muted mb-1">Current Role</p>
              <p className={`font-medium capitalize ${getRoleColor(currentRole)}`}>
                {currentRole}
              </p>
            </div>
            <div className="px-4">
              <span className="text-2xl">→</span>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-ink-muted mb-1">New Role</p>
              <p className={`font-medium capitalize ${getRoleColor(newRole)}`}>
                {newRole}
              </p>
            </div>
          </div>

          {/* New Role Permissions */}
          <div className="bg-mint-soft/30 rounded-lg p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-ink-muted mb-2">
              New Permissions
            </p>
            <p className="text-sm text-ink">
              {getRoleDescription(newRole)}
            </p>
          </div>

          {/* Warning for Admin Changes */}
          {(isElevatingToAdmin || isDemotingFromAdmin) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    {isElevatingToAdmin ? 'Admin Access Warning' : 'Admin Removal Warning'}
                  </p>
                  <p className="text-xs text-yellow-700">
                    {isElevatingToAdmin 
                      ? 'This user will gain full administrative privileges including user management and system access.'
                      : 'This user will lose all administrative privileges and access to admin features.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            loading={isLoading}
          >
            {isElevatingToAdmin ? 'Grant Admin Access' : 'Update Role'}
          </Button>
        </div>
      </div>
    </div>
  );
}
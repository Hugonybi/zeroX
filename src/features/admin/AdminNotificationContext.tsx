import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';
import type { ToastVariant } from '../../components/ui/Toast';

interface AdminNotification {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AdminNotificationContextState {
  notifications: AdminNotification[];
  showNotification: (notification: Omit<AdminNotification, 'id'>) => void;
  showSuccess: (message: string, action?: AdminNotification['action']) => void;
  showError: (message: string, action?: AdminNotification['action']) => void;
  showInfo: (message: string, action?: AdminNotification['action']) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextState | null>(null);

interface AdminNotificationProviderProps {
  children: React.ReactNode;
}

export function AdminNotificationProvider({ children }: AdminNotificationProviderProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const generateId = useCallback(() => {
    return `admin-notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showNotification = useCallback((notification: Omit<AdminNotification, 'id'>) => {
    const id = generateId();
    const newNotification: AdminNotification = {
      id,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, [generateId]);

  const showSuccess = useCallback((message: string, action?: AdminNotification['action']) => {
    showNotification({
      message,
      variant: 'success',
      action,
    });
  }, [showNotification]);

  const showError = useCallback((message: string, action?: AdminNotification['action']) => {
    showNotification({
      message,
      variant: 'error',
      duration: 7000, // Longer duration for errors
      action,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, action?: AdminNotification['action']) => {
    showNotification({
      message,
      variant: 'info',
      action,
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue: AdminNotificationContextState = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    dismissNotification,
    clearAllNotifications,
  };

  return (
    <AdminNotificationContext.Provider value={contextValue}>
      {children}
      {/* Render notifications */}
      <AdminNotificationContainer notifications={notifications} onDismiss={dismissNotification} />
    </AdminNotificationContext.Provider>
  );
}

interface AdminNotificationContainerProps {
  notifications: AdminNotification[];
  onDismiss: (id: string) => void;
}

function AdminNotificationContainer({ notifications, onDismiss }: AdminNotificationContainerProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <AdminNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

interface AdminNotificationItemProps {
  notification: AdminNotification;
  onDismiss: (id: string) => void;
}

function AdminNotificationItem({ notification, onDismiss }: AdminNotificationItemProps) {
  const handleClose = () => {
    onDismiss(notification.id);
  };

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`
      p-4 rounded-lg border shadow-lg animate-slide-in-right
      ${getVariantStyles(notification.variant)}
    `}>
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">
          {getIcon(notification.variant)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {notification.message}
          </p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
}

// Convenience hooks for common notification patterns
export function useAdminSuccessNotification() {
  const { showSuccess } = useAdminNotifications();
  return showSuccess;
}

export function useAdminErrorNotification() {
  const { showError } = useAdminNotifications();
  return showError;
}

export function useAdminInfoNotification() {
  const { showInfo } = useAdminNotifications();
  return showInfo;
}
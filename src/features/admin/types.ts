export interface AdminDashboardStats {
  totalUsers: number;
  totalArtworks: number;
  recentOrders: number;
  failedMints: number;
  queueStatus: QueueStatus;
}

export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface AdminUserList {
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kycStatus: KycStatus;
  createdAt: string;
  _count: {
    artworks: number;
    orders: number;
  };
}

export interface AdminArtworkList {
  artworks: AdminArtworkSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminArtworkSummary {
  id: string;
  title: string;
  type: 'physical' | 'digital';
  price: number;
  createdAt: string;
  artist: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    orders: number;
  };
}

export interface FailedMintOperation {
  id: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  artwork: {
    title: string;
    artistId: string;
  };
  buyer: {
    name: string;
    email: string;
  };
}

export interface SystemHealthStatus {
  database: HealthStatus;
  queue: HealthStatus;
  externalServices: HealthStatus;
  recentErrors: number;
  lastChecked: string;
}

export type HealthStatus = 'healthy' | 'warning' | 'error';

export type UserRole = 'buyer' | 'artist' | 'admin';
export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface AdminAuditLogList {
  logs: AdminAuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  metaJson: any;
  createdAt: string;
}
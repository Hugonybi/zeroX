import { UserRole, KycStatus, ArtworkType, ArtworkStatus } from '@prisma/client';

export interface AdminDashboardStats {
  totalUsers: number;
  totalArtworks: number;
  recentOrders: number;
  failedMints: number;
  queueStatus: QueueStatus;
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
  createdAt: Date;
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
  type: ArtworkType;
  status: ArtworkStatus;
  priceCents: number;
  currency: string;
  createdAt: Date;
  artist: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    orders: number;
  };
}

export interface SystemHealthStatus {
  database: HealthStatus;
  queue: HealthStatus;
  externalServices: HealthStatus;
  recentErrors: number;
  lastChecked: Date;
}

export type HealthStatus = 'healthy' | 'warning' | 'error';

export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface FailedMintOperation {
  id: string;
  orderId: string;
  artworkTitle: string;
  buyerEmail: string;
  failureReason: string;
  lastAttempt: Date;
  retryCount: number;
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
  createdAt: Date;
}
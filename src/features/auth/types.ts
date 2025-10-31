export type UserRole = 'buyer' | 'artist' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  bio?: string;
  role?: UserRole;
}

export interface AuthResponse {
  message: string;
}
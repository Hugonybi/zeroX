import { API_BASE_URL } from '../../config/api';
import { createHttpClient } from '../../lib/http';
import type { LoginPayload, RegisterPayload, AuthResponse, AuthUser } from './types';

const httpClient = createHttpClient(API_BASE_URL);

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return httpClient.post('/auth/login', payload);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return httpClient.post('/auth/register', payload);
}

export async function refreshSession(): Promise<AuthResponse> {
  return httpClient.post('/auth/refresh');
}

export async function logout(): Promise<AuthResponse> {
  return httpClient.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return httpClient.get('/users/me');
}
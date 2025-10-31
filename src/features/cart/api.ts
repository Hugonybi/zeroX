import { API_BASE_URL } from '../../config/api';
import { createHttpClient } from '../../lib/http';
import type { 
  CartItem, 
  AddToCartPayload, 
  UpdateCartItemPayload, 
  MigrateCartPayload,
  CartResponse,
  CartValidationResult 
} from '../../types/cart';

const httpClient = createHttpClient(API_BASE_URL);

export async function getCartItems(): Promise<CartItem[]> {
  const response = await httpClient.get<CartResponse>('/cart');
  return response.items;
}

export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  return httpClient.post<CartItem>('/cart/items', payload);
}

export async function removeFromCart(artworkId: string): Promise<void> {
  return httpClient.delete(`/cart/items/${artworkId}`);
}

export async function updateCartItem(artworkId: string, payload: UpdateCartItemPayload): Promise<CartItem> {
  return httpClient.put<CartItem>(`/cart/items/${artworkId}`, payload);
}

export async function clearCart(): Promise<void> {
  return httpClient.delete('/cart');
}

export async function migrateGuestCart(payload: MigrateCartPayload): Promise<CartItem[]> {
  const response = await httpClient.post<CartResponse>('/cart/migrate', payload);
  return response.items;
}

export async function validateCart(): Promise<CartValidationResult> {
  return httpClient.get<CartValidationResult>('/cart/validate');
}

export async function checkoutCart(payload: import('../../types/order').CartCheckoutRequest): Promise<import('../../types/order').CartCheckoutResponse> {
  return httpClient.post<import('../../types/order').CartCheckoutResponse>('/cart/checkout', payload);
}

export async function getCheckoutStatus(sessionId: string): Promise<import('../../types/order').ConsolidatedOrderStatus> {
  return httpClient.get<import('../../types/order').ConsolidatedOrderStatus>(`/cart/checkout/${sessionId}`);
}

export async function getExpiringCartItems(): Promise<CartItem[]> {
  return httpClient.get<CartItem[]>('/cart/expiring');
}
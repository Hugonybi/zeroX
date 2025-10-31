import type { Artwork } from './artwork';

export interface CartItem {
  id: string;
  artworkId: string;
  artwork: Artwork;
  purchaseOption?: 'physical' | 'digital';
  addedAt: Date;
  isAvailable: boolean;
}

export interface AddToCartPayload {
  artworkId: string;
  purchaseOption?: 'physical' | 'digital';
}

export interface UpdateCartItemPayload {
  artworkId: string;
  purchaseOption?: 'physical' | 'digital';
}

export interface MigrateCartPayload {
  items: GuestCartItem[];
}

export interface GuestCartItem {
  artworkId: string;
  purchaseOption?: 'physical' | 'digital';
  addedAt: string; // ISO string for localStorage serialization
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartValidationResult {
  valid: boolean;
  unavailableItems: string[];
  message?: string;
}

export interface CartError {
  code: 'NETWORK_ERROR' | 'ARTWORK_UNAVAILABLE' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  artworkId?: string;
}
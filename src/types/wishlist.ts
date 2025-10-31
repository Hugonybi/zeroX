import type { Artwork } from './artwork';

export interface WishlistItem {
  id: string;
  artworkId: string;
  artwork: Artwork;
  addedAt: Date;
  isAvailable: boolean;
  availabilityChanged: boolean;
}

export interface AddToWishlistPayload {
  artworkId: string;
}

export interface MigrateWishlistPayload {
  items: GuestWishlistItem[];
}

export interface GuestWishlistItem {
  artworkId: string;
  addedAt: string; // ISO string for localStorage serialization
}

export interface WishlistResponse {
  items: WishlistItem[];
  totalItems: number;
}

export interface WishlistError {
  code: 'NETWORK_ERROR' | 'ARTWORK_UNAVAILABLE' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  artworkId?: string;
}
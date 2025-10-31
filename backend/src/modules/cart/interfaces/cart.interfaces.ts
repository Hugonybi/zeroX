import { CartItem, Artwork } from '@prisma/client';

export interface CartItemWithArtwork extends CartItem {
  artwork: Artwork;
}

export interface ValidationResult {
  isValid: boolean;
  invalidItems: string[];
  unavailableItems: string[];
}

export interface CartSummary {
  items: CartItemWithArtwork[];
  totalItems: number;
  totalPrice: number;
  currency: string;
}
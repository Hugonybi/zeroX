import type { 
  WishlistItem, 
  AddToWishlistPayload, 
  MigrateWishlistPayload,
  WishlistResponse 
} from '../../types/wishlist';

const API_BASE = '/api/wishlist';

// Get user's wishlist items
export async function getWishlistItems(): Promise<WishlistItem[]> {
  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wishlist: ${response.status}`);
  }

  const data: WishlistResponse = await response.json();
  return data.items.map(item => ({
    ...item,
    addedAt: new Date(item.addedAt),
  }));
}

// Add item to wishlist
export async function addToWishlist(payload: AddToWishlistPayload): Promise<WishlistItem> {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to add to wishlist: ${response.status}`);
  }

  const item: WishlistItem = await response.json();
  return {
    ...item,
    addedAt: new Date(item.addedAt),
  };
}

// Remove item from wishlist
export async function removeFromWishlist(artworkId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/items/${artworkId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to remove from wishlist: ${response.status}`);
  }
}

// Move item from wishlist to cart
export async function moveToCart(artworkId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/move-to-cart/${artworkId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to move to cart: ${response.status}`);
  }
}

// Migrate guest wishlist to authenticated user
export async function migrateGuestWishlist(payload: MigrateWishlistPayload): Promise<WishlistItem[]> {
  const response = await fetch(`${API_BASE}/migrate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to migrate wishlist: ${response.status}`);
  }

  const data: WishlistResponse = await response.json();
  return data.items.map(item => ({
    ...item,
    addedAt: new Date(item.addedAt),
  }));
}

// Check availability status for multiple artworks
export async function checkAvailabilityStatus(artworkIds: string[]): Promise<Record<string, boolean>> {
  const response = await fetch('/api/artworks/availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ artworkIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to check availability: ${response.status}`);
  }

  return await response.json();
}
import { WishlistItem, Artwork } from '@prisma/client';

export interface WishlistItemWithArtwork extends WishlistItem {
  artwork: Artwork;
}

export interface WishlistSummary {
  items: WishlistItemWithArtwork[];
  totalItems: number;
}

export interface AvailabilityChangeNotification {
  artworkId: string;
  artworkTitle: string;
  isAvailable: boolean;
  userId: string;
}
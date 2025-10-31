import type { Artwork } from '../../types/artwork';

export const SORT_OPTIONS = [
  'date_desc',
  'date_asc',
  'price_asc',
  'price_desc',
  'title_asc',
] as const;

export type SortOption = typeof SORT_OPTIONS[number];

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  date_desc: 'Newest First',
  date_asc: 'Oldest First',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  title_asc: 'Title: A-Z',
} as const;

export function isSortOption(value: string | null): value is SortOption {
  return value !== null && (SORT_OPTIONS as readonly string[]).includes(value);
}

export interface SearchQuery {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: 'physical' | 'digital';
  category?: string;
  artistId?: string;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

export interface SearchFilters {
  priceRange: [number, number];
  artworkType: 'all' | 'physical' | 'digital';
  category?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResponse {
  artworks: Artwork[];
  pagination: PaginationInfo;
}

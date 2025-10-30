import type { Artwork } from '../../types/artwork';

export interface SearchQuery {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: 'physical' | 'digital';
  category?: string;
  artistId?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'title_asc';
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

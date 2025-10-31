import { useState, useCallback } from 'react';
import type { SearchQuery, SearchResponse } from '../types';
import { API_BASE_URL } from '../../../config/api';

export function useSearch() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: SearchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (query.query) params.append('query', query.query);
      if (query.minPrice !== undefined) params.append('minPrice', query.minPrice.toString());
      if (query.maxPrice !== undefined) params.append('maxPrice', query.maxPrice.toString());
      if (query.type) params.append('type', query.type);
      if (query.category) params.append('category', query.category);
      if (query.artistId) params.append('artistId', query.artistId);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await fetch(`${API_BASE_URL}/artworks/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    reset,
  };
}

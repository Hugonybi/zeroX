import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, USE_MOCK_ARTWORKS } from "../config/api";
import { createHttpClient, type HttpClient } from "../lib/http";
import type { Artwork, ArtworkFilters } from "../types/artwork";
import { mockArtworks } from "../data/mockArtworks";

export type UseArtworksResult = {
  data: Artwork[];
  isLoading: boolean;
  error: Error | null;
  refetch: (filters?: ArtworkFilters) => Promise<void>;
};

const httpClient: HttpClient = createHttpClient(API_BASE_URL);

type CacheEntry = {
  data: Artwork[];
  filtersSignature: string;
  expiresAt: number;
};

let cacheEntry: CacheEntry | null = null;
const CACHE_TTL_MS = 60_000;

const serializeFilters = (filters?: ArtworkFilters) => {
  if (!filters) return "{}";
  return JSON.stringify(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .sort(([a], [b]) => a.localeCompare(b))
  );
};

export function useArtworks(initialFilters?: ArtworkFilters): UseArtworksResult {
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
    if (USE_MOCK_ARTWORKS) {
      return transformMockArtworks();
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(!(cacheEntry && cacheEntry.expiresAt > Date.now()) && !USE_MOCK_ARTWORKS);
  const [error, setError] = useState<Error | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const mountedRef = useRef<boolean>(false);

  const fetchArtworks = useCallback(
    async (filters?: ArtworkFilters) => {
      const signature = serializeFilters(filters ?? initialFilters);
      if (!USE_MOCK_ARTWORKS && cacheEntry && cacheEntry.filtersSignature === signature && cacheEntry.expiresAt > Date.now()) {
        setArtworks(cacheEntry.data);
        return;
      }

      setIsLoading(true);
      setError(null);

      if (activeRequest.current) {
        activeRequest.current.abort();
      }

      const controller = new AbortController();
      activeRequest.current = controller;

      try {
        const query = buildQuery(filters);
        const response = await httpClient.get<Artwork[]>(`/artworks${query}`, {
          signal: controller.signal,
        });

        cacheEntry = {
          data: response,
          filtersSignature: signature,
          expiresAt: Date.now() + CACHE_TTL_MS,
        };
        if (mountedRef.current) {
          setArtworks(response);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }

        if (USE_MOCK_ARTWORKS) {
          console.warn("Falling back to mock artworks due to API error", err);
          setArtworks((previous) => (previous.length ? previous : transformMockArtworks()));
        } else {
          setError(err as Error);
          cacheEntry = null;
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [initialFilters]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchArtworks(initialFilters).catch((err) => {
      console.error("Failed to fetch artworks", err);
    });

    return () => {
      mountedRef.current = false;
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
    };
  }, [fetchArtworks, initialFilters]);

  const refetch = useCallback(
    async (nextFilters?: ArtworkFilters) => {
      cacheEntry = null;
      await fetchArtworks(nextFilters ?? initialFilters);
    },
    [fetchArtworks, initialFilters]
  );

  return useMemo(
    () => ({
      data: artworks,
      isLoading,
      error,
      refetch,
    }),
    [artworks, isLoading, error, refetch]
  );
}

function buildQuery(filters?: ArtworkFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.artist) params.set("artist", filters.artist);
  if (typeof filters.minPrice === "number") params.set("min_price", String(filters.minPrice));
  if (typeof filters.maxPrice === "number") params.set("max_price", String(filters.maxPrice));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function parsePriceToCents(price: string): number {
  const digits = price.replace(/[^\d.]/g, "");
  const value = Number(digits);
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.round(value * 100);
}

function transformMockArtworks(): Artwork[] {
  const now = new Date().toISOString();
  return mockArtworks.map((artwork) => ({
    id: artwork.id,
    artistId: "mock-artist",
    artistName: artwork.artist,
    title: artwork.title,
    description: "",
    type: "digital",
    mediaUrl: artwork.imageUrl ?? "",
    metadataUrl: null,
    serialNumber: null,
    edition: null,
    priceCents: parsePriceToCents(artwork.price),
    currency: "NGN",
    status: "published",
    createdAt: now,
    updatedAt: now,
  }));
}

import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ArtworkCard } from "../components/ArtworkCard";
import { GalleryHero } from "../components/GalleryHero";
import { Button } from "../components/ui/Button";
import { useArtworks } from "../hooks/useArtworks";
import { FilterPanel } from "../features/search/components/FilterPanel";
import { SortControls } from "../features/search/components/SortControls";
import { useSearch } from "../features/search/hooks/useSearch";
import type { SearchFilters, SortOption } from "../features/search/types";
import { isSortOption } from "../features/search/types";

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: artworks, isLoading: isLoadingDefault, error: errorDefault, refetch } = useArtworks();
  const { results, loading: searchLoading, error: searchError, search } = useSearch();
  
  const initialQuery = searchParams.get("q") || "";
  const initialSortParam = searchParams.get("sort");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(
    isSortOption(initialSortParam) ? initialSortParam : "date_desc"
  );
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [
      parseInt(searchParams.get("minPrice") || "0", 10),
      parseInt(searchParams.get("maxPrice") || "1000000", 10)
    ],
    artworkType: (searchParams.get("type") as 'all' | 'physical' | 'digital') || 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  const normalizedQuery = searchQuery.trim();

  // Determine if we're using search or default browse
  const isSearching =
    normalizedQuery.length > 0 ||
    filters.artworkType !== 'all' ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000000;

  const isLoading = isSearching ? searchLoading : isLoadingDefault;
  const error = isSearching ? searchError : errorDefault;

  // Use search results or default artworks
  const currentArtworks = useMemo(
    () => (isSearching && results ? results.artworks : artworks) ?? [],
    [isSearching, results, artworks]
  );

  // Effect to perform search when query changes
  useEffect(() => {
    if (isSearching) {
      search({
        query: normalizedQuery || undefined,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < 1000000 ? filters.priceRange[1] : undefined,
        type: filters.artworkType !== 'all' ? filters.artworkType : undefined,
        sortBy,
      });
    }
  }, [normalizedQuery, filters, sortBy, isSearching, search]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
  if (normalizedQuery) params.set("q", normalizedQuery);
    if (sortBy !== "date_desc") params.set("sort", sortBy);
    if (filters.artworkType !== 'all') params.set("type", filters.artworkType);
    if (filters.priceRange[0] > 0) params.set("minPrice", filters.priceRange[0].toString());
    if (filters.priceRange[1] < 1000000) params.set("maxPrice", filters.priceRange[1].toString());
    setSearchParams(params, { replace: true });
  }, [normalizedQuery, sortBy, filters, setSearchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("date_desc");
    setFilters({
      priceRange: [0, 1000000],
      artworkType: 'all',
    });
  };

  const displayArtworks = useMemo(
    () =>
      currentArtworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artistName ?? artwork.artist?.name ?? "Unknown artist",
        price: formatPrice(artwork.priceCents, artwork.currency),
        imageUrl: artwork.mediaUrl,
      })),
    [currentArtworks]
  );

  return (
    <section className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-0 lg:px-0">
      <GalleryHero onSearch={handleSearch} searchQuery={searchQuery} />

      <div className="space-y-6">
        {/* <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? "Hide advanced filters" : "Advanced filters"}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <SortControls value={sortBy} onChange={handleSortChange} />
            </div>

            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>
        )} */}

        {isSearching && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {normalizedQuery && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                Search: {normalizedQuery}
              </span>
            )}
            {filters.artworkType !== 'all' && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                Type: {filters.artworkType}
              </span>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                Price: ${filters.priceRange[0] / 100} - ${filters.priceRange[1] / 100}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Clear all
            </Button>
          </div>
        )}

        {results && (
          <div className="text-sm text-gray-600">
            Found {results.pagination.total} artwork{results.pagination.total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {error && !displayArtworks.length && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          <p className="uppercase tracking-[0.35em]">Unable to load artworks</p>
          <p className="mt-2 text-rose-600/80">{typeof error === 'string' ? error : error?.message || 'Unknown error'}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-y-20 lg:grid-cols-3 gap-x-12 sm:grid-cols-2">
        {isLoading && !displayArtworks.length &&
          Array.from({ length: 4 }).map((_, index) => <ArtworkSkeleton key={`artwork-skeleton-${index}`} />)}

        {displayArtworks.map((artwork) => (
          <Link key={artwork.id} to={`/artworks/${artwork.id}`} className="group">
            <ArtworkCard
              title={artwork.title}
              artist={artwork.artist}
              price={artwork.price}
              imageUrl={artwork.imageUrl}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

function formatPrice(priceCents: number, currency: string) {
  if (!Number.isFinite(priceCents)) {
    return "--";
  }

  try {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    });

    return formatter.format(priceCents / 100);
  } catch (error) {
    console.warn("Unsupported currency for formatting", currency, error);
    return `${currency} ${(priceCents / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
  }
}

function ArtworkSkeleton() {
  return (
    <div className="w-full min-h-80 animate-pulse rounded-3xl border border-charcoal/10 bg-white p-5">
      <div className="h-40 w-full rounded-2xl bg-charcoal/10" />
      <div className="mt-6 space-y-3">
        <div className="h-3 w-2/3 rounded-full bg-charcoal/10" />
        <div className="h-3 w-1/3 rounded-full bg-charcoal/10" />
        <div className="h-3 w-1/2 rounded-full bg-charcoal/10" />
      </div>
    </div>
  );
}

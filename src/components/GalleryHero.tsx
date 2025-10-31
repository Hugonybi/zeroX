import { SearchBar } from "../features/search/components/SearchBar";

interface GalleryHeroProps {
  onSearch?: (q: string) => void;
  searchQuery?: string;
}

export function GalleryHero({ onSearch, searchQuery }: GalleryHeroProps) {
  return (
    <div className="mx-auto max-w-4xl text-center space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Featured</p>
      <h2 className="font-brand text-5xl md:text-6xl uppercase tracking-widest">Discover Art With Provenance</h2>
      <p className="mx-auto max-w-2xl text-sm text-ink-muted">
        Browse hand-picked works authenticated on Hedera. Every purchase mints a unique certificate of authenticity—no crypto
        wallets required.
      </p>

      {/* Centered search in hero to match new layout */}
      {onSearch && (
        <div className="mt-4 flex justify-center">
          <SearchBar
            onSearch={onSearch}
            initialValue={searchQuery}
            placeholder="Search artworks, artists, or styles..."
          />
        </div>
      )}
    </div>
  );
}

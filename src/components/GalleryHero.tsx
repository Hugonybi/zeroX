import { SearchBar } from "../features/search/components/SearchBar";

interface GalleryHeroProps {
  onSearch?: (q: string) => void;
  searchQuery?: string;
}

export function GalleryHero({ onSearch, searchQuery }: GalleryHeroProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-5 text-center">
      <h2 className="font-brand text-md sm:text-5xl md:text-[3.25rem] uppercase tracking-[0.25em]">
        Discover Art With Provenance
      </h2>
      <p className="mx-auto max-w-md text-sm text-emerald-500">
        Browse hand-picked works authenticated on Hedera. Every purchase mints a unique certificate of authenticity—no crypto
        wallets required.
      </p>

      {/* Centered search in hero to match new layout */}
      {onSearch && (
        <div className="mt-6 flex justify-center">
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

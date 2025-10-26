import { mockArtworks } from "../data/mockArtworks";
import { ArtworkCard } from "./ArtworkCard";

export function GalleryPreview() {
  return (
    <section className="space-y-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-brand text-2xl uppercase tracking-[0.3em] text-ink">Featured Works</h2>
        <a className="text-sm font-semibold uppercase tracking-[0.2em] text-ink" href="#browse">
          Browse All
        </a>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {mockArtworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            title={artwork.title}
            artist={artwork.artist}
            price={artwork.price}
            imageUrl={artwork.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}

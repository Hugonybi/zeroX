import { Link } from "react-router-dom";
import { ArtworkCard } from "../components/ArtworkCard";
import { mockArtworks } from "../data/mockArtworks";

export function GalleryPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Featured</p>
        <h2 className="font-brand text-4xl uppercase tracking-widest[0.1em]">Discover art with provenance</h2>
        <p className="max-w-xl text-sm text-ink-muted">
          Browse hand-picked works authenticated on Hedera. Every purchase mints a unique certificate of authenticity—no crypto wallets required.
        </p>
      </div>

      <div className="grid  gap-10 sm:grid-cols-2 xl:grid-cols-4">
        {mockArtworks.map((artwork) => (
          <Link
            key={artwork.id}
            to={`/artworks/${artwork.id}`}
            className="group"
          >
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

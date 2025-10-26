import { Link, useNavigate } from "react-router-dom";
import { ArtworkCard } from "../components/ArtworkCard";
import { GalleryHero } from "../components/GalleryHero";
import { mockArtworks } from "../data/mockArtworks";
import { Button } from "../components/ui/Button";

export function GalleryPage() {
  const navigate = useNavigate();

  return (
    <section className="space-y-10">
      <div className="space-y-6">
        <GalleryHero />

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate("/artists")}>Post artwork</Button>
          <span className="text-xs uppercase tracking-[0.35em] text-ink-muted">
            Share your next release with provenance built in.
          </span>
        </div>
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

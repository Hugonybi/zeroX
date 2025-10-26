import { Link } from "react-router-dom";
import { ArtworkCard } from "../components/ArtworkCard";
import { GalleryHero } from "../components/GalleryHero";
import { mockArtworks } from "../data/mockArtworks";

export function GalleryPage() {
  return (
    <section className="space-y-10">
      <GalleryHero />

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

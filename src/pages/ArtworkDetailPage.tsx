import { Link, Navigate, useParams } from "react-router-dom";
import { ArtworkDetails } from "../components/ArtworkDetails";
import { mockArtworks } from "../data/mockArtworks";

export function ArtworkDetailPage() {
  const { artworkId } = useParams<{ artworkId: string }>();
  const artwork = mockArtworks.find((item) => item.id === artworkId);

  if (!artwork) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="space-y-12">
      <Link to="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted transition-colors hover:text-ink">
        ← Back to gallery
      </Link>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
        <div className="aspect-4/5 w-full rounded-3xl bg-stone/40 shadow-brand">
          {artwork.imageUrl ? (
            <img src={artwork.imageUrl} alt={artwork.title} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <ArtworkDetails
          editionLabel="1 of 1"
          title={artwork.title}
          artist={artwork.artist}
          price={artwork.price}
          tokenId={`0.0.${artwork.id.slice(-4)}`}
        />
      </div>
    </section>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ArtworkCard } from "../components/ArtworkCard";
import { GalleryHero } from "../components/GalleryHero";
import { Button } from "../components/ui/Button";
import { useArtworks } from "../hooks/useArtworks";

export function GalleryPage() {
  const navigate = useNavigate();
  const { data: artworks, isLoading, error, refetch } = useArtworks();

  const displayArtworks = useMemo(
    () =>
      artworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artistName ?? "Unknown artist",
        price: formatPrice(artwork.priceCents, artwork.currency),
        imageUrl: artwork.mediaUrl,
      })),
    [artworks]
  );

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

      {error && !displayArtworks.length && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          <p className="uppercase tracking-[0.35em]">Unable to load artworks</p>
          <p className="mt-2 text-rose-600/80">{error.message}</p>
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

      <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
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

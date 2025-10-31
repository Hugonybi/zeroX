import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArtworkDetails } from "../components/ArtworkDetails";
import { ArtworkSpecifications } from "../features/artwork/components/ArtworkSpecifications";
import { API_BASE_URL, USE_MOCK_ARTWORKS } from "../config/api";
import { createHttpClient } from "../lib/http";
import type { Artwork } from "../types/artwork";
import { mockArtworks } from "../data/mockArtworks";

const httpClient = createHttpClient(API_BASE_URL);

export function ArtworkDetailPage() {
  const { artworkId } = useParams<{ artworkId: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artworkId) return;

    const fetchArtwork = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (USE_MOCK_ARTWORKS) {
          const mockArtwork = mockArtworks.find((item) => item.id === artworkId);
          if (mockArtwork) {
            const now = new Date().toISOString();
            setArtwork({
              id: mockArtwork.id,
              artistId: "mock-artist",
              artistName: mockArtwork.artist,
              title: mockArtwork.title,
              description: "",
              type: "digital",
              mediaUrl: mockArtwork.imageUrl ?? "",
              metadataUrl: null,
              serialNumber: null,
              edition: null,
              priceCents: 0, // mock
              currency: "NGN",
              status: "published",
              createdAt: now,
              updatedAt: now,
            });
          } else {
            setError("Artwork not found");
          }
        } else {
          const response = await httpClient.get<Artwork>(`/artworks/${artworkId}`);
          setArtwork(response);
        }
      } catch (err) {
        console.error("Failed to fetch artwork", err);
        setError("Failed to load artwork");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtwork();
  }, [artworkId]);

  if (!artworkId || (error && !isLoading)) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-muted">
        Loading artwork...
      </div>
    );
  }

  if (!artwork) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink/20 hover:bg-ink/5"
        >
          <span aria-hidden className="text-base leading-none">←</span>
          Back to Gallery
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="flex flex-col gap-10 ">
          <div className="relative overflow-hidden bg-linear-to-br from-neutral-100 via-neutral-100 to-stone-200 shadow-[0_36px_64px_-32px_rgba(16,16,16,0.4)]">
            <div className="relative aspect-[4/3] w-full">
              {artwork.mediaUrl ? (
                <img src={artwork.mediaUrl} alt={artwork.title} className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 text-sm font-semibold text-ink-muted">
                  Image coming soon
                </div>
              )}
            </div>
          </div>

          {artwork.description ? (
            <article className=" bg-white/80 p-8 shadow-sm backdrop-blur-sm">
              <h3 className="text-base font-semibold text-ink">About this artwork</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">{artwork.description}</p>
            </article>
          ) : null}
        </div>

        <div className="flex flex-col gap-8 lg:ml-auto lg:max-w-md">
          <div className="bg-white p-8 ">
            <ArtworkDetails
              artworkId={artwork.id}
              editionLabel={artwork.edition ? `${artwork.edition} of ${artwork.edition}` : "1 of 1"}
              title={artwork.title}
              artist={artwork.artistName ?? artwork.artist?.name ?? "Unknown artist"}
              price={formatPrice(artwork.priceCents, artwork.currency)}
              tokenId={`0.0.${artwork.id.slice(-4)}`}
              status={artwork.status}
              artwork={artwork}
            />
          </div>

          {/* <aside className="rounded-[28px] border border-ink/10 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-muted">Specifications</h3>
            <div className="mt-4 text-sm text-ink">
              <ArtworkSpecifications artwork={artwork} showFullDetails />
            </div>
          </aside> */}
        </div>
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

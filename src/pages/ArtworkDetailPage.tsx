import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArtworkDetails } from "../components/ArtworkDetails";
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
    return <div>Loading...</div>;
  }

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
          {artwork.mediaUrl ? (
            <img src={artwork.mediaUrl} alt={artwork.title} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <ArtworkDetails
          artworkId={artwork.id}
          editionLabel={artwork.edition ? `${artwork.edition} of ${artwork.edition}` : "1 of 1"}
          title={artwork.title}
          artist={artwork.artistName ?? "Unknown artist"}
          price={formatPrice(artwork.priceCents, artwork.currency)}
          tokenId={`0.0.${artwork.id.slice(-4)}`}
          status={artwork.status}
        />
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

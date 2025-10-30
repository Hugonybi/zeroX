import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { createHttpClient } from "../lib/http";
import { ArtworkCard } from "../components/ArtworkCard";
import type { Artwork } from "../types/artwork";

const httpClient = createHttpClient(API_BASE_URL);

interface ArtistProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  education?: string;
  exhibitions?: string[];
  awards?: string[];
  totalSales: number;
  averageRating?: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface PortfolioResponse {
  artworks: Artwork[];
  stats: {
    totalArtworks: number;
    availableArtworks: number;
    soldArtworks: number;
  };
}

export function ArtistProfilePage() {
  const { artistId } = useParams<{ artistId: string }>();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const fetchArtistData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [profileData, portfolioData] = await Promise.all([
          httpClient.get<ArtistProfile>(`/artists/profile/${artistId}`),
          httpClient.get<PortfolioResponse>(`/artists/${artistId}/portfolio?includeStats=true`),
        ]);

        setProfile(profileData);
        setPortfolio(portfolioData);
      } catch (err) {
        console.error("Failed to fetch artist data", err);
        setError("Failed to load artist profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  if (!artistId || (error && !isLoading)) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading artist profile...</div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const displayName = profile.displayName || profile.user.name;

  return (
    <section className="space-y-12">
      <Link
        to="/"
        className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted transition-colors hover:text-ink"
      >
        ← Back to gallery
      </Link>

      {/* Artist Header */}
      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
        {/* Profile Image */}
        <div className="flex justify-center lg:justify-start">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={displayName}
              className="h-32 w-32 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <h1 className="font-brand text-4xl text-ink mb-2">{displayName}</h1>
            <p className="text-sm text-ink-muted uppercase tracking-[0.3em]">Artist</p>
          </div>

          {profile.bio && (
            <p className="text-gray-700 max-w-2xl leading-relaxed">{profile.bio}</p>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap gap-4">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                🌐 Website
              </a>
            )}
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                📷 Instagram
              </a>
            )}
            {profile.twitter && (
              <a
                href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                🐦 Twitter
              </a>
            )}
          </div>

          {/* Statistics */}
          {portfolio && (
            <div className="flex flex-wrap gap-6 pt-4 border-t">
              <div>
                <div className="text-2xl font-bold text-ink">{portfolio.stats.totalArtworks}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">Total Works</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{portfolio.stats.availableArtworks}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-500">{portfolio.stats.soldArtworks}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">Sold</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info */}
      {(profile.education || (profile.exhibitions && profile.exhibitions.length > 0) || (profile.awards && profile.awards.length > 0)) && (
        <div className="grid gap-8 md:grid-cols-3 border-t pt-8">
          {profile.education && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-ink-muted mb-3">
                Education
              </h3>
              <p className="text-sm text-gray-700">{profile.education}</p>
            </div>
          )}

          {profile.exhibitions && profile.exhibitions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-ink-muted mb-3">
                Exhibitions
              </h3>
              <ul className="space-y-1">
                {profile.exhibitions.map((exhibition, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {exhibition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.awards && profile.awards.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-ink-muted mb-3">
                Awards
              </h3>
              <ul className="space-y-1">
                {profile.awards.map((award, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    🏆 {award}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Portfolio */}
      <div className="space-y-6 border-t pt-8">
        <h2 className="font-brand text-2xl text-ink">Portfolio</h2>

        {portfolio && portfolio.artworks.length > 0 ? (
          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
            {portfolio.artworks.map((artwork) => (
              <Link key={artwork.id} to={`/artworks/${artwork.id}`} className="group">
                <ArtworkCard
                  title={artwork.title}
                  artist={displayName}
                  price={formatPrice(artwork.priceCents, artwork.currency)}
                  imageUrl={artwork.mediaUrl}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No artworks available yet.</p>
          </div>
        )}
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

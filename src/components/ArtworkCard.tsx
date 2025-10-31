import { useState } from "react";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";
import type { Artwork } from "../types/artwork";

interface ArtworkCardProps {
  title: string;
  artist: string;
  price: string;
  imageUrl?: string;
  artwork?: Artwork;
}

export function ArtworkCard({ title, artist, price, imageUrl, artwork }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !imageUrl || imageError;

  return (
    <article className="flex flex-col gap-4">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-stone-500 shadow-brand">
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-stone/60 via-stone/30 to-white">
            <span className="font-brand text-2xl uppercase tracking-[0.35em] text-ink/40">Artwork</span>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {artwork && (
          <div className="absolute top-3 right-3">
            <WishlistButton 
              artwork={artwork}
              size="sm"
              variant="ghost"
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            />
          </div>
        )}
      </div>
      <header className="space-y-1 text-sm">
        <p className="font-semibold uppercase  text-ink">{price}</p>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="text-ink-muted">by {artist}</p>
      </header>
      {artwork && (
        <div 
          className="mt-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <AddToCartButton 
            artwork={artwork}
            variant="primary"
            size="md"
            className="w-full"
          />
        </div>
      )}
    </article>
  );
}

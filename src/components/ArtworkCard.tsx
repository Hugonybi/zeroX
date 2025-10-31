import { useState } from "react";

interface ArtworkCardProps {
  title: string;
  artist: string;
  price: string;
  imageUrl?: string;
}

export function ArtworkCard({ title, artist, price, imageUrl }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !imageUrl || imageError;

  return (
    <article className="flex flex-col gap-4">
      <div className="aspect-4/3 w-full overflow-hidden bg-stone-500 shadow-brand">
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
      </div>
      <header className="space-y-1 text-sm">
        <p className="font-semibold uppercase  text-ink">{price}</p>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="text-ink-muted">by {artist}</p>
      </header>
    </article>
  );
}

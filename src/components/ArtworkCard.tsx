interface ArtworkCardProps {
  title: string;
  artist: string;
  price: string;
  imageUrl?: string;
}

export function ArtworkCard({ title, artist, price, imageUrl }: ArtworkCardProps) {
  return (
    <article className="flex flex-col gap-4">
      <div className="aspect-ratio[4/5] h-80 w-full max-w-sm overflow-hidden rounded-2xl bg-stone/40 shadow-brand">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone/40 via-white to-stone">
            <span className="font-brand text-xl uppercase tracking-widest text-ink/40">Artwork</span>
          </div>
        )}
      </div>
      <header className="space-y-1">
        <h3 className="max-w-xs text-base font-semibold text-ink">
          {title}
        </h3>
        <p className="text-sm text-ink-muted">by {artist}</p>
        <p className="text-base text-black/70 font-semibold text-ink">{price}</p>
      </header>
    </article>
  );
}

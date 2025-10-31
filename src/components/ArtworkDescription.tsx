interface ArtworkDescriptionProps {
  description?: string | null;
}

export function ArtworkDescription({ description }: ArtworkDescriptionProps) {
  if (!description) {
    return null;
  }

  return (
    <article className="bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <h3 className="text-base font-semibold text-ink">About this artwork</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">{description}</p>
    </article>
  );
}

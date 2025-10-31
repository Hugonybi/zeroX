interface ArtworkImageProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: string;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  className?: string;
  wrapperClassName?: string;
  showPlaceholder?: boolean;
}

export function ArtworkImage({
  src,
  alt,
  aspectRatio = "3/4",
  maxWidth = 700,
  maxHeight,
  minWidth,
  className,
  wrapperClassName,
  showPlaceholder = true,
}: ArtworkImageProps) {
  const baseWrapperClass = "relative overflow-hidden bg-linear-to-br from-neutral-500 via-neutral-100 to-stone-200 shadow-[0_36px_64px_-32px_rgba(16,16,16,0.4)] w-full";
  const wrapperClassNames = wrapperClassName ? `${baseWrapperClass} ${wrapperClassName}` : baseWrapperClass;
  
  const baseImageClass = "absolute inset-0 h-full w-full object-cover";
  const imageClassNames = className ? `${baseImageClass} ${className}` : baseImageClass;

  return (
    <div
      className={wrapperClassNames}
      style={{ 
        maxWidth: `${maxWidth}px`, 
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        minWidth: minWidth ? `${minWidth}px` : undefined 
      }}
    >
      <div 
        className="relative w-full"
        style={{ aspectRatio, minHeight: "500px" }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className={imageClassNames}
          />
        ) : showPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 text-sm font-semibold text-ink-muted">
            Image coming soon
          </div>
        ) : null}
      </div>
    </div>
  );
}

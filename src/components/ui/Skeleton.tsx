import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  className,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-stone/20';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width,
    height: variant === 'text' ? '1em' : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(baseClasses, variantClasses.text)}
            style={{ ...style, width: index === lines - 1 ? '80%' : width }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  );
}

// Composite skeletons for common use cases
export function ArtworkCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="rectangular" height="300px" className="aspect-4/5" />
      <div className="space-y-2">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-stone/20 bg-white p-4">
      <Skeleton variant="rectangular" width="96px" height="96px" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  );
}

export function ArtistProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <Skeleton variant="circular" width="120px" height="120px" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="200px" height="2em" />
          <Skeleton variant="text" lines={3} />
        </div>
      </div>
      <Skeleton variant="rectangular" height="200px" />
    </div>
  );
}

import type { Artwork } from '../../../types/artwork';

interface ArtworkSpecificationsProps {
  artwork: Artwork;
  showFullDetails?: boolean;
}

export function ArtworkSpecifications({ artwork, showFullDetails = false }: ArtworkSpecificationsProps) {
  const formatDimensions = () => {
    const { dimensionHeight, dimensionWidth, dimensionDepth, dimensionUnit = 'cm' } = artwork;
    
    if (!dimensionHeight && !dimensionWidth) return null;
    
    const parts = [];
    if (dimensionHeight) parts.push(`H: ${dimensionHeight}${dimensionUnit}`);
    if (dimensionWidth) parts.push(`W: ${dimensionWidth}${dimensionUnit}`);
    if (dimensionDepth) parts.push(`D: ${dimensionDepth}${dimensionUnit}`);
    
    return parts.join(' × ');
  };

  const dimensions = formatDimensions();

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        {artwork.medium && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Medium</dt>
            <dd className="mt-1 text-sm text-gray-900">{artwork.medium}</dd>
          </div>
        )}
        
        {artwork.yearCreated && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Year</dt>
            <dd className="mt-1 text-sm text-gray-900">{artwork.yearCreated}</dd>
          </div>
        )}

        {dimensions && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
            <dd className="mt-1 text-sm text-gray-900">{dimensions}</dd>
          </div>
        )}

        {artwork.category && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{artwork.category}</dd>
          </div>
        )}
      </div>

      {/* Edition Info */}
      {artwork.edition && (
        <div>
          <dt className="text-sm font-medium text-gray-500">Edition</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {artwork.isUnique ? 'Unique Piece (1/1)' : `Edition ${artwork.edition}`}
          </dd>
        </div>
      )}

      {/* Availability */}
      <div>
        <dt className="text-sm font-medium text-gray-500">Availability</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {artwork.availableQuantity !== undefined && artwork.availableQuantity > 0 ? (
            <span className="text-green-600">
              {artwork.isUnique ? 'Available' : `${artwork.availableQuantity} available`}
            </span>
          ) : (
            <span className="text-red-600">Sold Out</span>
          )}
        </dd>
      </div>

      {/* Tags */}
      {artwork.tags && artwork.tags.length > 0 && showFullDetails && (
        <div>
          <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
          <dd className="flex flex-wrap gap-2">
            {artwork.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </dd>
        </div>
      )}
    </div>
  );
}

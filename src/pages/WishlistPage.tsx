import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useCart } from '../features/cart/CartContext';
import { ArtworkCard } from '../components/ArtworkCard';
import { WishlistButton } from '../components/WishlistButton';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import type { WishlistItem } from '../types/wishlist';

export function WishlistPage() {
  const { 
    items, 
    isLoading, 
    error, 
    removeFromWishlist, 
    refreshWishlist,
    clearError,
    pagination,
    loadPage,
    loadNextPage,
    loadPreviousPage
  } = useWishlist();
  const { addToCart } = useCart();
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null);

  // Filter and sort items
  const availableItems = useMemo(() => 
    items.filter(item => item.isAvailable), 
    [items]
  );
  
  const unavailableItems = useMemo(() => 
    items.filter(item => !item.isAvailable), 
    [items]
  );

  // Handle individual item selection
  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedItems.size === availableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableItems.map(item => item.id)));
    }
  };

  // Handle bulk move to cart
  const handleBulkMoveToCart = async () => {
    if (selectedItems.size === 0) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const selectedItemsArray = items.filter(item => selectedItems.has(item.id));
      
      for (const item of selectedItemsArray) {
        try {
          await addToCart(item.artworkId);
          await removeFromWishlist(item.artworkId);
          successCount++;
        } catch (error) {
          console.error(`Failed to move ${item.artwork.title} to cart:`, error);
          errorCount++;
        }
      }

      // Clear selection
      setSelectedItems(new Set());

      // Show result toast
      if (successCount > 0 && errorCount === 0) {
        setToast({
          message: `${successCount} item${successCount > 1 ? 's' : ''} moved to cart`,
          variant: 'success'
        });
      } else if (successCount > 0 && errorCount > 0) {
        setToast({
          message: `${successCount} moved, ${errorCount} failed`,
          variant: 'info'
        });
      } else {
        setToast({
          message: 'Failed to move items to cart',
          variant: 'error'
        });
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk remove
  const handleBulkRemove = async () => {
    if (selectedItems.size === 0) return;

    setBulkActionLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const selectedItemsArray = items.filter(item => selectedItems.has(item.id));
      
      for (const item of selectedItemsArray) {
        try {
          await removeFromWishlist(item.artworkId);
          successCount++;
        } catch (error) {
          console.error(`Failed to remove ${item.artwork.title} from wishlist:`, error);
          errorCount++;
        }
      }

      // Clear selection
      setSelectedItems(new Set());

      // Show result toast
      if (successCount > 0 && errorCount === 0) {
        setToast({
          message: `${successCount} item${successCount > 1 ? 's' : ''} removed from wishlist`,
          variant: 'success'
        });
      } else if (successCount > 0 && errorCount > 0) {
        setToast({
          message: `${successCount} removed, ${errorCount} failed`,
          variant: 'info'
        });
      } else {
        setToast({
          message: 'Failed to remove items from wishlist',
          variant: 'error'
        });
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Format price helper
  const formatPrice = (priceCents: number, currency: string) => {
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
  };

  // Render wishlist item
  const renderWishlistItem = (item: WishlistItem) => {
    const isSelected = selectedItems.has(item.id);
    const artwork = item.artwork;
    
    return (
      <div key={item.id} className="group relative">
        {/* Selection checkbox for available items */}
        {item.isAvailable && (
          <div className="absolute top-2 left-2 z-10">
            <label className="block touch-manipulation">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 touch-manipulation"
                aria-label={`Select ${artwork.title}`}
              />
              <span className="sr-only">Select {artwork.title}</span>
            </label>
          </div>
        )}

        {/* Availability status badge */}
        <div className="absolute top-2 right-2 z-10">
          {!item.isAvailable && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
              Unavailable
            </span>
          )}
          {item.availabilityChanged && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Status Changed
            </span>
          )}
        </div>

        {/* Artwork card */}
        <Link to={`/artworks/${artwork.id}`} className="block">
          <ArtworkCard
            title={artwork.title}
            artist={artwork.artistName || artwork.artist?.name || 'Unknown artist'}
            price={formatPrice(artwork.priceCents, artwork.currency)}
            imageUrl={artwork.mediaUrl}
          />
        </Link>

        {/* Action buttons */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
          <WishlistButton
            artwork={artwork}
            variant="ghost"
            size="sm"
            showLabel={true}
            className="touch-manipulation min-h-[44px]"
          />
          
          {item.isAvailable && (
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                try {
                  await addToCart(artwork.id);
                  await removeFromWishlist(artwork.id);
                  setToast({
                    message: 'Moved to cart',
                    variant: 'success'
                  });
                } catch (error) {
                  setToast({
                    message: 'Failed to move to cart',
                    variant: 'error'
                  });
                }
              }}
              className="touch-manipulation min-h-[44px] flex-1 sm:flex-none"
            >
              <span className="sm:hidden">Add to Cart</span>
              <span className="hidden sm:inline">Move to Cart</span>
            </Button>
          )}
        </div>

        {/* Added date */}
        <div className="mt-2 text-xs text-gray-500">
          Added {new Date(item.addedAt).toLocaleDateString()}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 px-4 py-8 sm:py-16 sm:px-0 lg:px-0">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshWishlist}
            disabled={isLoading}
            className="touch-manipulation min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="sm:mr-2">
              <path d="M13.65 2.35C12.2 0.9 10.2 0 8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L10 6H16V0L13.65 2.35Z" fill="currentColor"/>
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-600 overflow-x-auto">
          <span className="whitespace-nowrap">{pagination.totalItems} total items</span>
          <span className="whitespace-nowrap">{availableItems.length} available on page</span>
          {unavailableItems.length > 0 && (
            <span className="whitespace-nowrap">{unavailableItems.length} unavailable on page</span>
          )}
          {pagination.totalPages > 1 && (
            <span className="whitespace-nowrap">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          <p className="uppercase tracking-[0.35em]">Unable to load wishlist</p>
          <p className="mt-2 text-rose-600/80">{error.message}</p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshWishlist()}
            >
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && items.length === 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <WishlistItemSkeleton key={`wishlist-skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className="mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6 max-w-md text-sm sm:text-base">
            Start exploring our gallery and save artworks you love for later consideration.
          </p>
          <Link to="/gallery">
            <Button variant="primary" className="touch-manipulation min-h-[48px] px-6">
              Browse Gallery
            </Button>
          </Link>
          
          {/* Mobile-specific empty state tips */}
          <div className="mt-8 sm:hidden">
            <p className="text-xs text-gray-500 mb-3">💡 Quick tips:</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span>❤️</span>
                  <span>Tap the heart icon on any artwork to add it to your wishlist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🛒</span>
                  <span>Use "Move to Cart" to quickly add wishlisted items to your cart</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📱</span>
                  <span>Your wishlist syncs across all your devices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {availableItems.length > 0 && (
        <div className="border-b border-gray-200 pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-sm touch-manipulation">
                <input
                  type="checkbox"
                  checked={selectedItems.size === availableItems.length && availableItems.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 touch-manipulation"
                />
                <span className="select-none">
                  Select all available ({availableItems.length})
                </span>
              </label>
              {selectedItems.size > 0 && (
                <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded-full">
                  {selectedItems.size} selected
                </span>
              )}
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBulkMoveToCart}
                  disabled={bulkActionLoading}
                  loading={bulkActionLoading}
                  className="flex-1 sm:flex-none touch-manipulation min-h-[44px]"
                >
                  <span className="sm:hidden">Move to Cart</span>
                  <span className="hidden sm:inline">Move to Cart ({selectedItems.size})</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkRemove}
                  disabled={bulkActionLoading}
                  className="flex-1 sm:flex-none touch-manipulation min-h-[44px]"
                >
                  <span className="sm:hidden">Remove</span>
                  <span className="hidden sm:inline">Remove ({selectedItems.size})</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist items */}
      {items.length > 0 && (
        <div className="space-y-8">
          {/* Available items */}
          {availableItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available ({availableItems.length})
              </h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {availableItems.map(renderWishlistItem)}
              </div>
            </div>
          )}

          {/* Unavailable items */}
          {unavailableItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Unavailable ({unavailableItems.length})
              </h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                {unavailableItems.map(renderWishlistItem)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPreviousPage}
              disabled={!pagination.hasPreviousPage || isLoading}
              className="touch-manipulation min-h-[44px]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadNextPage}
              disabled={!pagination.hasNextPage || isLoading}
              className="touch-manipulation min-h-[44px]"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          {/* Page numbers for desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => loadPage(pageNum)}
                  disabled={isLoading}
                  className="min-w-[40px] h-[40px]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {/* Mobile page indicator */}
          <div className="sm:hidden text-sm text-gray-600">
            {pagination.page} / {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function WishlistItemSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="aspect-3/4 w-full rounded-2xl bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
      </div>
      <div className="flex justify-between">
        <div className="h-8 w-20 rounded bg-gray-200" />
        <div className="h-8 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}
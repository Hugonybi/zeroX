import { useState } from 'react';
import { ArtworkImage } from '../../../components/ArtworkImage';
import { QuantitySelector } from '../../artwork/components/QuantitySelector';
import type { Artwork } from '../../../types/artwork';
import type { ShippingAddress } from '../../../types/order';

interface OrderSummaryProps {
  artwork: Artwork;
  quantity: number;
  shippingMethod?: string;
  shippingAddress?: ShippingAddress;
  onQuantityChange?: (quantity: number) => void;
}

export function OrderSummary({ artwork, quantity, shippingMethod, onQuantityChange }: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const unitPrice = artwork.priceCents / 100;
  const subtotal = unitPrice * quantity;
  
  // Calculate shipping
  let shippingCost = 0;
  if (artwork.type === 'physical' && shippingMethod) {
    switch (shippingMethod) {
      case 'standard':
        shippingCost = 10;
        break;
      case 'express':
        shippingCost = 25;
        break;
      case 'international':
        shippingCost = 50;
        break;
    }
  }
  
  const tax = 0; // Placeholder
  const total = subtotal + shippingCost + tax;

  return (
    <div className="px-6 w-sm space-y-4">
      {/* Mobile: Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full flex items-center justify-between py-3 border-b border-neutral-200"
      >
        <h3 className="text-lg font-semibold text-neutral-900">Order Summary</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-900">${total.toFixed(2)}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Desktop: Static header */}
      <h3 className="hidden lg:block text-lg font-semibold text-neutral-900">Order Summary</h3>
      
      <div className={`flex flex-col space-y-4 ${isExpanded ? 'block' : 'hidden lg:flex'}`}>
      {/* Artwork Details */}
      <div className="flex  flex-col gap-4 pb-4 border-b">
        <div className="w-fullllu  ">
          <ArtworkImage
            src={artwork.mediaUrl}
            alt={artwork.title}
            aspectRatio="1/1"
            
            maxHeight={200}
            wrapperClassName="rounded-md"
            showPlaceholder={true}
          />
        </div>
        <div className="flex-1 ">
          <h4 className="font-medium text-sm text-gray-900">{artwork.title}</h4>
          <p className="text-xs text-gray-600">by {artwork.artistName || artwork.artist?.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {artwork.type === 'physical' ? 'Physical Artwork' : 'Digital Artwork'}
          </p>
        </div>
      </div>

      {/* Quantity Selector */}
      {onQuantityChange && (
        <div className="pb-4 border-b">
          <QuantitySelector 
            artwork={artwork} 
            quantity={quantity} 
            onQuantityChange={onQuantityChange} 
          />
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Unit Price × {quantity}
          </span>
          <span className="text-gray-900 font-medium">
            ${unitPrice.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {shippingCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Shipping ({shippingMethod})
            </span>
            <span className="text-gray-900 font-medium">
              ${shippingCost.toFixed(2)}
            </span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900 font-medium">
              ${tax.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between pt-4 border-t">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">
          ${total.toFixed(2)} {artwork.currency}
        </span>
      </div>
      </div>
    </div>
  );
}

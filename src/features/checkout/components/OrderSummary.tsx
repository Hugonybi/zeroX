import type { Artwork } from '../../../types/artwork';
import type { ShippingAddress } from '../../../types/order';

interface OrderSummaryProps {
  artwork: Artwork;
  quantity: number;
  shippingMethod?: string;
  shippingAddress?: ShippingAddress;
}

export function OrderSummary({ artwork, quantity, shippingMethod }: OrderSummaryProps) {
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
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
      
      {/* Artwork Details */}
      <div className="flex gap-4 pb-4 border-b">
        <img
          src={artwork.mediaUrl}
          alt={artwork.title}
          className="w-20 h-20 object-cover rounded-md"
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{artwork.title}</h4>
          <p className="text-sm text-gray-600">by {artwork.artistName || artwork.artist?.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {artwork.type === 'physical' ? 'Physical Artwork' : 'Digital Artwork'}
          </p>
        </div>
      </div>

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
  );
}

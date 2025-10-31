import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../features/cart/CartContext";
import { useCartCheckout } from "../hooks/useCartCheckout";
import type { ShippingAddress, CartCheckoutRequest } from "../types/order";
import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { ArtworkImage } from "../components/ArtworkImage";

export function CartCheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, isLoading: cartLoading } = useCart();
  const { checkoutCart, isLoading, error } = useCartCheckout();
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  // Check if cart has items
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate('/gallery');
    }
  }, [items.length, cartLoading, navigate]);

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="animate-pulse">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  // Check if any items require physical shipping
  const hasPhysicalItems = items.some(item => 
    item.purchaseOption === 'physical' || 
    (item.artwork.type === 'physical' && !item.purchaseOption)
  );

  const shippingCost = hasPhysicalItems ? 10 : 0; // Simple flat rate
  const total = totalPrice + (shippingCost * 100); // Convert to cents

  const handleShippingChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    setLocalError(null);

    // Validate shipping information for physical items
    if (hasPhysicalItems) {
      if (!shippingAddress.fullName || !shippingAddress.addressLine1 || 
          !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
        setLocalError('Please complete shipping information for physical artworks');
        return;
      }
    }

    try {
      const request: CartCheckoutRequest = {
        paymentProvider: 'test', // Use test for now
        shippingAddress: hasPhysicalItems ? (shippingAddress as ShippingAddress) : undefined,
        shippingMethod: hasPhysicalItems ? 'standard' : undefined,
      };

      const result = await checkoutCart(request);

      if (result && result.sessionId) {
        // Navigate to consolidated order status page
        navigate(`/cart-orders/${result.sessionId}`);
      }
    } catch (err) {
      console.error('Cart checkout failed', err);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="order-2 lg:order-1">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-20 h-20 flex-shrink-0">
                  <ArtworkImage
                    src={item.artwork.mediaUrl}
                    alt={item.artwork.title}
                    aspectRatio="1/1"
                    wrapperClassName="rounded-md"
                    showPlaceholder={true}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.artwork.title}</h3>
                  <p className="text-sm text-gray-600">by {item.artwork.artistName}</p>
                  <p className="text-sm text-gray-500">
                    {item.purchaseOption || item.artwork.type} artwork
                  </p>
                  <p className="font-medium mt-1">
                    {formatPrice(item.artwork.priceCents, item.artwork.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} items)</span>
              <span>{formatPrice(totalPrice, items[0]?.artwork.currency || 'USD')}</span>
            </div>
            {hasPhysicalItems && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(shippingCost * 100, items[0]?.artwork.currency || 'USD')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(total, items[0]?.artwork.currency || 'USD')}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="order-1 lg:order-2">
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>

          {hasPhysicalItems && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="grid gap-4">
                <TextField 
                  value={shippingAddress.fullName} 
                  onChange={(e) => handleShippingChange('fullName', e.target.value)} 
                  placeholder="Full name" 
                />
                <TextField 
                  value={shippingAddress.addressLine1} 
                  onChange={(e) => handleShippingChange('addressLine1', e.target.value)} 
                  placeholder="Address line 1" 
                />
                <TextField 
                  value={shippingAddress.addressLine2} 
                  onChange={(e) => handleShippingChange('addressLine2', e.target.value)} 
                  placeholder="Address line 2 (optional)" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField 
                    value={shippingAddress.city} 
                    onChange={(e) => handleShippingChange('city', e.target.value)} 
                    placeholder="City" 
                  />
                  <TextField 
                    value={shippingAddress.state} 
                    onChange={(e) => handleShippingChange('state', e.target.value)} 
                    placeholder="State" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TextField 
                    value={shippingAddress.postalCode} 
                    onChange={(e) => handleShippingChange('postalCode', e.target.value)} 
                    placeholder="Postal code" 
                    inputMode="numeric" 
                  />
                  <TextField 
                    value={shippingAddress.country} 
                    onChange={(e) => handleShippingChange('country', e.target.value)} 
                    placeholder="Country" 
                  />
                </div>
                <TextField 
                  value={shippingAddress.phone} 
                  onChange={(e) => handleShippingChange('phone', e.target.value)} 
                  placeholder="Phone (optional)" 
                  inputMode="tel" 
                />
              </div>
            </div>
          )}

          {localError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 mb-4">
              {localError}
            </div>
          )}
          
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCheckout} 
              loading={isLoading}
              className="flex-1"
            >
              Complete Purchase - {formatPrice(total, items[0]?.artwork.currency || 'USD')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatPrice(priceCents: number, currency: string) {
  try {
    const formatter = new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 0 
    });
    return formatter.format((priceCents || 0) / 100);
  } catch (err) {
    return `${currency} ${(priceCents || 0) / 100}`;
  }
}
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createHttpClient } from "../lib/http";
import { API_BASE_URL, USE_MOCK_ARTWORKS } from "../config/api";
import type { Artwork } from "../types/artwork";
import { ArtworkSpecifications } from "../features/artwork/components/ArtworkSpecifications";
import type { ShippingAddress } from "../types/order";
import { QuantitySelector } from "../features/artwork/components/QuantitySelector";
import { useCheckout } from "../hooks/useCheckout";
import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { mockArtworks } from "../data/mockArtworks";

const httpClient = createHttpClient(API_BASE_URL);

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkout, isLoading, error } = useCheckout();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [quantity, setQuantity] = useState<number>(Number(searchParams.get("quantity") || "1"));
  const [purchaseOption] = useState<string>(searchParams.get("purchaseOption") || "both");
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

  const artworkId = searchParams.get("artworkId") || undefined;

  useEffect(() => {
    if (!artworkId) return;

    const fetchArtwork = async () => {
      try {
        if (USE_MOCK_ARTWORKS) {
          const mock = mockArtworks.find((m) => m.id === artworkId);
          if (mock) {
            const now = new Date().toISOString();
            setArtwork({
              id: mock.id,
              artistId: "mock-artist",
              artistName: mock.artist,
              title: mock.title,
              description: "",
              type: "digital",
              mediaUrl: mock.imageUrl ?? "",
              metadataUrl: null,
              serialNumber: null,
              edition: null,
              priceCents: 0,
              currency: "NGN",
              status: "published",
              createdAt: now,
              updatedAt: now,
            });
          }
        } else {
          const data = await httpClient.get<Artwork>(`/artworks/${artworkId}`);
          setArtwork(data);
        }
      } catch (err) {
        console.error("Failed to load artwork for checkout", err);
        setLocalError("Unable to load artwork for checkout");
      }
    };

    fetchArtwork();
  }, [artworkId]);

  if (!artworkId) {
    return <NavigateToHome />;
  }

  if (!artwork) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="animate-pulse">Loading checkout...</div>
      </div>
    );
  }

  const unitPrice = artwork.priceCents || 0;
  const subtotal = unitPrice * quantity;
  const shippingCents = purchaseOption === 'digital' ? 0 : 1000; // simple flat rate
  const total = subtotal + shippingCents;

  const handleShippingChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePay = async () => {
    setLocalError(null);

    // Basic validation for physical purchases
    if (purchaseOption !== 'digital') {
      if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
        setLocalError('Please complete shipping information');
        return;
      }
    }

    try {
      const result = await checkout({
        artworkId: artwork.id,
        paymentProvider: 'test',
        quantity,
        shippingAddress: (purchaseOption === 'digital') ? undefined : (shippingAddress as unknown as ShippingAddress),
        shippingMethod: purchaseOption === 'digital' ? 'digital' : 'standard',
      });

      if (result && result.order) {
        // Navigate to order status
        navigate(`/orders/${result.order.id}`);
      }
    } catch (err) {
      console.error('Checkout failed', err);
    }
  };

  return (
    <section className="space-y-8">
      <Link to="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">← Back to gallery</Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="aspect-4/5 w-full rounded-3xl overflow-hidden bg-stone/40">
            {artwork.mediaUrl && <img src={artwork.mediaUrl} alt={artwork.title} className="w-full h-full object-cover" />}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <ArtworkSpecifications artwork={artwork} showFullDetails />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Order summary</h3>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">{artwork.title}</div>
              <div className="font-semibold">{formatPrice(unitPrice, artwork.currency)}</div>
            </div>

            <div className="mt-4">
              <QuantitySelector artwork={artwork} quantity={quantity} onQuantityChange={setQuantity} />
            </div>

            <div className="mt-4 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal, artwork.currency)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shippingCents, artwork.currency)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(total, artwork.currency)}</span></div>
            </div>
          </div>

          {purchaseOption !== 'digital' && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Shipping information</h3>
              <div className="grid gap-3">
                <TextField value={shippingAddress.fullName} onChange={(e) => handleShippingChange('fullName', e.target.value)} placeholder="Full name" />
                <TextField value={shippingAddress.addressLine1} onChange={(e) => handleShippingChange('addressLine1', e.target.value)} placeholder="Address line 1" />
                <TextField value={shippingAddress.addressLine2} onChange={(e) => handleShippingChange('addressLine2', e.target.value)} placeholder="Address line 2 (optional)" />
                <div className="grid grid-cols-2 gap-3">
                  <TextField value={shippingAddress.city} onChange={(e) => handleShippingChange('city', e.target.value)} placeholder="City" />
                  <TextField value={shippingAddress.state} onChange={(e) => handleShippingChange('state', e.target.value)} placeholder="State" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField value={shippingAddress.postalCode} onChange={(e) => handleShippingChange('postalCode', e.target.value)} placeholder="Postal code" inputMode="numeric" />
                  <TextField value={shippingAddress.country} onChange={(e) => handleShippingChange('country', e.target.value)} placeholder="Country" />
                </div>
                <TextField value={shippingAddress.phone} onChange={(e) => handleShippingChange('phone', e.target.value)} placeholder="Phone (optional)" inputMode="tel" />
              </div>
            </div>
          )}

          {localError && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{localError}</div>}
          {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
            <Button variant="primary" onClick={handlePay} loading={isLoading}>
              Pay {formatPrice(total, artwork.currency)}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavigateToHome() {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-gray-600">No artwork selected for checkout.</p>
      <Link to="/" className="mt-4 inline-block text-blue-600 underline">Back to gallery</Link>
    </div>
  );
}

function formatPrice(priceCents: number, currency: string) {
  try {
    const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 });
    return formatter.format((priceCents || 0) / 100);
  } catch (err) {
    return `${currency} ${(priceCents || 0) / 100}`;
  }
}

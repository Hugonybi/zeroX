import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { PurchaseOptionCard } from "./ui/PurchaseOptionCard";
import { useAuth } from "../features/auth/hooks";
import { useCheckout } from "../hooks/useCheckout";

interface ArtworkDetailsProps {
  artworkId: string;
  editionLabel: string;
  title: string;
  artist: string;
  price: string;
  tokenId: string;
  status: string;
}

export function ArtworkDetails({ artworkId, editionLabel, title, artist, price, tokenId, status }: ArtworkDetailsProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { checkout, isLoading, error } = useCheckout();
  const [purchaseOption, setPurchaseOption] = useState<'both' | 'digital'>('both');

  const handleBuyNow = async () => {
    // Check authentication
    if (!isAuthenticated) {
      // Store intended artwork for post-login redirect
      sessionStorage.setItem('intendedPurchase', JSON.stringify({ artworkId, purchaseOption }));
      navigate('/login');
      return;
    }

    // Verify user is a buyer
    if (user?.role !== 'buyer') {
      alert('Only buyers can purchase artworks. Please register as a buyer.');
      return;
    }

    // Create checkout session with test provider (demo mode)
    const result = await checkout({
      artworkId,
      paymentProvider: 'test', // Using test provider for demo
    });

    if (result) {
      // Store order ID
      sessionStorage.setItem('currentOrderId', result.order.id);
      
      // For test provider, directly complete the order
      console.log('✅ Checkout created with test provider:', result.order.id);
      
      // Navigate to order status page
      navigate(`/orders/${result.order.id}`);
    }
  };

  return (
    <section className="flex w-full max-w-md flex-col gap-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">{editionLabel}</p>
        <h1 className="font-brand text-3xl text-ink">{title}</h1>
        <a className="text-sm text-ink" href="#artist">
          by <span className="underline">{artist}</span>
        </a>
        <p className="text-xl font-semibold text-ink">{price}</p>
      </div>

      <Badge tone="info" className="items-baseline gap-1">
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Authenticated on Hedera</span>
        <span className="text-xs font-semibold">Token ID {tokenId}</span>
      </Badge>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ink-muted">Purchase Option</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <PurchaseOptionCard
            title="Physical Art and Digital NFT"
            description={"Receive the original painting and digital twin"}
            selected={purchaseOption === 'both'}
            onClick={() => setPurchaseOption('both')}
          />
          <PurchaseOptionCard
            title="Digital NFT Only"
            description={"Own the unique digital certificate of authenticity"}
            selected={purchaseOption === 'digital'}
            onClick={() => setPurchaseOption('digital')}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button 
        variant="primary" 
        onClick={handleBuyNow}
        loading={isLoading}
        disabled={status === 'sold' || isLoading}
      >
        {status === 'sold' ? 'Sold Out' : 'Buy Now'}
      </Button>
    </section>
  );
}

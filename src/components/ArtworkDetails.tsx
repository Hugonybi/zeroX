import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { PurchaseOptionCard } from "./ui/PurchaseOptionCard";
import { QuantitySelector } from "../features/artwork/components/QuantitySelector";
import { useAuth } from "../features/auth/hooks";
import type { Artwork } from "../types/artwork";

interface ArtworkDetailsProps {
  artworkId: string;
  editionLabel: string;
  title: string;
  artist: string;
  price: string;
  tokenId: string;
  status: string;
  artwork?: Artwork;
}

export function ArtworkDetails({ artworkId, editionLabel, title, artist, price, tokenId, status, artwork }: ArtworkDetailsProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [purchaseOption, setPurchaseOption] = useState<'both' | 'digital'>('both');
  const [quantity, setQuantity] = useState(1);
  
  const isSoldOut = status === 'sold' || (artwork && artwork.availableQuantity !== undefined && artwork.availableQuantity <= 0);
  
  // Determine if quantity selector should be shown
  const showQuantitySelector = artwork && 
    !artwork.isUnique && 
    artwork.availableQuantity !== undefined && 
    artwork.availableQuantity > 1;

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
    // Navigate to checkout page where user can confirm shipping, quantity and pay
    const params = new URLSearchParams();
    params.set('artworkId', artworkId);
    params.set('quantity', String(quantity));
    params.set('purchaseOption', purchaseOption);
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <section className="flex w-full max-w-md flex-col gap-6">
      <div className="space-y-1">
        <p className="text-xs uppercase  text-ink-muted">{editionLabel}</p>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {artwork?.artistId ? (
          <Link to={`/artists/${artwork.artistId}`} className="text-sm text-ink hover:underline">
            by <span className="text-sm">{artist}</span>
          </Link>
        ) : (
          <p className="text-sm text-ink">
            by <span>{artist}</span>
          </p>
        )}
        <p className="text-xl font-semibold text-ink">{price}</p>
      </div>

      <Badge tone="info" className="items-start flex flex-col bg-teal-50 py-2 gap-1">
        <span className="text-[0.65rem] uppercase ">Authenticated on Hedera</span>
        <span className="text-sm font-semibold">Token ID {tokenId}</span>
      </Badge>

      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div>
          <QuantitySelector
            artwork={artwork!}
            quantity={quantity}
            onQuantityChange={setQuantity}
            disabled={isSoldOut}
          />
        </div>
      )}

      {/* <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-ink-muted">Purchase Option</p>
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
      </div> */}
      <div>
        <Button 
          variant="primary" 
          onClick={handleBuyNow}
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Sold Out' : 'Buy Now'}
        </Button>
      </div>
    </section>
  );
}

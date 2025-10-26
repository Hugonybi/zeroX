import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { PurchaseOptionCard } from "./ui/PurchaseOptionCard";

interface ArtworkDetailsProps {
  editionLabel: string;
  title: string;
  artist: string;
  price: string;
  tokenId: string;
}

export function ArtworkDetails({ editionLabel, title, artist, price, tokenId }: ArtworkDetailsProps) {
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
            selected
          />
          <PurchaseOptionCard
            title="Digital NFT Only"
            description={"Own the unique digital certificate of authenticity"}
          />
        </div>
      </div>

      <Button variant="primary">Buy Now</Button>
    </section>
  );
}

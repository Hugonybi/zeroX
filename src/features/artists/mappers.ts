import type { ArtworkType } from "../../types/artwork";

export type ArtworkFormState = {
  title: string;
  tagline: string;
  description: string;
  type: "digital" | "physical";
  category: string;
  dimensions: string;
  medium: string;
  editionSize: string;
  serialPrefix: string;
  fulfillment: string;
  shippingNotes: string;
  fileName: string;
  price: string;
  currency: string;
  inventory: string;
};

export type CreateArtworkPayload = {
  title: string;
  description: string;
  type: ArtworkType;
  mediaUrl: string;
  metadataUrl?: string;
  serialNumber?: string;
  edition?: number;
  priceCents: number;
  currency: string;
  status?: "draft" | "published";
};

export function mapFormToCreatePayload(
  form: ArtworkFormState,
  mediaUrl: string
): CreateArtworkPayload {
  const priceCents = Math.round(parseFloat(form.price || "0") * 100);
  const edition = parseInt(form.editionSize, 10);

  return {
    title: form.title,
    description: form.description,
    type: form.type as ArtworkType,
    mediaUrl,
    metadataUrl: undefined,
    serialNumber: form.serialPrefix || undefined,
    edition: Number.isFinite(edition) && edition > 0 ? edition : undefined,
    priceCents,
    currency: form.currency,
    status: "published",
  };
}

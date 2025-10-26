export type ArtworkStatus = "draft" | "published" | "sold" | "removed";
export type ArtworkType = "physical" | "digital";

export type Artwork = {
  id: string;
  artistId: string;
  artistName?: string;
  title: string;
  description: string;
  type: ArtworkType;
  mediaUrl: string;
  metadataUrl: string | null;
  serialNumber: string | null;
  edition: number | null;
  priceCents: number;
  currency: string;
  status: ArtworkStatus;
  createdAt: string;
  updatedAt: string;
};

export type ArtworkFilters = {
  type?: ArtworkType;
  artist?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ArtworksResponse = Artwork[];

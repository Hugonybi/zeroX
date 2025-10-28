export interface OwnershipToken {
  id: string;
  hederaTokenId: string;
  hederaTxHash: string;
  metadataIpfs: string;
  transferable: boolean;
  fractions: number;
  createdAt: string;
  hashscanUrl: string;
}

export interface AuthenticityToken {
  id: string;
  hederaTokenId: string;
  hederaTxHash: string;
  metadataIpfs: string;
  hashscanUrl: string;
}

export interface CertificateArtwork {
  id: string;
  title: string;
  description: string;
  type: string;
  mediaUrl: string;
  serialNumber?: string;
}

export interface CertificateOrder {
  id: string;
  reference: string;
  amountCents: number;
  currency: string;
  createdAt: string;
}

export interface CertificateOwner {
  name: string;
  email: string;
}

export interface Certificate {
  ownershipToken: OwnershipToken;
  authenticityToken: AuthenticityToken;
  artwork: CertificateArtwork;
  order: CertificateOrder;
  owner: CertificateOwner;
}

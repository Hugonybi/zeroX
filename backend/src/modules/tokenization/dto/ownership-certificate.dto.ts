export interface OwnershipCertificateDto {
  ownershipToken: {
    id: string;
    hederaTokenId: string;
    hederaTxHash: string;
    metadataIpfs: string;
    transferable: boolean;
    fractions: number;
    createdAt: Date;
    hashscanUrl: string;
  };
  authenticityToken: {
    id: string;
    hederaTokenId: string;
    hederaTxHash: string;
    metadataIpfs: string;
    hashscanUrl: string;
  };
  artwork: {
    id: string;
    title: string;
    description: string;
    type: string;
    mediaUrl: string;
    serialNumber?: string;
  };
  order: {
    id: string;
    reference: string;
    amountCents: number;
    currency: string;
    createdAt: Date;
  };
  owner: {
    name: string;
    email: string;
  };
}

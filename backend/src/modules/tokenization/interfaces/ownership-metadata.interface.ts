export interface OwnershipMetadata {
  name: string;
  description: string;
  image: string;
  type: string;
  properties: {
    asset_type: 'physical_artwork' | 'digital_artwork';
    authenticity_token: {
      token_id: string;
      serial: string;
      ipfs: string;
    };
    ownership: {
      transferable: boolean;
      fractions: number;
      legal_doc_hash?: string;
    };
    provenance: Array<{
      event: string;
      owner: string;
      tx?: string;
      date: string;
    }>;
  };
  platform: string;
}

export interface MintOwnershipResult {
  hederaTokenId: string;
  hederaTxHash: string;
  metadataIpfs: string;
  serialNumber: number;
}

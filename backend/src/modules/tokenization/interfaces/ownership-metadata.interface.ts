export interface OwnershipMetadata {
  name: string;
  description: string;
  image: string;
  type: string;
  properties: {
    asset_type: 'physical_artwork' | 'digital_artwork';
    // Linked authenticity certificate (with Hedera NFT serial)
    authenticity_token: {
      token_id: string;
      serial: string;  // Hedera NFT serial (auto-assigned)
      ipfs: string;
    };
    ownership: {
      transferable: boolean;
      fractions: number;
      legal_doc_hash?: string;
    };
    // Artist-defined artwork identification
    artwork_details: {
      serial_number?: string;  // Artist's catalog number (e.g., "ART-2024-001")
      edition?: number;        // Edition number if series (e.g., 5)
      is_unique: boolean;      // Whether this is a one-of-a-kind piece
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

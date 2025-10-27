import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HederaService } from '../hedera/hedera.service';
import { PinataService } from '../pinata/pinata.service';
import { PrismaService } from '../prisma/prisma.service';
import { OwnershipMetadata, MintOwnershipResult } from './interfaces/ownership-metadata.interface';

@Injectable()
export class TokenizationService {
  private readonly logger = new Logger(TokenizationService.name);

  constructor(
    private readonly hederaService: HederaService,
    private readonly pinataService: PinataService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Mint an ownership token that represents transferable rights to the artwork
   */
  async mintOwnershipToken(
    orderId: string,
    artworkId: string,
    authenticityTokenId: string
  ): Promise<MintOwnershipResult> {
    this.logger.log(`Minting ownership token for order ${orderId}`);

    try {
      // Fetch order, artwork, and authenticity token details
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          artwork: {
            include: {
              artist: true
            }
          },
          buyer: true,
          authToken: true
        }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (!order.authToken) {
        throw new Error(`Authenticity token not found for order ${orderId}`);
      }

      // Create ownership metadata
      const metadata = this.createOwnershipMetadata(order, order.authToken);

      // Pin metadata to IPFS
      const metadataIpfs = await this.pinataService.uploadJSON(metadata as unknown as Record<string, unknown>);
      this.logger.log(`Ownership metadata pinned to IPFS: ${metadataIpfs}`);

      // Create metadata buffer following HIP-412 standard
      const nftMetadata = JSON.stringify({
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        type: metadata.type,
        external_url: metadataIpfs,
        properties: metadata.properties
      });

      // Get ownership token ID from config
      const ownershipTokenId = this.configService.get<string>('hedera.ownershipTokenId');
      if (!ownershipTokenId) {
        throw new Error('Ownership token ID not configured');
      }

      // Mint the ownership NFT (will be frozen by default)
      const mintResult = await this.hederaService.mintUniqueToken(
        ownershipTokenId,
        Buffer.from(nftMetadata, 'utf8')
      );

      const serialNumber = mintResult.serialNumbers[0];
      const fullTokenId = `${ownershipTokenId}/${serialNumber}`;

      this.logger.log(
        `Successfully minted ownership token ${fullTokenId} for order ${orderId}`
      );

      return {
        hederaTokenId: fullTokenId,
        hederaTxHash: mintResult.transactionId,
        metadataIpfs,
        serialNumber
      };
    } catch (error) {
      this.logger.error(`Failed to mint ownership token for order ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Create structured ownership metadata following HIP-412 and RWA best practices
   */
  createOwnershipMetadata(order: any, authToken: any): OwnershipMetadata {
    const artwork = order.artwork;
    const artist = artwork.artist;
    const buyer = order.buyer;

    // Extract serial number from auth token ID (format: 0.0.xxxxx/serial)
    const authTokenSerial = authToken.hederaTokenId.split('/')[1] || '1';

    return {
      name: `${artwork.title} - Ownership Certificate`,
      description: `Transferable ownership rights for ${artwork.type} artwork by ${artist.name}. This token represents legal ownership of the physical/digital asset and can be transferred to other Hedera accounts.`,
      image: artwork.mediaUrl,
      type: artwork.mediaUrl.includes('.mp4') ? 'video/mp4' : 'image/jpeg',
      properties: {
        asset_type: artwork.type === 'physical' ? 'physical_artwork' : 'digital_artwork',
        authenticity_token: {
          token_id: authToken.hederaTokenId.split('/')[0],
          serial: authTokenSerial,
          ipfs: authToken.metadataIpfs
        },
        ownership: {
          transferable: true,
          fractions: 1,
          // Future: Add legal document hash here
          legal_doc_hash: undefined
        },
        provenance: [
          {
            event: 'created',
            owner: artist.name,
            date: artwork.createdAt.toISOString()
          },
          {
            event: 'minted',
            owner: artist.name,
            tx: authToken.hederaTxHash,
            date: authToken.mintedAt.toISOString()
          },
          {
            event: 'purchased',
            owner: buyer.name,
            tx: order.reference,
            date: order.updatedAt.toISOString()
          }
        ]
      },
      platform: 'Hedera Art Marketplace v1.0'
    };
  }

  /**
   * Link an ownership token to its authenticity token in the database
   */
  async linkToAuthenticityToken(
    orderId: string,
    artworkId: string,
    ownerId: string,
    authenticityTokenId: string,
    ownershipResult: MintOwnershipResult
  ): Promise<void> {
    try {
      await this.prisma.ownershipToken.create({
        data: {
          orderId,
          artworkId,
          ownerId,
          authenticityTokenId,
          hederaTokenId: ownershipResult.hederaTokenId,
          hederaTxHash: ownershipResult.hederaTxHash,
          metadataIpfs: ownershipResult.metadataIpfs,
          transferable: true,
          fractions: 1
        }
      });

      this.logger.log(`Linked ownership token to authenticity token ${authenticityTokenId}`);
    } catch (error) {
      this.logger.error(`Failed to link ownership token for order ${orderId}`, error);
      throw error;
    }
  }
}

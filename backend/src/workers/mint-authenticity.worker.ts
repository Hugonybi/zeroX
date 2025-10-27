import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HederaService } from '../modules/hedera/hedera.service';
import { PinataService } from '../modules/pinata/pinata.service';
import { TokenizationService } from '../modules/tokenization/tokenization.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface MintJobPayload {
  orderId: string;
  artworkId: string;
  metadata: Record<string, unknown>;
}

@Injectable()
@Processor('mint')
export class MintAuthenticityWorker {
  private readonly logger = new Logger(MintAuthenticityWorker.name);

  constructor(
    private readonly hederaService: HederaService,
    private readonly pinataService: PinataService,
    private readonly tokenizationService: TokenizationService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  @Process('mint')
  async process(job: Job<MintJobPayload>): Promise<void> {
    const { orderId, artworkId, metadata } = job.data;
    this.logger.log(`Processing mint job for order ${orderId}`);

    let authenticityTokenId: string | null = null;

    try {
      // Get the NFT token ID from config
      const tokenId = this.configService.get<string>('hedera.nftTokenId');
      if (!tokenId) {
        throw new Error('NFT token ID not configured');
      }

      // ========================================
      // STEP 1: Mint Authenticity Token
      // ========================================
      this.logger.log(`[1/3] Minting authenticity certificate for order ${orderId}`);

      // First, pin metadata to IPFS
      const ipfsResult = await this.pinataService.uploadJSON(metadata);
      const metadataUrl = ipfsResult;

      // Create the metadata buffer with IPFS CID (following HIP-412 standard)
      const nftMetadata = JSON.stringify({
        name: metadata.name || `Artwork Certificate ${orderId}`,
        description: metadata.description || 'Authenticity certificate for artwork',
        image: metadata.image || metadata.mediaUrl,
        external_url: metadataUrl,
        properties: metadata.properties || {}
      });

      // Mint the authenticity NFT on Hedera
      const mintResult = await this.hederaService.mintUniqueToken(
        tokenId, 
        Buffer.from(nftMetadata, 'utf8')
      );

      // Store the authenticity token record
      const authToken = await this.prisma.authToken.create({
        data: {
          orderId,
          artworkId,
          hederaTokenId: `${tokenId}/${mintResult.serialNumbers[0]}`,
          hederaTxHash: mintResult.transactionId,
          metadataIpfs: metadataUrl,
          mintedBy: 'system'
        }
      });

      authenticityTokenId = authToken.id;

      this.logger.log(
        `✓ Authenticity token minted: ${authToken.hederaTokenId} (tx: ${authToken.hederaTxHash})`
      );

      // ========================================
      // STEP 2: Mint Ownership Token (RWA)
      // ========================================
      this.logger.log(`[2/3] Minting ownership certificate for order ${orderId}`);

      const ownershipResult = await this.tokenizationService.mintOwnershipToken(
        orderId,
        artworkId,
        authenticityTokenId
      );

      this.logger.log(
        `✓ Ownership token minted: ${ownershipResult.hederaTokenId} (tx: ${ownershipResult.hederaTxHash})`
      );

      // ========================================
      // STEP 3: Link and Persist
      // ========================================
      this.logger.log(`[3/3] Linking tokens and updating order for ${orderId}`);

      // Get buyer ID from order
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { buyerId: true }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Link ownership token to authenticity token
      await this.tokenizationService.linkToAuthenticityToken(
        orderId,
        artworkId,
        order.buyerId,
        authenticityTokenId,
        ownershipResult
      );

      // Update order status to fulfilled
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'fulfilled'
        }
      });

      this.logger.log(
        `✅ Successfully completed dual minting for order ${orderId}\n` +
        `   Authenticity: ${authToken.hederaTokenId}\n` +
        `   Ownership: ${ownershipResult.hederaTokenId}`
      );

    } catch (error) {
      this.logger.error(`Failed to mint tokens for order ${orderId}`, error);
      
      // Update order status based on what failed
      const orderStatus = authenticityTokenId 
        ? 'ownership_mint_failed'  // Authenticity succeeded, ownership failed
        : 'mint_failed';            // Authenticity failed

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: orderStatus as any
        }
      });

      throw error;
    }
  }
}

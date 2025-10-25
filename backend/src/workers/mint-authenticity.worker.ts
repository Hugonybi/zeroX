import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HederaService } from '../modules/hedera/hedera.service';
import { PinataService } from '../modules/pinata/pinata.service';
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
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  @Process('mint')
  async process(job: Job<MintJobPayload>): Promise<void> {
    const { orderId, artworkId, metadata } = job.data;
    this.logger.log(`Processing mint job for order ${orderId}`);

    try {
      // Get the NFT token ID from config
      const tokenId = this.configService.get<string>('hedera.nftTokenId');
      if (!tokenId) {
        throw new Error('NFT token ID not configured');
      }

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

      // Mint the NFT on Hedera
      const mintResult = await this.hederaService.mintUniqueToken(
        tokenId, 
        Buffer.from(nftMetadata, 'utf8')
      );

      // Store the authenticity token record
      await this.prisma.authToken.create({
        data: {
          orderId,
          artworkId,
          hederaTokenId: `${tokenId}/${mintResult.serialNumbers[0]}`, // Include serial number
          hederaTxHash: mintResult.transactionId,
          metadataIpfs: metadataUrl,
          mintedBy: 'system'
        }
      });

      // Update order status to fulfilled
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'fulfilled'
        }
      });

      this.logger.log(`Successfully minted NFT for order ${orderId} with serial ${mintResult.serialNumbers[0]}`);
    } catch (error) {
      this.logger.error(`Failed to mint authenticity token for order ${orderId}`, error);
      
      // Update order status to mint_failed
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'mint_failed'
        }
      });

      throw error;
    }
  }
}

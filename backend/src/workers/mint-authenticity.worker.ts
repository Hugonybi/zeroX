import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HederaService } from '../modules/hedera/hedera.service';
import { PinataService } from '../modules/pinata/pinata.service';
import { TokenizationService } from '../modules/tokenization/tokenization.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MintQueueName } from '../queue/queue.constants';

interface MintJobPayload {
  orderId: string;
  artworkId: string;
  metadata: Record<string, unknown>;
}

@Injectable()
@Processor(MintQueueName)
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
    
    this.logger.log(`🔄 Starting mint job for order ${orderId}`);
    this.logger.log(`📦 Job data: orderId=${orderId}, artworkId=${artworkId}`);

    let authenticityTokenId: string | null = null;

    try {
      // ========================================
      // DIAGNOSTIC: Check Configuration
      // ========================================
      const tokenId = this.configService.get<string>('hedera.nftTokenId');
      const ownershipTokenId = this.configService.get<string>('hedera.ownershipTokenId');
      const operatorId = this.configService.get<string>('hedera.accountId');
      
      this.logger.log(`🎫 Authenticity Token ID: ${tokenId}`);
      this.logger.log(`🏠 Ownership Token ID: ${ownershipTokenId}`);
      this.logger.log(`🔑 Operator Account: ${operatorId}`);
      
      if (!tokenId) {
        throw new Error('NFT token ID not configured in HEDERA_NFT_TOKEN_ID');
      }
      if (!ownershipTokenId) {
        throw new Error('Ownership token ID not configured in HEDERA_OWNERSHIP_TOKEN_ID');
      }

      // ========================================
      // DIAGNOSTIC: Check Hedera Connection
      // ========================================
      this.logger.log(`🌐 Testing Hedera connection...`);
      const accountBalance = await this.hederaService.getAccountBalance();
      this.logger.log(`💰 Operator balance: ${accountBalance} HBAR`);
      
      if (parseFloat(accountBalance) < 1) {
        this.logger.warn(`⚠️ Low balance warning: ${accountBalance} HBAR (recommend 10+ for testing)`);
      }

      // ========================================
      // STEP 1: Mint Authenticity Token
      // ========================================
      this.logger.log(`[1/3] Minting authenticity certificate for order ${orderId}`);

      // First, pin metadata to IPFS
      this.logger.log(`📤 Uploading metadata to IPFS...`);
      // Pin authenticity certificate metadata to IPFS
      const metadataUrl = await this.pinataService.uploadJSON(metadata);
      this.logger.log(`📌 Metadata pinned to IPFS: ${metadataUrl}`);

      // Mint the authenticity NFT on Hedera
      // Note: Hedera will auto-assign a sequential serial number (1, 2, 3, etc.)
      // This is independent of the artwork's edition/serialNumber field
      // Store only IPFS CID in metadata (under 100 bytes limit)
      this.logger.log(`⛏️ Minting authenticity token on Hedera (token: ${tokenId})...`);
      const mintResult = await this.hederaService.mintUniqueToken(
        tokenId, 
        Buffer.from(metadataUrl, 'utf8')
      );
      const hederaNftSerial = mintResult.serialNumbers[0];
      this.logger.log(`✅ Authenticity mint successful! Hedera NFT Serial: ${hederaNftSerial}, Tx: ${mintResult.transactionId}`);

      // Store the authenticity token record
      // Format: CollectionID/Serial (e.g., "0.0.7145131/5")
      const authToken = await this.prisma.authToken.create({
        data: {
          orderId,
          artworkId,
          hederaTokenId: `${tokenId}/${hederaNftSerial}`,
          hederaTxHash: mintResult.transactionId,
          metadataIpfs: metadataUrl,
          mintedBy: 'system'
        }
      });

      authenticityTokenId = authToken.id;
      this.logger.log(`💾 Authenticity token saved to database: ${authToken.id}`);

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
        `✅ Ownership token minted: ${ownershipResult.hederaTokenId} (tx: ${ownershipResult.hederaTxHash})`
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
      this.logger.log(`🔗 Linking ownership token to authenticity token...`);
      await this.tokenizationService.linkToAuthenticityToken(
        orderId,
        artworkId,
        order.buyerId,
        authenticityTokenId,
        ownershipResult
      );

      // Update order status to fulfilled
      this.logger.log(`📝 Updating order status to fulfilled...`);
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
      this.logger.error(`❌ Failed to mint tokens for order ${orderId}`);
      this.logger.error(`Error type: ${error.constructor.name}`);
      this.logger.error(`Error message: ${error.message}`);
      
      if (error.status) {
        this.logger.error(`Hedera status code: ${error.status}`);
      }
      
      if (error.stack) {
        this.logger.error(`Stack trace: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
      
      // Update order status based on what failed
      const orderStatus = authenticityTokenId 
        ? 'ownership_mint_failed'  // Authenticity succeeded, ownership failed
        : 'mint_failed';            // Authenticity failed

      this.logger.warn(`Setting order status to: ${orderStatus}`);
      
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

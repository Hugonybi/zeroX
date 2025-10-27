import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, PrivateKey, TokenMintTransaction, TransactionResponse } from '@hashgraph/sdk';

@Injectable()
export class HederaService {
  private readonly logger = new Logger(HederaService.name);
  private readonly client: Client;
  private readonly treasuryKey: PrivateKey;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('hedera.accountId');
    const privateKey = this.configService.get<string>('hedera.privateKey');
    
    if (!accountId || !privateKey) {
      throw new Error('Missing Hedera credentials');
    }

    const treasuryKey = this.configService.get<string>('hedera.treasuryPrivateKey');
    if (!treasuryKey) {
      throw new Error('Missing Hedera treasury key');
    }

    this.client = Client.forTestnet();
    // Use fromString() to auto-detect key type (ED25519 or ECDSA)
    this.client.setOperator(accountId, PrivateKey.fromString(privateKey));
    this.treasuryKey = PrivateKey.fromString(treasuryKey);
  }

  async mintUniqueToken(tokenId: string, metadata: Buffer): Promise<{ transactionId: string; serialNumbers: number[] }> {
    const maxAttempts = this.resolveNumberConfig('hedera.mintMaxAttempts', 3, 1);
    const retryDelayMs = this.resolveNumberConfig('hedera.retryDelayMs', 1000, 0);

    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await this.executeMint(tokenId, metadata);
        const receipt = await response.getReceipt(this.client);

        this.logger.log(`Minted NFT for token ${tokenId} with status ${receipt.status.toString()} (attempt ${attempt})`);

        return {
          transactionId: response.transactionId.toString(),
          serialNumbers: receipt.serials.map(serial => serial.toNumber())
        };
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (attempt < maxAttempts) {
          this.logger.warn(`Mint attempt ${attempt} failed for token ${tokenId}: ${errorMessage}. Retrying...`);
          if (retryDelayMs > 0) {
            await this.delay(retryDelayMs);
          }
        } else {
          this.logger.error(`Failed to mint NFT for token ${tokenId} after ${maxAttempts} attempts`, error as Error);
        }
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new Error('Failed to mint NFT due to an unknown error');
  }

  private async executeMint(tokenId: string, metadata: Buffer): Promise<TransactionResponse> {
    // Create the mint transaction
    const transaction = new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(metadata);

    // Freeze the transaction with client
    const frozenTransaction = await transaction.freezeWith(this.client);

    // Sign with supply key (treasury key)
    const signedTransaction = await frozenTransaction.sign(this.treasuryKey);

    // Execute the transaction
    return signedTransaction.execute(this.client);
  }

  private resolveNumberConfig(key: string, defaultValue: number, minimum: number): number {
    const raw = this.configService.get<string | number | undefined>(key);
    const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : raw;
    if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= minimum) {
      return parsed;
    }
    return defaultValue;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

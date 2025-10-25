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
    this.client.setOperator(accountId, PrivateKey.fromString(privateKey));
    this.treasuryKey = PrivateKey.fromString(treasuryKey);
  }

  async mintUniqueToken(tokenId: string, metadata: Buffer): Promise<{ transactionId: string; serialNumbers: number[] }> {
    try {
      // Create the mint transaction
      const transaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .addMetadata(metadata);

      // Freeze the transaction with client
      const frozenTransaction = await transaction.freezeWith(this.client);

      // Sign with supply key (treasury key)
      const signedTransaction = await frozenTransaction.sign(this.treasuryKey);

      // Execute the transaction
      const response: TransactionResponse = await signedTransaction.execute(this.client);

      // Get the receipt
      const receipt = await response.getReceipt(this.client);

      this.logger.log(`Minted NFT for token ${tokenId} with status ${receipt.status.toString()}`);
      
      return {
        transactionId: response.transactionId.toString(),
        serialNumbers: receipt.serials.map(serial => serial.toNumber())
      };
    } catch (error) {
      this.logger.error(`Failed to mint NFT for token ${tokenId}`, error);
      throw error;
    }
  }
}

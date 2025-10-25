import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ipfs.pinataApiKey') ?? '';
    this.secretKey = this.configService.get<string>('ipfs.pinataSecretApiKey') ?? '';
  }

  async pinJson(name: string, metadata: Record<string, unknown>) {
    try {
      const pinataSDK = await import('@pinata/sdk');
      const client = new pinataSDK.default(this.apiKey, this.secretKey);
      const result = await client.pinJSONToIPFS(metadata, { pinataMetadata: { name } });
      return result;
    } catch (error) {
      this.logger.error('Failed to pin JSON to IPFS', error as Error);
      throw new InternalServerErrorException('Unable to pin metadata to IPFS');
    }
  }
}

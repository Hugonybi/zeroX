import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PinataService {
  private readonly pinataApiUrl = 'https://api.pinata.cloud';
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ipfs.pinataApiKey') || '';
    this.secretKey = this.configService.get<string>('ipfs.pinataSecretApiKey') || '';
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Pinata API credentials not configured');
    }
  }

  async uploadJSON(metadata: Record<string, unknown>): Promise<string> {
    try {
      const response = await axios.post(
        `${this.pinataApiUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: `artwork-metadata-${Date.now()}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (error) {
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  async uploadFile(file: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(file)]), filename);
      formData.append('pinataMetadata', JSON.stringify({
        name: filename,
      }));

      const response = await axios.post(
        `${this.pinataApiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretKey,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (error) {
      throw new Error(`Failed to upload file to Pinata: ${error.message}`);
    }
  }
}
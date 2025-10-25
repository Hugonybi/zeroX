import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

interface InitializeTransactionPayload {
  email: string;
  amount: number;
  reference: string;
  currency: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly configService: ConfigService) {}

  async initializeTransaction(payload: InitializeTransactionPayload) {
    try {
      const secretKey = this.configService.get<string>('paystack.secretKey');
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to initialize Paystack transaction', error as Error);
      throw new InternalServerErrorException('Unable to initialize payment');
    }
  }

  verifyWebhookSignature(signature: string | undefined, rawBody: string): boolean {
    const secret = this.configService.get<string>('paystack.webhookSecret');
    if (!signature || !secret) {
      return false;
    }
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    return hash === signature;
  }
}

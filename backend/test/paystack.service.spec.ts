import { PaystackService } from '@modules/payments/paystack.service';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

describe('PaystackService', () => {
  const secret = 'test_secret';
  const configService = {
    get: (key: string) => {
      if (key === 'paystack.secretKey') {
        return 'secret_key';
      }
      if (key === 'paystack.webhookSecret') {
        return secret;
      }
      return undefined;
    }
  } as unknown as ConfigService;

  const service = new PaystackService(configService);

  it('validates webhook signature', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
  const signature = createHmac('sha512', secret).update(payload).digest('hex');
    expect(service.verifyWebhookSignature(signature, payload)).toBe(true);
  });

  it('rejects invalid webhook signature', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
    expect(service.verifyWebhookSignature('invalid', payload)).toBe(false);
  });
});

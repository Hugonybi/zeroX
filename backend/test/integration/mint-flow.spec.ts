import { ConfigService } from '@nestjs/config';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { PaymentProvider } from '../../src/modules/orders/orders.types';
import { HederaService } from '../../src/modules/hedera/hedera.service';
import { MintAuthenticityWorker } from '../../src/workers/mint-authenticity.worker';
import { QueueService } from '../../src/queue/queue.service';

type HashgraphMock = {
  Client: { forTestnet: jest.Mock };
  PrivateKey: { fromString: jest.Mock };
  TokenMintTransaction: jest.Mock;
  executeMock: jest.Mock;
};

type MintJobPayload = {
  orderId: string;
  artworkId: string;
  metadata: Record<string, unknown>;
};

jest.mock('@hashgraph/sdk', () => {
  const executeMock = jest.fn();

  return {
    Client: {
      forTestnet: jest.fn(() => ({
        setOperator: jest.fn()
      }))
    },
    PrivateKey: {
      fromString: jest.fn(() => ({}))
    },
    TokenMintTransaction: jest.fn().mockImplementation(() => ({
      setTokenId: jest.fn().mockReturnThis(),
      addMetadata: jest.fn().mockReturnThis(),
      freezeWith: jest.fn().mockImplementation(async () => ({
        sign: jest.fn().mockImplementation(async () => ({
          execute: executeMock
        }))
      }))
    })),
    executeMock,
    __esModule: true
  };
});

const hashgraphMock = jest.requireMock('@hashgraph/sdk') as HashgraphMock;

class FakePrismaService {
  private artworks = new Map<string, Record<string, unknown>>();
  private users = new Map<string, Record<string, unknown>>();
  private ordersById = new Map<string, Record<string, unknown>>();
  private ordersByReference = new Map<string, Record<string, unknown>>();
  public authTokens: Array<Record<string, unknown>> = [];

  constructor() {
    this.artworks.set('art-1', {
      id: 'art-1',
      title: 'Sunrise',
      mediaUrl: 'https://example.com/artwork.jpg',
      priceCents: 5000,
      currency: 'NGN'
    });

    this.users.set('buyer-1', {
      id: 'buyer-1',
      email: 'buyer@example.com'
    });
  }

  user = {
    findUnique: jest.fn(async ({ where }: { where: { id: string } }) => this.users.get(where.id) ?? null)
  };

  artwork = {
    findUnique: jest.fn(async ({ where }: { where: { id: string } }) => this.artworks.get(where.id) ?? null)
  };

  order = {
    create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const id = (data.id as string) ?? `order-${this.ordersById.size + 1}`;
      const record = {
        id,
        reference: data.reference,
        buyerId: data.buyerId,
        artworkId: data.artworkId,
        amountCents: data.amountCents,
        currency: data.currency,
        paymentProvider: data.paymentProvider,
        paymentStatus: data.paymentStatus ?? 'pending',
        orderStatus: data.orderStatus ?? 'created'
      };
      this.ordersById.set(record.id, record);
      this.ordersByReference.set(record.reference as string, record);
      return { ...record };
    }),
    update: jest.fn(async ({ where, data }: { where: { id?: string; reference?: string }; data: Record<string, unknown> }) => {
      const order = where.id ? this.ordersById.get(where.id) : this.ordersByReference.get(where.reference ?? '');
      if (!order) {
        throw new Error('Order not found');
      }
      Object.assign(order, data);
      if (data.reference) {
        this.ordersByReference.set(order.reference as string, order);
      }
      return { ...order };
    }),
    findUnique: jest.fn(async ({ where }: { where: { id?: string; reference?: string } }) => {
      if (where.id) {
        return this.ordersById.get(where.id) ?? null;
      }
      if (where.reference) {
        return this.ordersByReference.get(where.reference) ?? null;
      }
      return null;
    })
  };

  authToken = {
    create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const record = { id: (data.id as string) ?? `auth-${this.authTokens.length + 1}`, ...data };
      this.authTokens.push(record);
      return record;
    })
  };
}

class FakePaystackService {
  initializeTransaction = jest.fn(async () => ({
    data: {
      authorization_url: 'https://paystack.test/checkout'
    }
  }));
}

class FakePinataService {
  uploadJSON = jest.fn(async (metadata: Record<string, unknown>) => `ipfs://fake/${metadata['name'] ?? 'metadata'}`);
}

class FakeQueue {
  public addedJobs: Array<{ name: string; payload: MintJobPayload; options?: Record<string, unknown> }> = [];

  constructor(private readonly worker: MintAuthenticityWorker) {}

  async add(name: string, payload: MintJobPayload, options?: Record<string, unknown>) {
    this.addedJobs.push({ name, payload, options });
    const job = { data: payload } as unknown as Parameters<typeof this.worker.process>[0];
    return this.worker.process(job);
  }

}

function createConfigService(overrides: Record<string, unknown> = {}): ConfigService {
  const defaults: Record<string, unknown> = {
    'hedera.accountId': '0.0.1001',
    'hedera.privateKey': '302e020100300506032b657004220420test-private-key',
    'hedera.treasuryPrivateKey': '302e020100300506032b657004220420test-treasury-key',
    'hedera.mintMaxAttempts': 3,
    'hedera.retryDelayMs': 0,
    'hedera.nftTokenId': '0.0.6006'
  };

  const values = { ...defaults, ...overrides };

  return {
    get: (key: string) => values[key]
  } as unknown as ConfigService;
}

function setupTestEnvironment(configOverrides: Record<string, unknown> = {}) {
  const prisma = new FakePrismaService();
  const paystack = new FakePaystackService();
  const configService = createConfigService(configOverrides);
  const hederaService = new HederaService(configService);
  const pinataService = new FakePinataService();
  const worker = new MintAuthenticityWorker(
    hederaService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pinataService as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma as any,
    configService
  );
  const queue = new FakeQueue(worker);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queueService = new QueueService(queue as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersService = new OrdersService(prisma as any, paystack as any);

  return {
    prisma,
    paystack,
    configService,
    hederaService,
    pinataService,
    worker,
    queueService,
    ordersService
  };
}

describe('Order to mint integration flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes the minting flow after payment success', async () => {
    const { ordersService, queueService, prisma, pinataService } = setupTestEnvironment();
    const executeMock = hashgraphMock.executeMock;

    executeMock.mockResolvedValueOnce({
      transactionId: { toString: () => 'tx-success' },
      getReceipt: jest.fn().mockResolvedValue({
        status: { toString: () => 'SUCCESS' },
        serials: [{ toNumber: () => 1 }]
      })
    });

    const { order } = await ordersService.createCheckout('buyer-1', {
      artworkId: 'art-1',
      paymentProvider: PaymentProvider.paystack
    });

    await ordersService.updatePaymentStatus(
      order.reference,
      'paid' as PaymentStatus,
      'processing' as OrderStatus
    );

    await queueService.enqueueMintJob({
      orderId: order.id,
      artworkId: order.artworkId,
      metadata: {
        name: 'Sunrise',
        description: 'First light hits the horizon',
        mediaUrl: 'https://example.com/artwork.jpg'
      }
    });

    expect(prisma.authTokens).toHaveLength(1);
    expect(prisma.authTokens[0]).toMatchObject({
      orderId: order.id,
      artworkId: order.artworkId,
      hederaTokenId: '0.0.6006/1',
      hederaTxHash: 'tx-success'
    });

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder?.orderStatus).toBe('fulfilled');
    expect(pinataService.uploadJSON).toHaveBeenCalledTimes(1);
  });

  it('marks the order as mint_failed when Hedera minting exhausts retries', async () => {
    const { ordersService, queueService, prisma } = setupTestEnvironment({ 'hedera.mintMaxAttempts': 2 });
    const executeMock = hashgraphMock.executeMock;

    executeMock.mockRejectedValue(new Error('network down'));

    const { order } = await ordersService.createCheckout('buyer-1', {
      artworkId: 'art-1',
      paymentProvider: PaymentProvider.paystack
    });

    await ordersService.updatePaymentStatus(
      order.reference,
      'paid' as PaymentStatus,
      'processing' as OrderStatus
    );

    await expect(
      queueService.enqueueMintJob({
        orderId: order.id,
        artworkId: order.artworkId,
        metadata: {
          name: 'Sunrise',
          description: 'Fails to mint',
          mediaUrl: 'https://example.com/artwork.jpg'
        }
      })
    ).rejects.toThrow('network down');

    const failedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(failedOrder?.orderStatus).toBe('mint_failed');
    expect(prisma.authTokens).toHaveLength(0);
  });
});

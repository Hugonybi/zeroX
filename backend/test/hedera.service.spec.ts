import { HederaService } from '../src/modules/hedera/hedera.service';
import { ConfigService } from '@nestjs/config';

type HashgraphMock = {
  Client: { forTestnet: jest.Mock };
  PrivateKey: { fromString: jest.Mock };
  TokenMintTransaction: jest.Mock;
  executeMock: jest.Mock;
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

function createConfigService(overrides: Record<string, unknown> = {}): ConfigService {
  const defaults: Record<string, unknown> = {
    'hedera.accountId': '0.0.1001',
    'hedera.privateKey': '302e020100300506032b657004220420test-private-key',
    'hedera.treasuryPrivateKey': '302e020100300506032b657004220420test-treasury-key',
    'hedera.mintMaxAttempts': 2,
    'hedera.retryDelayMs': 0
  };

  const values = { ...defaults, ...overrides };

  return {
    get: (key: string) => values[key]
  } as unknown as ConfigService;
}

describe('HederaService', () => {
  let executeMock: jest.Mock;

  beforeEach(() => {
    executeMock = hashgraphMock.executeMock;
    jest.clearAllMocks();
  });

  function configureSuccessfulExecution(transactionId = 'tx-123', serial = 42) {
    executeMock.mockResolvedValueOnce({
      transactionId: { toString: () => transactionId },
      getReceipt: jest.fn().mockResolvedValue({
        status: { toString: () => 'SUCCESS' },
        serials: [{ toNumber: () => serial }]
      })
    });
  }

  it('mints a token successfully on the first attempt', async () => {
    const configService = createConfigService();
    const service = new HederaService(configService);
    const warnSpy = jest.spyOn(service['logger'], 'warn');

    configureSuccessfulExecution('tx-success', 7);

    const result = await service.mintUniqueToken('0.0.5005', Buffer.from('data'));

    expect(result).toEqual({ transactionId: 'tx-success', serialNumbers: [7] });
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('retries when the first mint attempt fails', async () => {
    const configService = createConfigService();
    const service = new HederaService(configService);
    const warnSpy = jest.spyOn(service['logger'], 'warn');

    executeMock.mockRejectedValueOnce(new Error('transient failure'));
    configureSuccessfulExecution('tx-retry', 11);

    const result = await service.mintUniqueToken('0.0.5005', Buffer.from('data'));

    expect(result.serialNumbers).toEqual([11]);
    expect(executeMock).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('Retrying');
  });

  it('throws after exhausting retry attempts', async () => {
    const configService = createConfigService({ 'hedera.mintMaxAttempts': 2 });
    const service = new HederaService(configService);
    const warnSpy = jest.spyOn(service['logger'], 'warn');
    const errorSpy = jest.spyOn(service['logger'], 'error');

    executeMock.mockRejectedValue(new Error('permanent failure'));

    await expect(service.mintUniqueToken('0.0.5005', Buffer.from('data'))).rejects.toThrow('permanent failure');

    expect(executeMock).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain('after 2 attempts');
  });
});

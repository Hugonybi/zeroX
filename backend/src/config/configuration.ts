export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:4000',
  database: {
    url: process.env.DATABASE_URL ?? ''
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'changeme',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'changeme-refresh',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '900s',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d'
  },
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10)
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY ?? '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET ?? ''
  },
  hedera: {
    accountId: process.env.HEDERA_ACCOUNT_ID ?? '',
    privateKey: process.env.HEDERA_PRIVATE_KEY ?? '',
    treasuryAccountId: process.env.HEDERA_TREASURY_ACCOUNT_ID ?? '',
    treasuryPrivateKey: process.env.HEDERA_TREASURY_PRIVATE_KEY ?? '',
    nftTokenId: process.env.HEDERA_NFT_TOKEN_ID ?? '',
    ownershipTokenId: process.env.HEDERA_OWNERSHIP_TOKEN_ID ?? '',
    mintMaxAttempts: parseInt(process.env.HEDERA_MINT_MAX_ATTEMPTS ?? '2', 10),
    retryDelayMs: parseInt(process.env.HEDERA_RETRY_DELAY_MS ?? '250', 10)
  },
  ipfs: {
    pinataApiKey: process.env.PINATA_API_KEY ?? '',
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY ?? ''
  }
});

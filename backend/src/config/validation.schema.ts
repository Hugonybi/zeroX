import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('900s'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().default(6379),
  PAYSTACK_SECRET_KEY: Joi.string().required(),
  PAYSTACK_PUBLIC_KEY: Joi.string().allow(''),
  PAYSTACK_WEBHOOK_SECRET: Joi.string().required(),
  HEDERA_ACCOUNT_ID: Joi.string().required(),
  HEDERA_PRIVATE_KEY: Joi.string().required(),
  HEDERA_TREASURY_ACCOUNT_ID: Joi.string().required(),
  HEDERA_TREASURY_PRIVATE_KEY: Joi.string().required(),
  HEDERA_NFT_TOKEN_ID: Joi.string().required(),
  HEDERA_MINT_MAX_ATTEMPTS: Joi.number().integer().min(1).default(2),
  HEDERA_RETRY_DELAY_MS: Joi.number().integer().min(0).default(250),
  PINATA_API_KEY: Joi.string().required(),
  PINATA_SECRET_API_KEY: Joi.string().required()
});

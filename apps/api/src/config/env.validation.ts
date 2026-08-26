import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),

  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),

  DATA_ENCRYPTION_KEY: Joi.string().hex().length(64).required(),

  JWT_ACCESS_TTL_SECONDS: Joi.number().integer().min(60).default(900),

  REFRESH_TOKEN_TTL_SECONDS: Joi.number().integer().min(3600).default(2592000),

  ARGON2_MEMORY_COST: Joi.number().integer().min(19456).default(19456),

  ARGON2_TIME_COST: Joi.number().integer().min(2).default(2),

  ARGON2_PARALLELISM: Joi.number().integer().min(1).default(1),
}).unknown(true);

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),

  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  ARGON2_MEMORY_COST: Joi.number().integer().min(19456).default(19456),

  ARGON2_TIME_COST: Joi.number().integer().min(2).default(2),

  ARGON2_PARALLELISM: Joi.number().integer().min(1).default(1),
}).unknown(true);

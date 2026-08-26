import { envValidationSchema } from './env.validation';

const validEnvironment = {
  DATABASE_URL: 'postgresql://your_shadow:password@localhost:5433/your_shadow',
  NODE_ENV: 'test',
  PORT: '3001',
  JWT_ACCESS_SECRET: 'test-access-secret-with-at-least-32-characters',
  DATA_ENCRYPTION_KEY:
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};

describe('envValidationSchema', () => {
  it('accepts a valid environment', () => {
    const validationResult = envValidationSchema.validate(validEnvironment);

    expect(validationResult.error).toBeUndefined();
    expect(validationResult.value).toMatchObject({
      PORT: 3001,
    });
  });

  it('rejects a missing database URL', () => {
    const validationResult = envValidationSchema.validate({
      ...validEnvironment,
      DATABASE_URL: undefined,
    });

    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain('DATABASE_URL');
  });

  it('rejects an invalid port', () => {
    const validationResult = envValidationSchema.validate({
      ...validEnvironment,
      PORT: '70000',
    });

    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain('PORT');
  });

  it('rejects a missing JWT access secret', () => {
    const validationResult = envValidationSchema.validate({
      ...validEnvironment,
      JWT_ACCESS_SECRET: undefined,
    });

    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain('JWT_ACCESS_SECRET');
  });

  it('rejects a JWT access secret shorter than 32 characters', () => {
    const validationResult = envValidationSchema.validate({
      ...validEnvironment,
      JWT_ACCESS_SECRET: 'short-secret',
    });

    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain('JWT_ACCESS_SECRET');
  });

  it('applies default token lifetimes', () => {
    const validationResult = envValidationSchema.validate(validEnvironment);

    expect(validationResult.error).toBeUndefined();
    expect(validationResult.value).toMatchObject({
      JWT_ACCESS_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_SECONDS: 2592000,
    });
  });
  it('rejects a missing data encryption key', () => {
    // Create an otherwise valid environment without the encryption key.
    const validationResult = envValidationSchema.validate({
      ...validEnvironment,
      DATA_ENCRYPTION_KEY: undefined,
    });

    // The application must refuse to start without the key.
    expect(validationResult.error).toBeDefined();

    // The error must identify the missing variable.
    expect(validationResult.error?.message).toContain('DATA_ENCRYPTION_KEY');
  });

  it('rejects an invalid data encryption key', () => {
    // Use a value that is neither hexadecimal nor 64 characters long.
    const validationResult = envValidationSchema.validate({
      ...validEnvironment,
      DATA_ENCRYPTION_KEY: 'short-invalid-key',
    });

    // The invalid key must be rejected.
    expect(validationResult.error).toBeDefined();

    // The error must identify the incorrect variable.
    expect(validationResult.error?.message).toContain('DATA_ENCRYPTION_KEY');
  });
});

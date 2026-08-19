import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  it('accepts a valid environment', () => {
    const validationResult = envValidationSchema.validate({
      DATABASE_URL:
        'postgresql://your_shadow:password@localhost:5433/your_shadow',
      NODE_ENV: 'test',
      PORT: '3001',
    });

    expect(validationResult.error).toBeUndefined();
    expect(validationResult.value).toMatchObject({
      PORT: 3001,
    });
  });

  it('rejects a missing database URL', () => {
    const validationResult = envValidationSchema.validate({
      NODE_ENV: 'test',
      PORT: '3001',
    });

    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain('DATABASE_URL');
  });

  it('rejects an invalid port', () => {
    const validationResult = envValidationSchema.validate({
      DATABASE_URL:
        'postgresql://your_shadow:password@localhost:5433/your_shadow',
      PORT: '70000',
    });

    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain('PORT');
  });
});

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  const createDto = (overrides: Partial<LoginDto> = {}): LoginDto =>
    plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'Abc123!?',
      ...overrides,
    });

  it('accepts valid login data', async () => {
    const errors = await validate(createDto());

    expect(errors).toHaveLength(0);
  });

  it('normalizes the email', () => {
    const dto = createDto({
      email: '  User@Example.COM  ',
    });

    expect(dto.email).toBe('user@example.com');
  });

  it('rejects an invalid email', async () => {
    const errors = await validate(
      createDto({
        email: 'invalid-email',
      }),
    );

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const errors = await validate(
      createDto({
        password: 'Abc123!',
      }),
    );

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects a password containing only whitespace', async () => {
    const errors = await validate(
      createDto({
        password: '        ',
      }),
    );

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});

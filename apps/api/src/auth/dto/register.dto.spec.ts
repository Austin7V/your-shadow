import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  const createDto = (overrides: Partial<RegisterDto> = {}): RegisterDto =>
    plainToInstance(RegisterDto, {
      email: 'user@example.com',
      password: 'Password123!',
      isAdultConfirmed: true,
      ...overrides,
    });

  it('accepts valid registration data', async () => {
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

  it('rejects a password longer than 128 characters', async () => {
    const errors = await validate(
      createDto({
        password: 'A'.repeat(129),
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

  it('requires adult confirmation', async () => {
    const errors = await validate(
      createDto({
        isAdultConfirmed: false,
      }),
    );

    expect(errors.some((error) => error.property === 'isAdultConfirmed')).toBe(
      true,
    );
  });
});

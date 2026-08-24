import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const password = 'StrongPassword123!';
  let passwordService: PasswordService;

  beforeEach(() => {
    const configService = new ConfigService({
      ARGON2_MEMORY_COST: 19456,
      ARGON2_TIME_COST: 2,
      ARGON2_PARALLELISM: 1,
    });

    passwordService = new PasswordService(configService);
  });

  it('hashes a password with Argon2id', async () => {
    const passwordHash = await passwordService.hash(password);

    expect(passwordHash).not.toBe(password);
    expect(passwordHash.startsWith('$argon2id$')).toBe(true);
  });

  it('verifies a valid password', async () => {
    const passwordHash = await passwordService.hash(password);

    await expect(passwordService.verify(passwordHash, password)).resolves.toBe(
      true,
    );
  });

  it('rejects an invalid password', async () => {
    const passwordHash = await passwordService.hash(password);

    await expect(
      passwordService.verify(passwordHash, 'WrongPassword123!'),
    ).resolves.toBe(false);
  });

  it('creates different hashes for the same password', async () => {
    const firstHash = await passwordService.hash(password);
    const secondHash = await passwordService.hash(password);

    expect(firstHash).not.toBe(secondHash);
  });

  it('rejects a malformed hash safely', async () => {
    await expect(
      passwordService.verify('not-a-valid-hash', password),
    ).resolves.toBe(false);
  });
});

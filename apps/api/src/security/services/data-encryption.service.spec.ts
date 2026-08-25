import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataEncryptionService } from './data-encryption.service';

interface TestHealthData {
  firstName: string;
  weightKg: number;
  condition: string;
}

describe('DataEncryptionService', () => {
  const encryptionKey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const context = 'profile:d1436470-fd51-4b11-9767-e03385feab91';

  const healthData: TestHealthData = {
    firstName: 'Sergey',
    weightKg: 114.4,
    condition: 'Lower back pain',
  };

  let dataEncryptionService: DataEncryptionService;

  beforeEach(() => {
    const configService = new ConfigService({
      DATA_ENCRYPTION_KEY: encryptionKey,
    });

    dataEncryptionService = new DataEncryptionService(configService);
  });

  it('encrypts and decrypts structured data', () => {
    const encryptedValue = dataEncryptionService.encrypt(healthData, context);

    const decryptedValue = dataEncryptionService.decrypt<TestHealthData>(
      encryptedValue,
      context,
    );

    expect(decryptedValue).toEqual(healthData);
    expect(encryptedValue).not.toContain('Sergey');
    expect(encryptedValue).not.toContain('Lower back pain');
  });

  it('creates different ciphertext for identical data', () => {
    const firstEncryptedValue = dataEncryptionService.encrypt(
      healthData,
      context,
    );

    const secondEncryptedValue = dataEncryptionService.encrypt(
      healthData,
      context,
    );

    expect(firstEncryptedValue).not.toBe(secondEncryptedValue);
  });

  it('stores the expected encryption format version', () => {
    const encryptedValue = dataEncryptionService.encrypt(healthData, context);

    const parts = encryptedValue.split('.');

    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('v1');
  });

  it('rejects decryption with a different context', () => {
    const encryptedValue = dataEncryptionService.encrypt(healthData, context);

    expect(() =>
      dataEncryptionService.decrypt<TestHealthData>(
        encryptedValue,
        'profile:another-user-id',
      ),
    ).toThrow(InternalServerErrorException);
  });

  it('rejects modified ciphertext', () => {
    const encryptedValue = dataEncryptionService.encrypt(healthData, context);

    const parts = encryptedValue.split('.');
    const ciphertext = parts[3];

    if (ciphertext === undefined) {
      throw new Error('Expected ciphertext in encrypted value');
    }

    const replacementCharacter = ciphertext.startsWith('A') ? 'B' : 'A';

    parts[3] = replacementCharacter + ciphertext.slice(1);

    const modifiedEncryptedValue = parts.join('.');

    expect(() =>
      dataEncryptionService.decrypt<TestHealthData>(
        modifiedEncryptedValue,
        context,
      ),
    ).toThrow(InternalServerErrorException);
  });

  it('rejects decryption with a different key', () => {
    const encryptedValue = dataEncryptionService.encrypt(healthData, context);

    const differentConfigService = new ConfigService({
      DATA_ENCRYPTION_KEY:
        'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    });

    const differentEncryptionService = new DataEncryptionService(
      differentConfigService,
    );

    expect(() =>
      differentEncryptionService.decrypt<TestHealthData>(
        encryptedValue,
        context,
      ),
    ).toThrow(InternalServerErrorException);
  });

  it('rejects a key that is not 32 bytes', () => {
    const invalidConfigService = new ConfigService({
      DATA_ENCRYPTION_KEY: 'abcd',
    });

    expect(() => new DataEncryptionService(invalidConfigService)).toThrow(
      'DATA_ENCRYPTION_KEY must contain exactly 32 bytes',
    );
  });

  it('rejects an empty encryption context', () => {
    expect(() => dataEncryptionService.encrypt(healthData, '')).toThrow(
      'Encryption context must not be empty',
    );
  });
});

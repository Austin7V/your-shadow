import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// AES-256-GCM provides both confidentiality and tamper detection.
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

// A 12-byte random IV is the recommended size for GCM.
const IV_LENGTH_BYTES = 12;

// AES-GCM produces a 16-byte authentication tag.
const AUTH_TAG_LENGTH_BYTES = 16;

// The version allows us to change the format safely in the future.
const ENCRYPTION_FORMAT_VERSION = 'v1';

// The client must never receive technical decryption details.
const DECRYPTION_ERROR_MESSAGE = 'Unable to decrypt protected data';

@Injectable()
export class DataEncryptionService {
  // The decoded 256-bit key is kept only in application memory.
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Read the 64-character hexadecimal key from configuration.
    const encryptionKeyHex = this.configService.getOrThrow<string>(
      'DATA_ENCRYPTION_KEY',
    );

    // Convert the hexadecimal text into the original 32 bytes.
    this.encryptionKey = Buffer.from(encryptionKeyHex, 'hex');

    // Keep a runtime safety check in addition to Joi validation.
    if (this.encryptionKey.length !== 32) {
      throw new Error('DATA_ENCRYPTION_KEY must contain exactly 32 bytes');
    }
  }

  encrypt<T extends object>(value: T, context: string): string {
    // Every encrypted value receives a new unpredictable IV.
    const initializationVector = randomBytes(IV_LENGTH_BYTES);

    // Create an AES-256-GCM cipher with the key and random IV.
    const cipher = createCipheriv(
      ENCRYPTION_ALGORITHM,
      this.encryptionKey,
      initializationVector,
    );

    // Bind the ciphertext to its version, entity type and owner.
    const additionalAuthenticatedData =
      this.createAdditionalAuthenticatedData(context);

    // A copied ciphertext cannot be decrypted under another context.
    cipher.setAAD(additionalAuthenticatedData);

    // Convert the structured object into JSON before encryption.
    const plaintext = JSON.stringify(value);

    // Encrypt the JSON and combine all produced ciphertext bytes.
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // The authentication tag allows detection of any modification.
    const authenticationTag = cipher.getAuthTag();

    // Store binary parts as URL-safe text separated by dots.
    return [
      ENCRYPTION_FORMAT_VERSION,
      initializationVector.toString('base64url'),
      authenticationTag.toString('base64url'),
      ciphertext.toString('base64url'),
    ].join('.');
  }

  decrypt<T extends object>(encryptedValue: string, context: string): T {
    try {
      // Separate the version, IV, authentication tag and ciphertext.
      const parts = encryptedValue.split('.');

      // Reject incomplete or unexpectedly formatted values.
      if (parts.length !== 4) {
        throw new Error('Invalid encrypted data format');
      }

      // Give clear names to all four stored components.
      const [
        version,
        encodedInitializationVector,
        encodedAuthenticationTag,
        encodedCiphertext,
      ] = parts;
      // TypeScript requires an explicit check for every extracted component.
      if (
        version === undefined ||
        encodedInitializationVector === undefined ||
        encodedAuthenticationTag === undefined ||
        encodedCiphertext === undefined
      ) {
        throw new Error('Invalid encrypted data components');
      }
      // Only the format implemented by this service is accepted.
      if (version !== ENCRYPTION_FORMAT_VERSION) {
        throw new Error('Unsupported encryption format version');
      }

      // Decode the URL-safe IV text back into binary bytes.
      const initializationVector = Buffer.from(
        encodedInitializationVector,
        'base64url',
      );

      // Decode the authentication tag back into binary bytes.
      const authenticationTag = Buffer.from(
        encodedAuthenticationTag,
        'base64url',
      );

      // Decode the encrypted JSON back into binary bytes.
      const ciphertext = Buffer.from(encodedCiphertext, 'base64url');

      // Reject an IV with an unexpected size.
      if (initializationVector.length !== IV_LENGTH_BYTES) {
        throw new Error('Invalid initialization vector length');
      }

      // Reject an authentication tag with an unexpected size.
      if (authenticationTag.length !== AUTH_TAG_LENGTH_BYTES) {
        throw new Error('Invalid authentication tag length');
      }

      // Create the matching AES-256-GCM decipher.
      const decipher = createDecipheriv(
        ENCRYPTION_ALGORITHM,
        this.encryptionKey,
        initializationVector,
      );

      // Recreate the same entity-and-owner binding.
      const additionalAuthenticatedData =
        this.createAdditionalAuthenticatedData(context);

      // Supply the same authenticated context used during encryption.
      decipher.setAAD(additionalAuthenticatedData);

      // Supply the tag so GCM can verify data integrity.
      decipher.setAuthTag(authenticationTag);

      // Decrypt and authenticate all ciphertext bytes.
      const decryptedBytes = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      // Convert the decrypted bytes back into JSON text.
      const plaintext = decryptedBytes.toString('utf8');

      // Parse the JSON and return the original structured object.
      return JSON.parse(plaintext) as T;
    } catch {
      // Hide whether the key, context, tag or ciphertext was incorrect.
      throw new InternalServerErrorException(DECRYPTION_ERROR_MESSAGE);
    }
  }

  private createAdditionalAuthenticatedData(context: string): Buffer {
    // Empty context would remove the owner-binding protection.
    if (context.length === 0) {
      throw new Error('Encryption context must not be empty');
    }

    // Include the version to bind the metadata to this format.
    return Buffer.from(`${ENCRYPTION_FORMAT_VERSION}:${context}`, 'utf8');
  }
}

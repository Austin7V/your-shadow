import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DeleteAccountDto } from './delete-account.dto';

describe('DeleteAccountDto', () => {
  it('accepts a valid account deletion confirmation', async () => {
    const dto = plainToInstance(DeleteAccountDto, {
      password: 'secure-password',
      confirmation: 'DELETE',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).toHaveLength(0);
  });

  it('rejects an incorrect confirmation value', async () => {
    const dto = plainToInstance(DeleteAccountDto, {
      password: 'secure-password',
      confirmation: 'delete',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects a missing password', async () => {
    const dto = plainToInstance(DeleteAccountDto, {
      confirmation: 'DELETE',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });
});

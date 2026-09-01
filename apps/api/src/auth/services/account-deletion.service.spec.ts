import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AccountDeletionService } from './account-deletion.service';
import { PasswordService } from './password.service';

describe('AccountDeletionService', () => {
  const userId = 'user-id';
  const password = 'secure-password';
  const passwordHash = 'stored-password-hash';

  const usersRepository = {
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const passwordService = {
    verify: jest.fn(),
  };

  let accountDeletionService: AccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();

    accountDeletionService = new AccountDeletionService(
      usersRepository as unknown as Repository<User>,
      passwordService as unknown as PasswordService,
    );
  });

  it('deletes the user after verifying the password', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: userId,
      passwordHash,
    });
    passwordService.verify.mockResolvedValue(true);
    usersRepository.delete.mockResolvedValue({
      affected: 1,
      raw: [],
    });

    await accountDeletionService.deleteAccount(userId, password);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });
    expect(passwordService.verify).toHaveBeenCalledWith(passwordHash, password);
    expect(usersRepository.delete).toHaveBeenCalledWith({
      id: userId,
    });
  });

  it('rejects an incorrect password', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: userId,
      passwordHash,
    });
    passwordService.verify.mockResolvedValue(false);

    await expect(
      accountDeletionService.deleteAccount(userId, password),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersRepository.delete).not.toHaveBeenCalled();
  });

  it('rejects deletion when the user does not exist', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      accountDeletionService.deleteAccount(userId, password),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(passwordService.verify).not.toHaveBeenCalled();
    expect(usersRepository.delete).not.toHaveBeenCalled();
  });
});

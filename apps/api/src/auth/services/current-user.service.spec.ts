import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  const userId = 'd1436470-fd51-4b11-9767-e03385feab91';

  let currentUserService: CurrentUserService;

  const usersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    currentUserService = new CurrentUserService(
      usersRepository as unknown as Repository<User>,
    );
  });

  it('returns the active current user safely', async () => {
    const createdAt = new Date('2026-08-25T08:00:00.000Z');

    usersRepository.findOne.mockResolvedValue({
      id: userId,
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      createdAt,
      passwordHash: 'must-not-be-returned',
    } as User);

    const result = await currentUserService.getById(userId);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    expect(result).toEqual({
      id: userId,
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      createdAt,
    });

    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('rejects a missing or inactive user', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(currentUserService.getById(userId)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

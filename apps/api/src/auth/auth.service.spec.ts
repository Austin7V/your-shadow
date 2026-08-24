import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './services/password.service';

describe('AuthService', () => {
  let authService: AuthService;

  const usersRepository = {
    existsBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const passwordService = {
    hash: jest.fn(),
  };

  const registerDto: RegisterDto = {
    email: '  User@Example.COM  ',
    password: 'Password123!',
    isAdultConfirmed: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authService = new AuthService(
      usersRepository as unknown as Repository<User>,
      passwordService as unknown as PasswordService,
    );
  });

  it('registers a new user and returns a safe response', async () => {
    const passwordHash = 'hashed-password';
    const createdAt = new Date('2026-08-24T10:00:00.000Z');

    const user = {
      email: 'user@example.com',
      emailNormalized: 'user@example.com',
      passwordHash,
    } as User;

    const savedUser = {
      ...user,
      id: 'd1436470-fd51-4b11-9767-e03385feab91',
      status: UserStatus.ACTIVE,
      createdAt,
    } as User;

    usersRepository.existsBy.mockResolvedValue(false);
    passwordService.hash.mockResolvedValue(passwordHash);
    usersRepository.create.mockReturnValue(user);
    usersRepository.save.mockResolvedValue(savedUser);

    const result = await authService.register(registerDto);

    expect(usersRepository.existsBy).toHaveBeenCalledWith({
      emailNormalized: 'user@example.com',
    });

    expect(passwordService.hash).toHaveBeenCalledWith(registerDto.password);

    expect(usersRepository.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      emailNormalized: 'user@example.com',
      passwordHash,
    });

    expect(usersRepository.save).toHaveBeenCalledWith(user);

    expect(result).toEqual({
      id: savedUser.id,
      email: savedUser.email,
      status: savedUser.status,
      createdAt,
    });

    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('rejects an already registered email', async () => {
    usersRepository.existsBy.mockResolvedValue(true);

    await expect(authService.register(registerDto)).rejects.toThrow(
      ConflictException,
    );

    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(usersRepository.create).not.toHaveBeenCalled();
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it('handles a database unique constraint violation safely', async () => {
    const user = {
      email: 'user@example.com',
      emailNormalized: 'user@example.com',
      passwordHash: 'hashed-password',
    } as User;

    usersRepository.existsBy.mockResolvedValue(false);
    passwordService.hash.mockResolvedValue('hashed-password');
    usersRepository.create.mockReturnValue(user);
    usersRepository.save.mockRejectedValue({
      code: '23505',
    });

    await expect(authService.register(registerDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('does not hide unexpected database errors', async () => {
    const databaseError = new Error('Database connection failed');

    const user = {
      email: 'user@example.com',
      emailNormalized: 'user@example.com',
      passwordHash: 'hashed-password',
    } as User;

    usersRepository.existsBy.mockResolvedValue(false);
    passwordService.hash.mockResolvedValue('hashed-password');
    usersRepository.create.mockReturnValue(user);
    usersRepository.save.mockRejectedValue(databaseError);

    await expect(authService.register(registerDto)).rejects.toBe(databaseError);
  });
});

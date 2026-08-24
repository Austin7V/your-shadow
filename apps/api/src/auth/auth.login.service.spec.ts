import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordService } from './services/password.service';

describe('AuthService login', () => {
  let authService: AuthService;

  const usersRepository = {
    findOne: jest.fn(),
  };

  const refreshTokensRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const passwordService = {
    verify: jest.fn(),
  };

  const authTokenService = {
    issue: jest.fn(),
  };

  const loginDto: LoginDto = {
    email: '  User@Example.COM  ',
    password: 'Password123!',
  };

  const activeUser = {
    id: 'd1436470-fd51-4b11-9767-e03385feab91',
    email: 'user@example.com',
    emailNormalized: 'user@example.com',
    passwordHash: 'stored-password-hash',
    status: UserStatus.ACTIVE,
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = new AuthService(
      usersRepository as unknown as Repository<User>,
      refreshTokensRepository as unknown as Repository<RefreshToken>,
      passwordService as unknown as PasswordService,
      authTokenService as unknown as AuthTokenService,
    );
  });

  it('logs in an active user with a valid password', async () => {
    const refreshTokenExpiresAt = new Date('2026-09-23T10:00:00.000Z');

    const issuedTokens = {
      accessToken: 'signed-access-token',
      refreshToken: 'raw-refresh-token',
      refreshTokenHash: 'hashed-refresh-token',
      refreshTokenExpiresAt,
    };

    const refreshTokenEntity = {
      tokenHash: issuedTokens.refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
      userId: activeUser.id,
    } as RefreshToken;

    usersRepository.findOne.mockResolvedValue(activeUser);
    passwordService.verify.mockResolvedValue(true);
    authTokenService.issue.mockResolvedValue(issuedTokens);
    refreshTokensRepository.create.mockReturnValue(refreshTokenEntity);
    refreshTokensRepository.save.mockResolvedValue(refreshTokenEntity);

    const result = await authService.login(loginDto);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: {
        emailNormalized: 'user@example.com',
      },
      select: {
        id: true,
        email: true,
        emailNormalized: true,
        passwordHash: true,
        status: true,
      },
    });

    expect(passwordService.verify).toHaveBeenCalledWith(
      activeUser.passwordHash,
      loginDto.password,
    );

    expect(authTokenService.issue).toHaveBeenCalledWith(activeUser.id);

    expect(refreshTokensRepository.create).toHaveBeenCalledWith({
      tokenHash: issuedTokens.refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
      userId: activeUser.id,
    });

    expect(refreshTokensRepository.save).toHaveBeenCalledWith(
      refreshTokenEntity,
    );

    expect(result).toEqual({
      user: {
        id: activeUser.id,
        email: activeUser.email,
        status: activeUser.status,
      },
      accessToken: issuedTokens.accessToken,
      refreshToken: issuedTokens.refreshToken,
    });

    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects an unknown email', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(passwordService.verify).not.toHaveBeenCalled();
    expect(authTokenService.issue).not.toHaveBeenCalled();
    expect(refreshTokensRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an invalid password', async () => {
    usersRepository.findOne.mockResolvedValue(activeUser);
    passwordService.verify.mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toThrow(
      'Invalid email or password',
    );

    expect(authTokenService.issue).not.toHaveBeenCalled();
    expect(refreshTokensRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a disabled user', async () => {
    usersRepository.findOne.mockResolvedValue({
      ...activeUser,
      status: UserStatus.DISABLED,
    });

    await expect(authService.login(loginDto)).rejects.toThrow(
      'Invalid email or password',
    );

    expect(passwordService.verify).not.toHaveBeenCalled();
    expect(authTokenService.issue).not.toHaveBeenCalled();
  });
});

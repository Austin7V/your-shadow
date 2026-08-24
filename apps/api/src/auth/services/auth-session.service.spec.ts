import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { RefreshToken } from '../entities/refresh-token.entity';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';

describe('AuthSessionService', () => {
  const userId = 'd1436470-fd51-4b11-9767-e03385feab91';

  let authSessionService: AuthSessionService;

  const refreshTokensRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const authTokenService = {
    hashRefreshToken: jest.fn(),
    issue: jest.fn(),
  };

  const createStoredRefreshToken = (
    overrides: Partial<RefreshToken> = {},
  ): RefreshToken =>
    ({
      id: 'b87d120f-9159-4df5-9474-c468a46b175d',
      tokenHash: 'stored-refresh-token-hash',
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: null,
      userId,
      user: {
        id: userId,
        status: UserStatus.ACTIVE,
      } as User,
      ...overrides,
    }) as RefreshToken;

  beforeEach(() => {
    jest.clearAllMocks();

    authSessionService = new AuthSessionService(
      refreshTokensRepository as unknown as Repository<RefreshToken>,
      authTokenService as unknown as AuthTokenService,
    );
  });

  it('rotates a valid refresh token', async () => {
    const storedRefreshToken = createStoredRefreshToken();

    const issuedTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      refreshTokenHash: 'new-refresh-token-hash',
      refreshTokenExpiresAt: new Date(Date.now() + 2592000000),
    };

    const newRefreshTokenEntity = {
      tokenHash: issuedTokens.refreshTokenHash,
      expiresAt: issuedTokens.refreshTokenExpiresAt,
      userId,
    } as RefreshToken;

    authTokenService.hashRefreshToken.mockReturnValue(
      'stored-refresh-token-hash',
    );

    refreshTokensRepository.findOne.mockResolvedValue(storedRefreshToken);

    authTokenService.issue.mockResolvedValue(issuedTokens);

    refreshTokensRepository.create.mockReturnValue(newRefreshTokenEntity);

    refreshTokensRepository.save.mockResolvedValue(newRefreshTokenEntity);

    const result = await authSessionService.refresh('raw-refresh-token');

    expect(authTokenService.hashRefreshToken).toHaveBeenCalledWith(
      'raw-refresh-token',
    );

    expect(refreshTokensRepository.findOne).toHaveBeenCalledWith({
      where: {
        tokenHash: 'stored-refresh-token-hash',
      },
      relations: {
        user: true,
      },
    });

    expect(authTokenService.issue).toHaveBeenCalledWith(userId);

    expect(storedRefreshToken.revokedAt).toBeInstanceOf(Date);

    expect(refreshTokensRepository.create).toHaveBeenCalledWith({
      tokenHash: issuedTokens.refreshTokenHash,
      expiresAt: issuedTokens.refreshTokenExpiresAt,
      userId,
    });

    expect(result).toEqual({
      accessToken: issuedTokens.accessToken,
      refreshToken: issuedTokens.refreshToken,
    });
  });

  it('rejects an unknown refresh token', async () => {
    authTokenService.hashRefreshToken.mockReturnValue('unknown-token-hash');

    refreshTokensRepository.findOne.mockResolvedValue(null);

    await expect(authSessionService.refresh('unknown-token')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(authTokenService.issue).not.toHaveBeenCalled();
  });

  it('rejects a revoked refresh token', async () => {
    refreshTokensRepository.findOne.mockResolvedValue(
      createStoredRefreshToken({
        revokedAt: new Date(),
      }),
    );

    await expect(authSessionService.refresh('revoked-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );

    expect(authTokenService.issue).not.toHaveBeenCalled();
  });

  it('rejects an expired refresh token', async () => {
    refreshTokensRepository.findOne.mockResolvedValue(
      createStoredRefreshToken({
        expiresAt: new Date(Date.now() - 1000),
      }),
    );

    await expect(authSessionService.refresh('expired-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );

    expect(authTokenService.issue).not.toHaveBeenCalled();
  });

  it('rejects a disabled user', async () => {
    refreshTokensRepository.findOne.mockResolvedValue(
      createStoredRefreshToken({
        user: {
          id: userId,
          status: UserStatus.DISABLED,
        } as User,
      }),
    );

    await expect(
      authSessionService.refresh('disabled-user-token'),
    ).rejects.toThrow('Invalid or expired refresh token');

    expect(authTokenService.issue).not.toHaveBeenCalled();
  });

  it('revokes the refresh token during logout', async () => {
    const storedRefreshToken = createStoredRefreshToken();

    authTokenService.hashRefreshToken.mockReturnValue(
      'stored-refresh-token-hash',
    );

    refreshTokensRepository.findOneBy.mockResolvedValue(storedRefreshToken);

    await authSessionService.logout('raw-refresh-token');

    expect(refreshTokensRepository.findOneBy).toHaveBeenCalledWith({
      tokenHash: 'stored-refresh-token-hash',
    });

    expect(storedRefreshToken.revokedAt).toBeInstanceOf(Date);

    expect(refreshTokensRepository.save).toHaveBeenCalledWith(
      storedRefreshToken,
    );
  });

  it('allows logout without a refresh cookie', async () => {
    await expect(authSessionService.logout(undefined)).resolves.toBeUndefined();

    expect(authTokenService.hashRefreshToken).not.toHaveBeenCalled();

    expect(refreshTokensRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('allows logout with an unknown token', async () => {
    authTokenService.hashRefreshToken.mockReturnValue('unknown-token-hash');

    refreshTokensRepository.findOneBy.mockResolvedValue(null);

    await expect(
      authSessionService.logout('unknown-token'),
    ).resolves.toBeUndefined();

    expect(refreshTokensRepository.save).not.toHaveBeenCalled();
  });
});

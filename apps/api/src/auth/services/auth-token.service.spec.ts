import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  const userId = 'd1436470-fd51-4b11-9767-e03385feab91';

  let jwtService: JwtService;
  let authTokenService: AuthTokenService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-access-secret-with-at-least-32-characters',
    });

    const configService = new ConfigService({
      JWT_ACCESS_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_SECONDS: 2592000,
    });

    authTokenService = new AuthTokenService(jwtService, configService);
  });

  it('creates a valid access token for the user', async () => {
    const tokens = await authTokenService.issue(userId);

    const payload = await jwtService.verifyAsync<{
      sub: string;
      iat: number;
      exp: number;
    }>(tokens.accessToken);

    expect(payload.sub).toBe(userId);
    expect(payload.exp - payload.iat).toBe(900);
  });

  it('creates a refresh token and its SHA-256 hash', async () => {
    const tokens = await authTokenService.issue(userId);

    const expectedHash = createHash('sha256')
      .update(tokens.refreshToken)
      .digest('hex');

    expect(tokens.refreshToken.length).toBeGreaterThan(64);
    expect(tokens.refreshTokenHash).toBe(expectedHash);
  });

  it('sets the refresh token expiration time', async () => {
    const beforeIssue = Date.now();

    const tokens = await authTokenService.issue(userId);

    const afterIssue = Date.now();
    const refreshTokenLifetime = 2592000 * 1000;

    expect(tokens.refreshTokenExpiresAt.getTime()).toBeGreaterThanOrEqual(
      beforeIssue + refreshTokenLifetime,
    );

    expect(tokens.refreshTokenExpiresAt.getTime()).toBeLessThanOrEqual(
      afterIssue + refreshTokenLifetime,
    );
  });

  it('creates different refresh tokens each time', async () => {
    const firstTokens = await authTokenService.issue(userId);

    const secondTokens = await authTokenService.issue(userId);

    expect(firstTokens.refreshToken).not.toBe(secondTokens.refreshToken);

    expect(firstTokens.refreshTokenHash).not.toBe(
      secondTokens.refreshTokenHash,
    );
  });
  it('hashes an existing refresh token', () => {
    const refreshToken = 'existing-refresh-token';

    const expectedHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    expect(authTokenService.hashRefreshToken(refreshToken)).toBe(expectedHash);
  });
});

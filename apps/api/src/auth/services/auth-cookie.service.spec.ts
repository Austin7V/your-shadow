import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  AuthCookieService,
  REFRESH_TOKEN_COOKIE,
} from './auth-cookie.service';

describe('AuthCookieService', () => {
  const accessToken = 'signed-access-token';
  const refreshToken = 'random-refresh-token';

  let cookieMock: jest.Mock;
  let response: Response;

  beforeEach(() => {
    cookieMock = jest.fn();

    response = {
      cookie: cookieMock,
    } as unknown as Response;
  });

  it('sets authentication cookies in development', () => {
    const configService = new ConfigService({
      NODE_ENV: 'development',
      JWT_ACCESS_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_SECONDS: 2592000,
    });

    const authCookieService = new AuthCookieService(configService);

    authCookieService.setAuthenticationCookies(
      response,
      accessToken,
      refreshToken,
    );

    expect(cookieMock).toHaveBeenNthCalledWith(
      1,
      ACCESS_TOKEN_COOKIE,
      accessToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 900000,
      },
    );

    expect(cookieMock).toHaveBeenNthCalledWith(
      2,
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/auth',
        maxAge: 2592000000,
      },
    );
  });

  it('uses secure cookies in production', () => {
    const configService = new ConfigService({
      NODE_ENV: 'production',
      JWT_ACCESS_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_SECONDS: 2592000,
    });

    const authCookieService = new AuthCookieService(configService);

    authCookieService.setAuthenticationCookies(
      response,
      accessToken,
      refreshToken,
    );

    expect(cookieMock).toHaveBeenNthCalledWith(
      1,
      ACCESS_TOKEN_COOKIE,
      accessToken,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      }),
    );

    expect(cookieMock).toHaveBeenNthCalledWith(
      2,
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      }),
    );
  });
});

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'your_shadow_access_token';

export const REFRESH_TOKEN_COOKIE = 'your_shadow_refresh_token';

@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  setAuthenticationCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';

    const accessTokenMaxAge =
      this.configService.get<number>('JWT_ACCESS_TTL_SECONDS', 900) * 1000;

    const refreshTokenMaxAge =
      this.configService.get<number>('REFRESH_TOKEN_TTL_SECONDS', 2592000) *
      1000;

    const sharedOptions: CookieOptions = {
      httpOnly: true,
      secure,
      sameSite: 'lax',
    };

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...sharedOptions,
      path: '/',
      maxAge: accessTokenMaxAge,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...sharedOptions,
      path: '/auth',
      maxAge: refreshTokenMaxAge,
    });
  }
}

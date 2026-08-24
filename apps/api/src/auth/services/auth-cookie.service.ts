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
    const sharedOptions = this.getSharedCookieOptions();

    const accessTokenMaxAge =
      this.configService.get<number>('JWT_ACCESS_TTL_SECONDS', 900) * 1000;

    const refreshTokenMaxAge =
      this.configService.get<number>('REFRESH_TOKEN_TTL_SECONDS', 2592000) *
      1000;

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

  clearAuthenticationCookies(response: Response): void {
    const sharedOptions = this.getSharedCookieOptions();

    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...sharedOptions,
      path: '/',
    });

    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...sharedOptions,
      path: '/auth',
    });
  }

  private getSharedCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
    };
  }
}

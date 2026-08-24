import type { Request } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../services/auth-cookie.service';

export const getRefreshTokenCookie = (request: Request): string | undefined => {
  const cookies = request.cookies as Record<string, unknown> | undefined;

  const refreshToken = cookies?.[REFRESH_TOKEN_COOKIE];

  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    return undefined;
  }

  return refreshToken;
};

import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../services/auth-cookie.service';

export const getAccessTokenCookie = (request: Request): string | undefined => {
  const cookies = request.cookies as Record<string, unknown> | undefined;

  const accessToken = cookies?.[ACCESS_TOKEN_COOKIE];

  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    return undefined;
  }

  return accessToken;
};

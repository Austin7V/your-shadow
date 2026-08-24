import type { Request } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../services/auth-cookie.service';
import { getRefreshTokenCookie } from './refresh-token-cookie.util';

describe('getRefreshTokenCookie', () => {
  const createRequest = (
    cookies: Record<string, unknown> | undefined,
  ): Request =>
    ({
      cookies,
    }) as unknown as Request;

  it('returns the refresh token from cookies', () => {
    const request = createRequest({
      [REFRESH_TOKEN_COOKIE]: 'raw-refresh-token',
    });

    expect(getRefreshTokenCookie(request)).toBe('raw-refresh-token');
  });

  it('returns undefined when the cookie is missing', () => {
    const request = createRequest({});

    expect(getRefreshTokenCookie(request)).toBeUndefined();
  });

  it('returns undefined when cookies are unavailable', () => {
    const request = createRequest(undefined);

    expect(getRefreshTokenCookie(request)).toBeUndefined();
  });

  it('returns undefined for an empty cookie', () => {
    const request = createRequest({
      [REFRESH_TOKEN_COOKIE]: '',
    });

    expect(getRefreshTokenCookie(request)).toBeUndefined();
  });

  it('returns undefined for a non-string value', () => {
    const request = createRequest({
      [REFRESH_TOKEN_COOKIE]: 123,
    });

    expect(getRefreshTokenCookie(request)).toBeUndefined();
  });
});

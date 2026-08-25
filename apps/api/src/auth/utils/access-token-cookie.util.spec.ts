import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../services/auth-cookie.service';
import { getAccessTokenCookie } from './access-token-cookie.util';

describe('getAccessTokenCookie', () => {
  const createRequest = (
    cookies: Record<string, unknown> | undefined,
  ): Request =>
    ({
      cookies,
    }) as unknown as Request;

  it('returns the access token from cookies', () => {
    const request = createRequest({
      [ACCESS_TOKEN_COOKIE]: 'signed-access-token',
    });

    expect(getAccessTokenCookie(request)).toBe('signed-access-token');
  });

  it('returns undefined when the cookie is missing', () => {
    expect(getAccessTokenCookie(createRequest({}))).toBeUndefined();
  });

  it('returns undefined when cookies are unavailable', () => {
    expect(getAccessTokenCookie(createRequest(undefined))).toBeUndefined();
  });

  it('returns undefined for an empty cookie', () => {
    expect(
      getAccessTokenCookie(
        createRequest({
          [ACCESS_TOKEN_COOKIE]: '',
        }),
      ),
    ).toBeUndefined();
  });

  it('returns undefined for a non-string value', () => {
    expect(
      getAccessTokenCookie(
        createRequest({
          [ACCESS_TOKEN_COOKIE]: 123,
        }),
      ),
    ).toBeUndefined();
  });
});

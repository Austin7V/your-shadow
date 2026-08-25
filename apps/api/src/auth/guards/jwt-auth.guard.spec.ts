import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../services/auth-cookie.service';
import { AuthenticatedUser } from '../types/authenticated-request.type';
import { JwtAuthGuard } from './jwt-auth.guard';

type RequestWithAuthentication = Request & {
  auth?: AuthenticatedUser;
};

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const createContext = (
    request: RequestWithAuthentication,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    jwtAuthGuard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('allows a request with a valid access token', async () => {
    const request = {
      cookies: {
        [ACCESS_TOKEN_COOKIE]: 'valid-access-token',
      },
    } as unknown as RequestWithAuthentication;

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'd1436470-fd51-4b11-9767-e03385feab91',
      iat: 1787644800,
      exp: 1787645700,
    });

    await expect(
      jwtAuthGuard.canActivate(createContext(request)),
    ).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-access-token');

    expect(request.auth).toEqual({
      userId: 'd1436470-fd51-4b11-9767-e03385feab91',
    });
  });

  it('rejects a request without an access cookie', async () => {
    const request = {
      cookies: {},
    } as unknown as RequestWithAuthentication;

    await expect(
      jwtAuthGuard.canActivate(createContext(request)),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects an invalid or expired access token', async () => {
    const request = {
      cookies: {
        [ACCESS_TOKEN_COOKIE]: 'invalid-access-token',
      },
    } as unknown as RequestWithAuthentication;

    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      jwtAuthGuard.canActivate(createContext(request)),
    ).rejects.toThrow('Authentication required');

    expect(request.auth).toBeUndefined();
  });

  it('rejects a token without a user ID', async () => {
    const request = {
      cookies: {
        [ACCESS_TOKEN_COOKIE]: 'token-without-sub',
      },
    } as unknown as RequestWithAuthentication;

    jwtService.verifyAsync.mockResolvedValue({
      iat: 1787644800,
      exp: 1787645700,
    });

    await expect(
      jwtAuthGuard.canActivate(createContext(request)),
    ).rejects.toThrow('Authentication required');

    expect(request.auth).toBeUndefined();
  });
});

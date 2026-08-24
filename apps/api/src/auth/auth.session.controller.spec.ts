import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  AuthCookieService,
  REFRESH_TOKEN_COOKIE,
} from './services/auth-cookie.service';
import { AuthSessionService } from './services/auth-session.service';

describe('AuthController session endpoints', () => {
  let app: INestApplication;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const authSessionService = {
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionService,
        },
        {
          provide: ConfigService,
          useValue: new ConfigService({
            NODE_ENV: 'development',
            JWT_ACCESS_TTL_SECONDS: 900,
            REFRESH_TOKEN_TTL_SECONDS: 2592000,
          }),
        },
        AuthCookieService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rotates tokens and sets new cookies', async () => {
    authSessionService.refresh.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE}=old-refresh-token`)
      .expect(204);

    expect(authSessionService.refresh).toHaveBeenCalledWith(
      'old-refresh-token',
    );

    const cookies = response.headers['set-cookie'] as unknown as string[];

    const accessCookie = cookies.find((cookie) =>
      cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=new-access-token`),
    );

    const refreshCookie = cookies.find((cookie) =>
      cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=new-refresh-token`),
    );

    expect(accessCookie).toContain('HttpOnly');
    expect(accessCookie).toContain('Path=/');
    expect(accessCookie).toContain('SameSite=Lax');

    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Path=/auth');
    expect(refreshCookie).toContain('SameSite=Lax');
  });

  it('returns 401 and clears invalid cookies', async () => {
    authSessionService.refresh.mockRejectedValue(
      new UnauthorizedException('Invalid or expired refresh token'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE}=invalid-token`)
      .expect(401);

    const cookies = response.headers['set-cookie'] as unknown as string[];

    expect(
      cookies.some((cookie) => cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=;`)),
    ).toBe(true);

    expect(
      cookies.some((cookie) => cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=;`)),
    ).toBe(true);
  });

  it('revokes the session and clears cookies', async () => {
    authSessionService.logout.mockResolvedValue(undefined);

    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE}=active-refresh-token`)
      .expect(204);

    expect(authSessionService.logout).toHaveBeenCalledWith(
      'active-refresh-token',
    );

    const cookies = response.headers['set-cookie'] as unknown as string[];

    expect(
      cookies.some((cookie) => cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=;`)),
    ).toBe(true);

    expect(
      cookies.some((cookie) => cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=;`)),
    ).toBe(true);
  });

  it('allows logout without a refresh cookie', async () => {
    authSessionService.logout.mockResolvedValue(undefined);

    await request(app.getHttpServer()).post('/auth/logout').expect(204);

    expect(authSessionService.logout).toHaveBeenCalledWith(undefined);
  });
});

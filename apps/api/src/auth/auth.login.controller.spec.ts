import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UserStatus } from '../users/enums/user-status.enum';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  AuthCookieService,
  REFRESH_TOKEN_COOKIE,
} from './services/auth-cookie.service';

describe('AuthController login', () => {
  let app: INestApplication;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
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

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and sets authentication cookies', async () => {
    authService.login.mockResolvedValue({
      user: {
        id: 'd1436470-fd51-4b11-9767-e03385feab91',
        email: 'user@example.com',
        status: UserStatus.ACTIVE,
      },
      accessToken: 'signed-access-token',
      refreshToken: 'random-refresh-token',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '  User@Example.COM  ',
        password: 'Password123!',
      })
      .expect(200);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(response.body).toEqual({
      id: 'd1436470-fd51-4b11-9767-e03385feab91',
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
    });

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');

    const cookies = response.headers['set-cookie'] as unknown as string[];

    const accessCookie = cookies.find((cookie) =>
      cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=signed-access-token`),
    );

    const refreshCookie = cookies.find((cookie) =>
      cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=random-refresh-token`),
    );

    expect(accessCookie).toContain('HttpOnly');
    expect(accessCookie).toContain('Path=/');
    expect(accessCookie).toContain('SameSite=Lax');

    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Path=/auth');
    expect(refreshCookie).toContain('SameSite=Lax');
  });

  it('returns 400 for invalid login data', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'invalid-email',
        password: 'short',
      })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('returns 401 without setting cookies', async () => {
    authService.login.mockRejectedValue(
      new UnauthorizedException('Invalid email or password'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'WrongPassword123!',
      })
      .expect(401);

    expect(response.headers['set-cookie']).toBeUndefined();
  });
});

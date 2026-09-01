import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../src/auth/services/auth-cookie.service';
import { User } from '../src/users/entities/user.entity';

const getCookiePair = (
  setCookies: string[] | undefined,
  cookieName: string,
): string => {
  const cookie = setCookies?.find((value) =>
    value.startsWith(`${cookieName}=`),
  );

  if (!cookie) {
    throw new Error(`Missing ${cookieName} cookie`);
  }

  const [cookiePair] = cookie.split(';');

  if (!cookiePair) {
    throw new Error(`Invalid ${cookieName} cookie`);
  }

  return cookiePair;
};

describe('Authentication lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let jwtService: JwtService;

  const email = `auth-lifecycle-${randomUUID()}@example.com`;
  const password = 'SecurePassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
  });

  it('completes registration, login, rotation and logout securely', async () => {
    const agent = request.agent(app.getHttpServer());

    const registrationResponse = await agent
      .post('/auth/register')
      .send({
        email,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    expect(registrationResponse.headers['set-cookie']).toBeUndefined();

    const loginResponse = await agent
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    const loginCookies = loginResponse.headers['set-cookie'] as unknown as
      string[] | undefined;

    const originalRefreshCookie = getCookiePair(
      loginCookies,
      REFRESH_TOKEN_COOKIE,
    );

    const currentUserResponse = await agent.get('/auth/me').expect(200);

    const currentUser = currentUserResponse.body as unknown as {
      id: string;
      email: string;
    };

    expect(currentUser.email).toBe(email);

    const expiredAccessToken = await jwtService.signAsync(
      {
        sub: currentUser.id,
      },
      {
        expiresIn: -1,
      },
    );

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', `${ACCESS_TOKEN_COOKIE}=${expiredAccessToken}`)
      .expect(401);

    const refreshResponse = await agent.post('/auth/refresh').expect(204);

    const refreshedCookies = refreshResponse.headers[
      'set-cookie'
    ] as unknown as string[] | undefined;

    const rotatedRefreshCookie = getCookiePair(
      refreshedCookies,
      REFRESH_TOKEN_COOKIE,
    );

    expect(rotatedRefreshCookie).not.toBe(originalRefreshCookie);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', originalRefreshCookie)
      .expect(401);

    await agent.get('/auth/me').expect(200);

    await agent.post('/auth/logout').expect(204);

    await agent.get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', rotatedRefreshCookie)
      .expect(401);
  });

  afterAll(async () => {
    await dataSource.getRepository(User).delete({
      email,
    });

    await app.close();
  });
});

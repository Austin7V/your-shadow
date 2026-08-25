import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { UserStatus } from '../users/enums/user-status.enum';
import { CurrentUserController } from './current-user.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ACCESS_TOKEN_COOKIE } from './services/auth-cookie.service';
import { CurrentUserService } from './services/current-user.service';

describe('CurrentUserController', () => {
  const jwtSecret = 'test-access-secret-with-at-least-32-characters';

  const userId = 'd1436470-fd51-4b11-9767-e03385feab91';

  let app: INestApplication;
  let jwtService: JwtService;

  const currentUserService = {
    getById: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtSecret,
        }),
      ],
      controllers: [CurrentUserController],
      providers: [
        JwtAuthGuard,
        {
          provide: CurrentUserService,
          useValue: currentUserService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());

    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the current user with a valid access token', async () => {
    const createdAt = new Date('2026-08-25T08:00:00.000Z');

    const accessToken = await jwtService.signAsync({
      sub: userId,
    });

    currentUserService.getById.mockResolvedValue({
      id: userId,
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      createdAt,
    });

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', `${ACCESS_TOKEN_COOKIE}=${accessToken}`)
      .expect(200);

    expect(currentUserService.getById).toHaveBeenCalledWith(userId);

    expect(response.body).toEqual({
      id: userId,
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      createdAt: createdAt.toISOString(),
    });

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without an access cookie', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);

    expect(currentUserService.getById).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid access token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', `${ACCESS_TOKEN_COOKIE}=invalid-token`)
      .expect(401);

    expect(currentUserService.getById).not.toHaveBeenCalled();
  });

  it('returns 401 for an expired access token', async () => {
    const expiredAccessToken = await jwtService.signAsync(
      {
        sub: userId,
      },
      {
        expiresIn: -1,
      },
    );

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', `${ACCESS_TOKEN_COOKIE}=${expiredAccessToken}`)
      .expect(401);

    expect(currentUserService.getById).not.toHaveBeenCalled();
  });
});

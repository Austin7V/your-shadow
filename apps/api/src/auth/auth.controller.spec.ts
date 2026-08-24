import {
  ConflictException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UserStatus } from '../users/enums/user-status.enum';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let app: INestApplication;

  const authService = {
    register: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
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

  it('registers a user and returns 201', async () => {
    const createdAt = new Date('2026-08-24T10:00:00.000Z');

    authService.register.mockResolvedValue({
      id: 'd1436470-fd51-4b11-9767-e03385feab91',
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      createdAt,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '  User@Example.COM  ',
        password: 'Abc123!?',
        isAdultConfirmed: true,
      })
      .expect(201);

    expect(authService.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Abc123!?',
      isAdultConfirmed: true,
    });

    expect(response.body).toEqual({
      id: 'd1436470-fd51-4b11-9767-e03385feab91',
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      createdAt: createdAt.toISOString(),
    });

    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('returns 400 for an invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Abc123!?',
        isAdultConfirmed: true,
      })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('returns 400 for a password shorter than 8 characters', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Abc123!',
        isAdultConfirmed: true,
      })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('returns 400 without adult confirmation', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Abc123!?',
        isAdultConfirmed: false,
      })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('returns 409 when the email is already registered', async () => {
    authService.register.mockRejectedValue(
      new ConflictException(
        'Unable to create account with the provided details',
      ),
    );

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Abc123!?',
        isAdultConfirmed: true,
      })
      .expect(409);
  });
});

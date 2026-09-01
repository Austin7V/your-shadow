import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import type { HealthConstraintResponseDto } from '../src/profiles/dto/health-constraint-response.dto';
import type { ProfileResponseDto } from '../src/profiles/dto/profile-response.dto';
import type { WeightEntryResponseDto } from '../src/profiles/dto/weight-entry-response.dto';
import { HealthConstraintSeverity } from '../src/profiles/enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../src/profiles/enums/health-constraint-type.enum';
import { ProfileGoal } from '../src/profiles/enums/profile-goal.enum';
import { User } from '../src/users/entities/user.entity';

describe('Profile ownership (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let firstAgent: ReturnType<typeof request.agent>;
  let secondAgent: ReturnType<typeof request.agent>;
  let firstConstraintId: string;

  const firstEmail = `ownership-first-${randomUUID()}@example.com`;
  const secondEmail = `ownership-second-${randomUUID()}@example.com`;
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
    firstAgent = request.agent(app.getHttpServer());
    secondAgent = request.agent(app.getHttpServer());

    await firstAgent
      .post('/auth/register')
      .send({
        email: firstEmail,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    await firstAgent
      .post('/auth/login')
      .send({
        email: firstEmail,
        password,
      })
      .expect(200);

    await secondAgent
      .post('/auth/register')
      .send({
        email: secondEmail,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    await secondAgent
      .post('/auth/login')
      .send({
        email: secondEmail,
        password,
      })
      .expect(200);

    await firstAgent
      .post('/profile')
      .send({
        firstName: 'First',
        lastName: 'User',
        userName: 'FirstUser',
        dateOfBirth: '1993-07-31',
        heightCm: 184,
        timezone: 'Europe/Berlin',
        primaryGoal: ProfileGoal.LOSE_WEIGHT,
        targetWeightKg: 95,
        lastDoctorVisitAt: null,
      })
      .expect(201);

    await secondAgent
      .post('/profile')
      .send({
        firstName: 'Second',
        lastName: 'User',
        userName: 'SecondUser',
        dateOfBirth: '1992-06-15',
        heightCm: 172,
        timezone: 'Europe/Kyiv',
        primaryGoal: ProfileGoal.IMPROVE_FITNESS,
        targetWeightKg: 70,
        lastDoctorVisitAt: null,
      })
      .expect(201);

    await firstAgent
      .post('/profile/weights')
      .send({
        weightKg: 114.4,
        measuredAt: new Date().toISOString(),
      })
      .expect(201);

    await secondAgent
      .post('/profile/weights')
      .send({
        weightKg: 72.5,
        measuredAt: new Date().toISOString(),
      })
      .expect(201);

    const firstConstraintResponse = await firstAgent
      .post('/profile/health-constraints')
      .send({
        type: HealthConstraintType.INJURY,
        title: 'First user constraint',
        notes: 'Private first-user notes.',
        severity: HealthConstraintSeverity.MODERATE,
      })
      .expect(201);

    const firstConstraint =
      firstConstraintResponse.body as unknown as HealthConstraintResponseDto;

    firstConstraintId = firstConstraint.id;

    await secondAgent
      .post('/profile/health-constraints')
      .send({
        type: HealthConstraintType.ALLERGY,
        title: 'Second user constraint',
        notes: 'Private second-user notes.',
        severity: HealthConstraintSeverity.LOW,
      })
      .expect(201);
  });

  it('returns only the authenticated users profile', async () => {
    const firstResponse = await firstAgent.get('/profile').expect(200);

    const secondResponse = await secondAgent.get('/profile').expect(200);

    const firstProfile = firstResponse.body as unknown as ProfileResponseDto;

    const secondProfile = secondResponse.body as unknown as ProfileResponseDto;

    expect(firstProfile.firstName).toBe('First');
    expect(secondProfile.firstName).toBe('Second');
    expect(firstProfile.id).not.toBe(secondProfile.id);
    expect(firstProfile).not.toHaveProperty('userId');
    expect(secondProfile).not.toHaveProperty('userId');
  });

  it('returns only the authenticated users weight history', async () => {
    const firstResponse = await firstAgent.get('/profile/weights').expect(200);

    const secondResponse = await secondAgent
      .get('/profile/weights')
      .expect(200);

    const firstWeights =
      firstResponse.body as unknown as WeightEntryResponseDto[];

    const secondWeights =
      secondResponse.body as unknown as WeightEntryResponseDto[];

    expect(firstWeights).toHaveLength(1);
    expect(secondWeights).toHaveLength(1);
    expect(firstWeights[0]?.weightKg).toBe(114.4);
    expect(secondWeights[0]?.weightKg).toBe(72.5);
    expect(firstWeights[0]?.id).not.toBe(secondWeights[0]?.id);
  });

  it('returns only the authenticated users health constraints', async () => {
    const firstResponse = await firstAgent
      .get('/profile/health-constraints')
      .expect(200);

    const secondResponse = await secondAgent
      .get('/profile/health-constraints')
      .expect(200);

    const firstConstraints =
      firstResponse.body as unknown as HealthConstraintResponseDto[];

    const secondConstraints =
      secondResponse.body as unknown as HealthConstraintResponseDto[];

    expect(firstConstraints).toHaveLength(1);
    expect(secondConstraints).toHaveLength(1);
    expect(firstConstraints[0]?.title).toBe('First user constraint');
    expect(secondConstraints[0]?.title).toBe('Second user constraint');
    expect(firstConstraints[0]?.id).not.toBe(secondConstraints[0]?.id);
  });

  it('prevents one user from updating another users constraint', async () => {
    await secondAgent
      .patch(`/profile/health-constraints/${firstConstraintId}`)
      .send({
        title: 'Modified by another user',
        severity: HealthConstraintSeverity.HIGH,
        isActive: false,
      })
      .expect(404);

    const firstResponse = await firstAgent
      .get('/profile/health-constraints')
      .expect(200);

    const firstConstraints =
      firstResponse.body as unknown as HealthConstraintResponseDto[];

    expect(firstConstraints[0]?.title).toBe('First user constraint');
    expect(firstConstraints[0]?.severity).toBe(
      HealthConstraintSeverity.MODERATE,
    );
    expect(firstConstraints[0]?.isActive).toBe(true);
  });

  afterAll(async () => {
    const usersRepository = dataSource.getRepository(User);

    await usersRepository.delete({
      email: firstEmail,
    });

    await usersRepository.delete({
      email: secondEmail,
    });

    await app.close();
  });
});

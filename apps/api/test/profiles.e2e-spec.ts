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

describe('Profile API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authenticatedAgent: ReturnType<typeof request.agent>;

  const email = `profile-e2e-${randomUUID()}@example.com`;
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
    authenticatedAgent = request.agent(app.getHttpServer());

    await authenticatedAgent
      .post('/auth/register')
      .send({
        email,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    await authenticatedAgent
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);
  });

  it('rejects profile access without authentication', async () => {
    await request(app.getHttpServer()).get('/profile').expect(401);
  });

  it('completes the authenticated profile workflow', async () => {
    const validProfile = {
      firstName: 'Sergey',
      lastName: 'Badin',
      userName: 'Sergey',
      dateOfBirth: '1993-07-31',
      heightCm: 184,
      timezone: 'Europe/Berlin',
      primaryGoal: ProfileGoal.LOSE_WEIGHT,
      targetWeightKg: 95,
      lastDoctorVisitAt: null,
    };

    await authenticatedAgent
      .post('/profile')
      .send({
        ...validProfile,
        heightCm: 300,
      })
      .expect(400);

    const createProfileResponse = await authenticatedAgent
      .post('/profile')
      .send(validProfile)
      .expect(201);

    const createdProfile =
      createProfileResponse.body as unknown as ProfileResponseDto;

    expect(createdProfile.firstName).toBe('Sergey');
    expect(createdProfile.timezone).toBe('Europe/Berlin');
    expect(createdProfile).not.toHaveProperty('userId');
    expect(createdProfile).not.toHaveProperty('encryptedData');

    const getProfileResponse = await authenticatedAgent
      .get('/profile')
      .expect(200);

    const receivedProfile =
      getProfileResponse.body as unknown as ProfileResponseDto;

    expect(receivedProfile.id).toBe(createdProfile.id);

    const updateProfileResponse = await authenticatedAgent
      .patch('/profile')
      .send({
        userName: 'Shadow',
      })
      .expect(200);

    const updatedProfile =
      updateProfileResponse.body as unknown as ProfileResponseDto;

    expect(updatedProfile.userName).toBe('Shadow');
    expect(updatedProfile.firstName).toBe('Sergey');

    const createWeightResponse = await authenticatedAgent
      .post('/profile/weights')
      .send({
        weightKg: 114.4,
        measuredAt: new Date().toISOString(),
      })
      .expect(201);

    const createdWeight =
      createWeightResponse.body as unknown as WeightEntryResponseDto;

    expect(createdWeight.weightKg).toBe(114.4);
    expect(createdWeight).not.toHaveProperty('encryptedData');

    const listWeightsResponse = await authenticatedAgent
      .get('/profile/weights')
      .expect(200);

    const weightEntries =
      listWeightsResponse.body as unknown as WeightEntryResponseDto[];

    expect(weightEntries).toHaveLength(1);
    expect(weightEntries[0]?.id).toBe(createdWeight.id);

    const createConstraintResponse = await authenticatedAgent
      .post('/profile/health-constraints')
      .send({
        type: HealthConstraintType.INJURY,
        title: 'Lower back pain',
        notes: 'Avoid high-impact exercises.',
        severity: HealthConstraintSeverity.MODERATE,
      })
      .expect(201);

    const createdConstraint =
      createConstraintResponse.body as unknown as HealthConstraintResponseDto;

    expect(createdConstraint.title).toBe('Lower back pain');
    expect(createdConstraint.isActive).toBe(true);
    expect(createdConstraint).not.toHaveProperty('encryptedData');

    const listConstraintsResponse = await authenticatedAgent
      .get('/profile/health-constraints')
      .expect(200);

    const constraints =
      listConstraintsResponse.body as unknown as HealthConstraintResponseDto[];

    expect(constraints).toHaveLength(1);
    expect(constraints[0]?.id).toBe(createdConstraint.id);

    const updateConstraintResponse = await authenticatedAgent
      .patch(`/profile/health-constraints/${createdConstraint.id}`)
      .send({
        severity: HealthConstraintSeverity.HIGH,
        isActive: false,
      })
      .expect(200);

    const updatedConstraint =
      updateConstraintResponse.body as unknown as HealthConstraintResponseDto;

    expect(updatedConstraint.severity).toBe(HealthConstraintSeverity.HIGH);
    expect(updatedConstraint.isActive).toBe(false);
  });

  afterAll(async () => {
    await dataSource.getRepository(User).delete({
      email,
    });

    await app.close();
  });
});

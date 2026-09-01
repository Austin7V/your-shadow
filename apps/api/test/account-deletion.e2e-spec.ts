import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { HealthConstraint } from '../src/profiles/entities/health-constraint.entity';
import { Profile } from '../src/profiles/entities/profile.entity';
import { WeightEntry } from '../src/profiles/entities/weight-entry.entity';
import { HealthConstraintSeverity } from '../src/profiles/enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../src/profiles/enums/health-constraint-type.enum';
import { ProfileGoal } from '../src/profiles/enums/profile-goal.enum';
import { User } from '../src/users/entities/user.entity';

describe('Account deletion API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authenticatedAgent: ReturnType<typeof request.agent>;
  let userId: string;

  const email = `account-deletion-${randomUUID()}@example.com`;
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

    const user = await dataSource.getRepository(User).findOneByOrFail({
      email,
    });

    userId = user.id;

    await authenticatedAgent
      .post('/profile')
      .send({
        firstName: 'Sergey',
        lastName: 'Badin',
        userName: 'Sergey',
        dateOfBirth: '1993-07-31',
        heightCm: 184,
        timezone: 'Europe/Berlin',
        primaryGoal: ProfileGoal.LOSE_WEIGHT,
        targetWeightKg: 95,
        lastDoctorVisitAt: null,
      })
      .expect(201);

    await authenticatedAgent
      .post('/profile/weights')
      .send({
        weightKg: 114.4,
        measuredAt: new Date().toISOString(),
      })
      .expect(201);

    await authenticatedAgent
      .post('/profile/health-constraints')
      .send({
        type: HealthConstraintType.INJURY,
        title: 'Lower back pain',
        notes: 'Avoid high-impact exercises.',
        severity: HealthConstraintSeverity.MODERATE,
      })
      .expect(201);
  });

  it('rejects account deletion without authentication', async () => {
    await request(app.getHttpServer())
      .delete('/auth/account')
      .send({
        password,
        confirmation: 'DELETE',
      })
      .expect(401);
  });

  it('rejects an incorrect explicit confirmation', async () => {
    await authenticatedAgent
      .delete('/auth/account')
      .send({
        password,
        confirmation: 'delete',
      })
      .expect(400);

    await authenticatedAgent.get('/auth/me').expect(200);
  });

  it('rejects an incorrect password without deleting the account', async () => {
    await authenticatedAgent
      .delete('/auth/account')
      .send({
        password: 'WrongPassword123!',
        confirmation: 'DELETE',
      })
      .expect(401);

    await authenticatedAgent.get('/auth/me').expect(200);

    const user = await dataSource.getRepository(User).findOneBy({
      id: userId,
    });

    expect(user).not.toBeNull();
  });

  it('deletes the account, owned data, and active sessions', async () => {
    await authenticatedAgent
      .delete('/auth/account')
      .send({
        password,
        confirmation: 'DELETE',
      })
      .expect(204);

    await authenticatedAgent.get('/auth/me').expect(401);
    await authenticatedAgent.post('/auth/refresh').expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(401);

    const user = await dataSource.getRepository(User).findOneBy({
      id: userId,
    });

    const profileCount = await dataSource.getRepository(Profile).count({
      where: {
        userId,
      },
    });

    const weightEntryCount = await dataSource.getRepository(WeightEntry).count({
      where: {
        userId,
      },
    });

    const healthConstraintCount = await dataSource
      .getRepository(HealthConstraint)
      .count({
        where: {
          userId,
        },
      });

    const refreshTokenCount = await dataSource
      .getRepository(RefreshToken)
      .count({
        where: {
          userId,
        },
      });

    expect(user).toBeNull();
    expect(profileCount).toBe(0);
    expect(weightEntryCount).toBe(0);
    expect(healthConstraintCount).toBe(0);
    expect(refreshTokenCount).toBe(0);
  });

  afterAll(async () => {
    await dataSource.getRepository(User).delete({
      email,
    });

    await app.close();
  });
});

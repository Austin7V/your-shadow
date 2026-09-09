import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type {
  GenerateTodayPlanResponse,
  GetTodayPlanResponse,
  UpdateTodayPlanItemStatusResponse,
} from '@your-shadow/contracts';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { ProfileGoal } from '../src/profiles/enums/profile-goal.enum';
import { User } from '../src/users/entities/user.entity';

describe('Today plan API (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let firstAgent: ReturnType<typeof request.agent>;
  let secondAgent: ReturnType<typeof request.agent>;
  let firstUserId: string;
  let secondUserId: string;
  let generatedPlanId: string;
  let generatedItemId: string;

  const firstEmail = `today-plan-first-${randomUUID()}@example.com`;
  const secondEmail = `today-plan-second-${randomUUID()}@example.com`;
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

    const dataSource = app.get(DataSource);

    usersRepository = dataSource.getRepository(User);
    firstAgent = request.agent(app.getHttpServer());
    secondAgent = request.agent(app.getHttpServer());

    const firstRegistration = await firstAgent
      .post('/auth/register')
      .send({
        email: firstEmail,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    firstUserId = (firstRegistration.body as { id: string }).id;

    await firstAgent
      .post('/auth/login')
      .send({
        email: firstEmail,
        password,
      })
      .expect(200);

    await firstAgent
      .post('/profile')
      .send({
        firstName: 'First',
        lastName: 'User',
        userName: `TodayFirst${randomUUID().slice(0, 8)}`,
        dateOfBirth: '1993-07-31',
        heightCm: 184,
        timezone: 'Europe/Berlin',
        primaryGoal: ProfileGoal.LOSE_WEIGHT,
        targetWeightKg: 95,
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

    const secondRegistration = await secondAgent
      .post('/auth/register')
      .send({
        email: secondEmail,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    secondUserId = (secondRegistration.body as { id: string }).id;

    await secondAgent
      .post('/auth/login')
      .send({
        email: secondEmail,
        password,
      })
      .expect(200);

    await secondAgent
      .post('/profile')
      .send({
        firstName: 'Second',
        lastName: 'User',
        userName: `TodaySecond${randomUUID().slice(0, 8)}`,
        dateOfBirth: '1992-06-15',
        heightCm: 172,
        timezone: 'Europe/Berlin',
        primaryGoal: ProfileGoal.IMPROVE_FITNESS,
        targetWeightKg: 70,
        lastDoctorVisitAt: null,
      })
      .expect(201);
  });

  it('rejects anonymous access to every Today plan endpoint', async () => {
    await request(app.getHttpServer()).get('/plans/today').expect(401);

    await request(app.getHttpServer())
      .post('/plans/today/generate')
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/plans/today/items/${randomUUID()}/status`)
      .send({
        status: 'completed',
      })
      .expect(401);
  });

  it('returns the not-generated state for the current local date', async () => {
    const response = await firstAgent.get('/plans/today').expect(200);

    const body = response.body as GetTodayPlanResponse;

    expect(body.state).toBe('not_generated');
    expect(body.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.plan).toBeNull();
    expect(body.generation).toBeNull();
  });

  it('generates the current plan and returns only public fields', async () => {
    const response = await firstAgent.post('/plans/today/generate').expect(201);

    const body = response.body as GenerateTodayPlanResponse;

    expect(body.state).toBe('ready');
    expect(body.plan.localDate).toBe(body.localDate);
    expect(body.plan.items.length).toBeGreaterThan(0);
    expect(body.generation.mode).toBe('fallback');

    expect(body.plan).not.toHaveProperty('userId');

    for (const item of body.plan.items) {
      expect(item).not.toHaveProperty('planId');
      expect(item).not.toHaveProperty('plan');
    }

    generatedPlanId = body.plan.id;

    const pendingItem = body.plan.items.find(
      (item) => item.status === 'pending',
    );

    if (pendingItem === undefined) {
      throw new Error('Generated plan contains no pending item');
    }

    generatedItemId = pendingItem.id;
  });

  it('returns the same plan during repeated generation', async () => {
    const response = await firstAgent.post('/plans/today/generate').expect(201);

    const body = response.body as GenerateTodayPlanResponse;

    expect(body.plan.id).toBe(generatedPlanId);
  });

  it('returns the generated plan through GET', async () => {
    const response = await firstAgent.get('/plans/today').expect(200);

    const body = response.body as GenerateTodayPlanResponse;

    expect(body.state).toBe('ready');
    expect(body.plan.id).toBe(generatedPlanId);
    expect(body.plan.localDate).toBe(body.localDate);
  });

  it('does not expose another users plan item', async () => {
    await secondAgent
      .patch(`/plans/today/items/${generatedItemId}/status`)
      .send({
        status: 'completed',
      })
      .expect(404);
  });

  it('rejects a status that is not allowed by the API contract', async () => {
    await firstAgent
      .patch(`/plans/today/items/${generatedItemId}/status`)
      .send({
        status: 'blocked',
      })
      .expect(400);
  });

  it('allows one transition from pending to completed', async () => {
    const response = await firstAgent
      .patch(`/plans/today/items/${generatedItemId}/status`)
      .send({
        status: 'completed',
      })
      .expect(200);

    const body = response.body as UpdateTodayPlanItemStatusResponse;

    expect(body.id).toBe(generatedItemId);
    expect(body.status).toBe('completed');
  });

  it('rejects another transition from a terminal status', async () => {
    await firstAgent
      .patch(`/plans/today/items/${generatedItemId}/status`)
      .send({
        status: 'skipped',
      })
      .expect(400);
  });

  afterAll(async () => {
    await usersRepository.delete([firstUserId, secondUserId]);

    await app.close();
  });
});

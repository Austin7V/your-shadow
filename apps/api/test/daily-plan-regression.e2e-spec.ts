import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AI_OUTPUT_SCHEMA_VERSIONS,
  type DailyPlanOutput,
  type GenerateTodayPlanResponse,
} from '@your-shadow/contracts';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

import { AI_PROVIDER } from '../src/ai/ai-provider.contract';
import {
  AiProviderError,
  AiProviderErrorCode,
} from '../src/ai/ai-provider.error';
import { FakeAiProvider } from '../src/ai/testing/fake-ai.provider';
import { AppModule } from '../src/app.module';
import { DailyPlan } from '../src/plans/entities/daily-plan.entity';
import { Profile } from '../src/profiles/entities/profile.entity';
import { ProfileGoal } from '../src/profiles/enums/profile-goal.enum';
import { User } from '../src/users/entities/user.entity';

const PASSWORD = 'SecurePassword123!';

interface ReadyUser {
  readonly agent: ReturnType<typeof request.agent>;
  readonly userId: string;
}

function createValidAiOutput(): DailyPlanOutput {
  return {
    schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
    items: [
      {
        type: 'nutrition',
        title: 'Plan balanced meals',
        description:
          'Choose simple meals with protein, vegetables, and enough water.',
        source: 'ai',
        explanation: 'Balanced meals support steady energy throughout the day.',
      },
      {
        type: 'workout',
        title: 'Complete comfortable movement',
        description:
          'Choose a short walk or another comfortable low-impact activity.',
        source: 'ai',
        explanation:
          'A manageable activity is easier to complete consistently.',
      },
      {
        type: 'check_in',
        title: 'Complete the daily check-in',
        description:
          'Record how you feel after completing today’s planned actions.',
        source: 'ai',
        explanation: 'The check-in helps improve future daily recommendations.',
      },
    ],
  };
}

function createInvalidAiOutput(): unknown {
  return {
    schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
    items: [
      {
        type: 'nutrition',
        title: 'Plan balanced meals',
        description: 'Choose a simple balanced meal.',
        source: 'ai',
        explanation: null,
      },
      {
        type: 'sleep',
        title: 'Unsupported recovery task',
        description: 'This unsupported item must never be persisted.',
        source: 'ai',
        explanation: null,
      },
      {
        type: 'check_in',
        title: 'Complete the daily check-in',
        description: 'Record how you feel today.',
        source: 'ai',
        explanation: null,
      },
    ],
  };
}

describe('Daily plan API regression scenarios (e2e)', () => {
  let app: INestApplication<App>;
  let fakeAiProvider: FakeAiProvider;
  let usersRepository: Repository<User>;
  let profilesRepository: Repository<Profile>;
  let dailyPlansRepository: Repository<DailyPlan>;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    fakeAiProvider = new FakeAiProvider();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_PROVIDER)
      .useValue(fakeAiProvider)
      .compile();

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
    profilesRepository = dataSource.getRepository(Profile);
    dailyPlansRepository = dataSource.getRepository(DailyPlan);
  });

  async function createReadyUser(): Promise<ReadyUser> {
    const agent = request.agent(app.getHttpServer());
    const email = `plan-${randomUUID()}@example.com`;

    const registrationResponse = await agent
      .post('/auth/register')
      .send({
        email,
        password: PASSWORD,
        isAdultConfirmed: true,
      })
      .expect(201);

    const registrationBody = registrationResponse.body as {
      id: string;
    };

    createdUserIds.push(registrationBody.id);

    await agent
      .post('/auth/login')
      .send({
        email,
        password: PASSWORD,
      })
      .expect(200);

    await agent
      .post('/profile')
      .send({
        firstName: 'Regression',
        lastName: 'User',
        userName: `Reg${randomUUID().replaceAll('-', '').slice(0, 12)}`,
        dateOfBirth: '1993-07-31',
        heightCm: 184,
        timezone: 'Europe/Berlin',
        primaryGoal: ProfileGoal.GENERAL_WELLNESS,
        targetWeightKg: null,
        lastDoctorVisitAt: null,
      })
      .expect(201);

    const updateResult = await profilesRepository.update(
      {
        userId: registrationBody.id,
      },
      {
        onboardingCompletedAt: new Date(),
      },
    );

    expect(updateResult.affected).toBe(1);

    return {
      agent,
      userId: registrationBody.id,
    };
  }

  it('generates and persists a valid AI plan through the API', async () => {
    const user = await createReadyUser();
    const requestCountBefore = fakeAiProvider.structuredRequests.length;

    fakeAiProvider.enqueueResult(createValidAiOutput());

    const response = await user.agent.post('/plans/today/generate').expect(201);

    const body = response.body as GenerateTodayPlanResponse;

    expect(body.state).toBe('ready');
    expect(body.generation.mode).toBe('ai');
    expect(body.plan.items).toHaveLength(3);
    expect(body.plan.items.map((item) => item.type)).toEqual([
      'nutrition',
      'workout',
      'check_in',
    ]);
    expect(body.plan.items.every((item) => item.source === 'ai')).toBe(true);

    expect(fakeAiProvider.structuredRequests).toHaveLength(
      requestCountBefore + 1,
    );

    const storedPlan = await dailyPlansRepository.findOne({
      where: {
        id: body.plan.id,
        userId: user.userId,
      },
      relations: {
        items: true,
      },
    });

    expect(storedPlan).not.toBeNull();
    expect(storedPlan?.items).toHaveLength(3);

    const getResponse = await user.agent.get('/plans/today').expect(200);
    const getBody = getResponse.body as GenerateTodayPlanResponse;

    expect(getBody.plan.id).toBe(body.plan.id);
  });

  it('uses fallback and rejects invalid AI output before persistence', async () => {
    const user = await createReadyUser();

    fakeAiProvider.enqueueResult(createInvalidAiOutput());

    const response = await user.agent.post('/plans/today/generate').expect(201);

    const body = response.body as GenerateTodayPlanResponse;

    expect(body.state).toBe('ready');
    expect(body.generation.mode).toBe('fallback');
    expect(body.generation.userMessage).not.toBeNull();
    expect(body.plan.items).toHaveLength(3);
    expect(body.plan.items.every((item) => item.source === 'fallback')).toBe(
      true,
    );
    expect(
      body.plan.items.some(
        (item) => item.payload.title === 'Unsupported recovery task',
      ),
    ).toBe(false);

    expect(
      await dailyPlansRepository.countBy({
        userId: user.userId,
        localDate: body.localDate,
      }),
    ).toBe(1);
  });

  it('uses fallback after a provider timeout without exposing raw errors', async () => {
    const user = await createReadyUser();
    const privateProviderMessage = 'private-provider-timeout-details';

    fakeAiProvider.enqueueError(
      new AiProviderError(
        AiProviderErrorCode.Timeout,
        privateProviderMessage,
        true,
      ),
    );

    const response = await user.agent.post('/plans/today/generate').expect(201);

    const body = response.body as GenerateTodayPlanResponse;
    const serializedBody = JSON.stringify(body);

    expect(body.state).toBe('ready');
    expect(body.generation.mode).toBe('fallback');
    expect(body.generation.userMessage).not.toBeNull();
    expect(body.plan.items.every((item) => item.source === 'fallback')).toBe(
      true,
    );
    expect(serializedBody).not.toContain(privateProviderMessage);
  });

  it('blocks normal generation for an active medical restriction', async () => {
    const user = await createReadyUser();
    const requestCountBefore = fakeAiProvider.structuredRequests.length;

    await user.agent
      .post('/profile/health-constraints')
      .send({
        type: 'medical_restriction',
        title: 'Avoid normal workout recommendations',
        notes: 'Follow the current restriction from the healthcare provider.',
        severity: 'high',
      })
      .expect(201);

    const response = await user.agent.post('/plans/today/generate').expect(201);

    const body = response.body as GenerateTodayPlanResponse;

    expect(body.state).toBe('ready');
    expect(body.generation.mode).toBe('rules');
    expect(fakeAiProvider.structuredRequests).toHaveLength(requestCountBefore);

    const workoutItem = body.plan.items.find((item) => item.type === 'workout');

    expect(workoutItem).toMatchObject({
      status: 'blocked',
      source: 'rules',
    });
  });

  it('persists one plan during concurrent API generation requests', async () => {
    const user = await createReadyUser();
    const concurrentRequestCount = 4;

    for (let index = 0; index < concurrentRequestCount; index += 1) {
      fakeAiProvider.enqueueResult(createValidAiOutput());
    }

    const responses = await Promise.all(
      Array.from({ length: concurrentRequestCount }, () =>
        user.agent.post('/plans/today/generate').expect(201),
      ),
    );

    const bodies = responses.map(
      (response) => response.body as GenerateTodayPlanResponse,
    );

    expect(new Set(bodies.map((body) => body.plan.id)).size).toBe(1);

    const firstBody = bodies[0];

    if (firstBody === undefined) {
      throw new Error('Concurrent generation returned no responses');
    }

    expect(
      await dailyPlansRepository.countBy({
        userId: user.userId,
        localDate: firstBody.localDate,
      }),
    ).toBe(1);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await usersRepository.delete(createdUserIds);
    }

    await app.close();
  });
});

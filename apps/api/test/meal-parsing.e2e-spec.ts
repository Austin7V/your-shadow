import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MEAL_DESCRIPTION_LIMITS,
  type ParseMealResponse,
} from '@your-shadow/contracts';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { AI_PROVIDER } from '../src/ai/ai-provider.contract';
import { FakeAiProvider } from '../src/ai/testing/fake-ai.provider';
import { MealEntry } from '../src/meals/entities/meal-entry.entity';
import { MEAL_PARSING_RATE_LIMIT } from '../src/meals/security/meal-parsing-rate-limit.service';
import { User } from '../src/users/entities/user.entity';
import {
  AiProviderError,
  AiProviderErrorCode,
} from '../src/ai/ai-provider.error';
import {
  AMBIGUOUS_PORTION_MEAL_FIXTURE,
  EXPLICIT_PORTIONS_MEAL_FIXTURE,
} from '../src/meals/testing/meal-parsing.fixtures';

describe('Meal parsing API (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let mealEntriesRepository: Repository<MealEntry>;
  let mealAgent: ReturnType<typeof request.agent>;
  let rateLimitAgent: ReturnType<typeof request.agent>;
  let fakeAiProvider: FakeAiProvider;
  let mealUserId: string;
  let rateLimitUserId: string;

  const password = 'SecurePassword123!';
  const mealEmail = `meal-parsing-${randomUUID()}@example.com`;
  const rateLimitEmail = `meal-parsing-rate-limit-${randomUUID()}@example.com`;

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
    mealEntriesRepository = dataSource.getRepository(MealEntry);
    mealAgent = request.agent(app.getHttpServer());
    rateLimitAgent = request.agent(app.getHttpServer());

    mealUserId = await registerAndLogin(mealAgent, mealEmail);
    rateLimitUserId = await registerAndLogin(rateLimitAgent, rateLimitEmail);
  });

  async function registerAndLogin(
    agent: ReturnType<typeof request.agent>,
    email: string,
  ): Promise<string> {
    const registrationResponse = await agent
      .post('/auth/register')
      .send({
        email,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    await agent
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    return (registrationResponse.body as { id: string }).id;
  }

  it('rejects anonymous requests', async () => {
    await request(app.getHttpServer())
      .post('/meals/parse')
      .send({
        originalText: EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText,
      })
      .expect(401);
  });

  it('rejects descriptions containing only whitespace', async () => {
    await mealAgent
      .post('/meals/parse')
      .send({
        originalText: '   ',
      })
      .expect(400);

    expect(fakeAiProvider.structuredRequests).toHaveLength(0);
  });

  it('rejects descriptions above the input limit', async () => {
    await mealAgent
      .post('/meals/parse')
      .send({
        originalText: 'a'.repeat(MEAL_DESCRIPTION_LIMITS.maximumLength + 1),
      })
      .expect(400);

    expect(fakeAiProvider.structuredRequests).toHaveLength(0);
  });

  it('returns a typed draft without persisting a meal entry', async () => {
    fakeAiProvider.enqueueResult(EXPLICIT_PORTIONS_MEAL_FIXTURE.output);

    const entriesBeforeRequest = await mealEntriesRepository.countBy({
      userId: mealUserId,
    });

    const response = await mealAgent
      .post('/meals/parse')
      .send({
        originalText: EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText,
      })
      .expect(200);

    const body = response.body as ParseMealResponse;

    expect(body).toEqual(EXPLICIT_PORTIONS_MEAL_FIXTURE.output);
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('userId');
    expect(body).not.toHaveProperty('status');
    expect(body).not.toHaveProperty('confirmedAt');

    const entriesAfterRequest = await mealEntriesRepository.countBy({
      userId: mealUserId,
    });

    expect(entriesBeforeRequest).toBe(0);
    expect(entriesAfterRequest).toBe(0);
  });

  it('returns one clarification question without saving an ambiguous meal', async () => {
    fakeAiProvider.enqueueResult(AMBIGUOUS_PORTION_MEAL_FIXTURE.output);

    const response = await mealAgent
      .post('/meals/parse')
      .send({
        originalText: AMBIGUOUS_PORTION_MEAL_FIXTURE.originalText,
      })
      .expect(200);

    expect(response.body).toEqual(AMBIGUOUS_PORTION_MEAL_FIXTURE.output);
    expect(response.body).toHaveProperty('clarification', {
      needed: true,
      question: AMBIGUOUS_PORTION_MEAL_FIXTURE.output.clarification.question,
    });
    expect(await mealEntriesRepository.countBy({ userId: mealUserId })).toBe(0);
  });

  it('offers manual entry without saving a meal when AI is unavailable', async () => {
    fakeAiProvider.enqueueError(
      new AiProviderError(
        AiProviderErrorCode.Unavailable,
        'Private provider details',
        true,
      ),
    );

    const response = await mealAgent
      .post('/meals/parse')
      .send({ originalText: 'A bowl of soup' })
      .expect(200);

    expect(response.body).toEqual({
      status: 'manual_entry_required',
      reason: 'ai_unavailable',
      originalText: 'A bowl of soup',
      nutrition: {
        caloriesKcal: null,
        proteinGrams: null,
        fatGrams: null,
        carbohydratesGrams: null,
      },
    });
    expect(await mealEntriesRepository.countBy({ userId: mealUserId })).toBe(0);
  });

  it('enforces the per-user request rate limit', async () => {
    for (
      let requestNumber = 0;
      requestNumber < MEAL_PARSING_RATE_LIMIT.maximumRequests;
      requestNumber += 1
    ) {
      fakeAiProvider.enqueueResult(EXPLICIT_PORTIONS_MEAL_FIXTURE.output);
    }

    for (
      let requestNumber = 0;
      requestNumber < MEAL_PARSING_RATE_LIMIT.maximumRequests;
      requestNumber += 1
    ) {
      await rateLimitAgent
        .post('/meals/parse')
        .send({
          originalText: EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText,
        })
        .expect(200);
    }

    const response = await rateLimitAgent
      .post('/meals/parse')
      .send({
        originalText: EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText,
      })
      .expect(429);

    expect(response.body).toMatchObject({
      statusCode: 429,
      message: 'Too many meal parsing requests. Please try again later.',
    });

    expect(
      await mealEntriesRepository.countBy({
        userId: rateLimitUserId,
      }),
    ).toBe(0);
  });

  afterAll(async () => {
    await usersRepository.delete([mealUserId, rateLimitUserId]);

    await app.close();
  });
});

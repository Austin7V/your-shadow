import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type {
  ConfirmMealRequest,
  ConfirmMealResponse,
} from '@your-shadow/contracts';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

import { AI_PROVIDER } from '../src/ai/ai-provider.contract';
import { DisabledAiProvider } from '../src/ai/providers/disabled-ai.provider';
import { AppModule } from '../src/app.module';
import {
  MealEntry,
  MealEntryStatus,
} from '../src/meals/entities/meal-entry.entity';
import { createMealEntryEncryptionContext } from '../src/meals/security/meal-entry-encryption-context';
import { EXPLICIT_PORTIONS_MEAL_FIXTURE } from '../src/meals/testing/meal-parsing.fixtures';
import { DataEncryptionService } from '../src/security/services/data-encryption.service';
import { User } from '../src/users/entities/user.entity';

describe('Meal confirmation API (e2e)', () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;
  let usersRepository: Repository<User>;
  let mealsRepository: Repository<MealEntry>;
  let encryptionService: DataEncryptionService;
  let userId: string;

  const email = `meal-confirmation-${randomUUID()}@example.com`;
  const password = 'SecurePassword123!';

  const aiRequest: ConfirmMealRequest = {
    source: 'ai',
    mealType: 'lunch',
    originalText: EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText,
    foods: EXPLICIT_PORTIONS_MEAL_FIXTURE.output.foods,
    totals: EXPLICIT_PORTIONS_MEAL_FIXTURE.output.totals,
  };

  const manualRequest: ConfirmMealRequest = {
    source: 'manual',
    mealType: 'dinner',
    originalText: 'A bowl of soup',
    nutrition: {
      caloriesKcal: 250,
      proteinGrams: 10,
      fatGrams: 8,
      carbohydratesGrams: 32,
    },
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_PROVIDER)
      .useValue(new DisabledAiProvider())
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
    mealsRepository = dataSource.getRepository(MealEntry);
    encryptionService = app.get(DataEncryptionService);
    agent = request.agent(app.getHttpServer());

    const registration = await agent
      .post('/auth/register')
      .send({
        email,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    userId = (registration.body as { id: string }).id;

    await agent.post('/auth/login').send({ email, password }).expect(200);

    await agent
      .post('/profile')
      .send({
        firstName: 'Meal',
        lastName: 'Tester',
        userName: `MealTester${randomUUID().slice(0, 8)}`,
        dateOfBirth: '1993-07-31',
        heightCm: 184,
        timezone: 'Europe/Berlin',
        primaryGoal: 'maintain_weight',
        targetWeightKg: null,
        lastDoctorVisitAt: null,
      })
      .expect(201);
  });

  afterAll(async () => {
    if (userId) {
      await usersRepository.delete(userId);
    }

    await app?.close();
  });

  it('rejects an anonymous confirmation', async () => {
    await request(app.getHttpServer())
      .post('/meals/confirm')
      .send(aiRequest)
      .expect(401);

    expect(await mealsRepository.countBy({ userId })).toBe(0);
  });

  it('saves an AI meal encrypted and returns its confirmation', async () => {
    const response = await agent
      .post('/meals/confirm')
      .send(aiRequest)
      .expect(201);

    const body = response.body as ConfirmMealResponse;

    expect(body).toMatchObject({
      status: 'confirmed',
      source: 'ai',
      mealType: 'lunch',
    });
    expect(body.id).toEqual(expect.any(String));
    expect(body.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.confirmedAt).toEqual(expect.any(String));
    expect(body).not.toHaveProperty('userId');
    expect(body).not.toHaveProperty('encryptedData');

    const stored = await mealsRepository.findOneByOrFail({
      id: body.id,
      userId,
    });

    expect(stored.status).toBe(MealEntryStatus.Confirmed);
    expect(stored.localDate).toBe(body.localDate);
    expect(stored.encryptedData).not.toContain(aiRequest.originalText);
    expect(stored.encryptedData).not.toContain('Grilled chicken');

    expect(
      encryptionService.decrypt(
        stored.encryptedData,
        createMealEntryEncryptionContext(userId, stored.id),
      ),
    ).toEqual({ schemaVersion: 1, ...aiRequest });
  });

  it('saves a manual meal without calling AI', async () => {
    const response = await agent
      .post('/meals/confirm')
      .send(manualRequest)
      .expect(201);

    const body = response.body as ConfirmMealResponse;
    const stored = await mealsRepository.findOneByOrFail({
      id: body.id,
      userId,
    });

    expect(body.source).toBe('manual');
    expect(stored.encryptedData).not.toContain(manualRequest.originalText);
    expect(
      encryptionService.decrypt(
        stored.encryptedData,
        createMealEntryEncryptionContext(userId, stored.id),
      ),
    ).toEqual({ schemaVersion: 1, ...manualRequest });
  });

  it('rejects forged ownership and invalid nutrition without saving', async () => {
    const countBefore = await mealsRepository.countBy({ userId });

    await agent
      .post('/meals/confirm')
      .send({ ...manualRequest, userId: randomUUID() })
      .expect(400);

    await agent
      .post('/meals/confirm')
      .send({
        ...manualRequest,
        nutrition: {
          ...manualRequest.nutrition,
          caloriesKcal: -1,
        },
      })
      .expect(400);

    await agent
      .post('/meals/confirm')
      .send({
        ...aiRequest,
        totals: {
          ...aiRequest.totals,
          caloriesKcal: 1,
        },
      })
      .expect(400);

    expect(await mealsRepository.countBy({ userId })).toBe(countBefore);
  });

  it('does not create a second meal when confirmation is repeated', async () => {
    const requestId = randomUUID();
    const countBefore = await mealsRepository.countBy({ userId });

    const first = await agent
      .post('/meals/confirm')
      .set('Idempotency-Key', requestId)
      .send(manualRequest)
      .expect(201);

    const repeated = await agent
      .post('/meals/confirm')
      .set('Idempotency-Key', requestId)
      .send(manualRequest)
      .expect(201);

    expect(repeated.body).toEqual(first.body);
    expect(await mealsRepository.countBy({ userId })).toBe(countBefore + 1);

    await agent
      .post('/meals/confirm')
      .set('Idempotency-Key', requestId)
      .send({ ...manualRequest, originalText: 'A different meal' })
      .expect(409);

    expect(await mealsRepository.countBy({ userId })).toBe(countBefore + 1);
  });
});

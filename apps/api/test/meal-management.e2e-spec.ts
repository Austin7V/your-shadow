import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  type ConfirmMealRequest,
  type ListMealsResponse,
  type MealEntryResponse,
  type DailyNutritionTotalsResponse,
} from '@your-shadow/contracts';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  MealEntry,
  MealEntrySource,
  MealEntryStatus,
} from '../src/meals/entities/meal-entry.entity';
import { createMealEntryEncryptionContext } from '../src/meals/security/meal-entry-encryption-context';
import { DataEncryptionService } from '../src/security/services/data-encryption.service';
import { User } from '../src/users/entities/user.entity';

type ManualMeal = Extract<ConfirmMealRequest, { source: 'manual' }>;

describe('Meal management API (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let mealsRepository: Repository<MealEntry>;
  let encryptionService: DataEncryptionService;
  let ownerAgent: ReturnType<typeof request.agent>;
  let otherAgent: ReturnType<typeof request.agent>;
  let ownerId: string;
  let otherId: string;

  const password = 'SecurePassword123!';

  const originalMeal: ManualMeal = {
    source: 'manual',
    mealType: 'lunch',
    originalText: 'Rice and vegetables',
    nutrition: {
      caloriesKcal: 420,
      proteinGrams: 12,
      fatGrams: 8,
      carbohydratesGrams: 70,
    },
  };

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
    mealsRepository = dataSource.getRepository(MealEntry);
    encryptionService = app.get(DataEncryptionService);

    ownerAgent = request.agent(app.getHttpServer());
    otherAgent = request.agent(app.getHttpServer());

    ownerId = await registerAndLogin(ownerAgent);
    otherId = await registerAndLogin(otherAgent);
  });

  afterAll(async () => {
    await usersRepository.delete([ownerId, otherId]);
    await app.close();
  });

  async function registerAndLogin(
    agent: ReturnType<typeof request.agent>,
  ): Promise<string> {
    const email = `meal-management-${randomUUID()}@example.com`;

    const registration = await agent
      .post('/auth/register')
      .send({
        email,
        password,
        isAdultConfirmed: true,
      })
      .expect(201);

    await agent.post('/auth/login').send({ email, password }).expect(200);

    return (registration.body as { id: string }).id;
  }

  async function createMeal(
    userId: string,
    date: string | null,
    meal: ManualMeal = originalMeal,
    confirmedAt = new Date(),
  ): Promise<MealEntry> {
    const id = randomUUID();

    return mealsRepository.save(
      mealsRepository.create({
        id,
        userId,
        encryptedData: encryptionService.encrypt(
          { schemaVersion: 1, ...meal },
          createMealEntryEncryptionContext(userId, id),
        ),
        localDate: date,
        status:
          date === null ? MealEntryStatus.Draft : MealEntryStatus.Confirmed,
        source: MealEntrySource.Manual,
        schemaVersion: 1,
        confirmedAt: date === null ? null : confirmedAt,
      }),
    );
  }

  it('requires authentication for management endpoints', async () => {
    const id = randomUUID();

    await request(app.getHttpServer())
      .get('/meals?date=2026-10-10')
      .expect(401);

    await request(app.getHttpServer()).get(`/meals/${id}`).expect(401);

    await request(app.getHttpServer())
      .patch(`/meals/${id}`)
      .send(originalMeal)
      .expect(401);

    await request(app.getHttpServer()).delete(`/meals/${id}`).expect(401);
  });

  it('lists only confirmed meals owned by the user on the requested date', async () => {
    const date = '2026-10-10';

    const older = await createMeal(
      ownerId,
      date,
      originalMeal,
      new Date('2026-10-10T08:00:00.000Z'),
    );

    const newer = await createMeal(
      ownerId,
      date,
      { ...originalMeal, originalText: 'Pasta with vegetables' },
      new Date('2026-10-10T12:00:00.000Z'),
    );

    await createMeal(ownerId, null);
    await createMeal(ownerId, '2026-10-09');
    await createMeal(otherId, date);

    const response = await ownerAgent.get(`/meals?date=${date}`).expect(200);

    const body = response.body as ListMealsResponse;

    expect(body.localDate).toBe(date);
    expect(body.meals.map((meal) => meal.id)).toEqual([newer.id, older.id]);
    expect(body.meals[0]).toMatchObject({
      source: 'manual',
      status: 'confirmed',
      originalText: 'Pasta with vegetables',
      nutrition: originalMeal.nutrition,
    });
    expect(body.meals[0]).not.toHaveProperty('userId');
    expect(body.meals[0]).not.toHaveProperty('encryptedData');

    await ownerAgent.get('/meals?date=2026-02-30').expect(400);
    await ownerAgent.get('/meals').expect(400);
  });

  it('returns an owned confirmed meal and hides another user’s meal', async () => {
    const owned = await createMeal(ownerId, '2026-10-11');
    const foreign = await createMeal(otherId, '2026-10-11');

    const response = await ownerAgent.get(`/meals/${owned.id}`).expect(200);

    expect(response.body as MealEntryResponse).toMatchObject({
      id: owned.id,
      localDate: '2026-10-11',
      ...originalMeal,
    });

    await ownerAgent.get(`/meals/${foreign.id}`).expect(404);
    await ownerAgent.get(`/meals/${randomUUID()}`).expect(404);
  });

  it('validates edits and persists encrypted updated values', async () => {
    const entry = await createMeal(ownerId, '2026-10-12');

    const changed: ManualMeal = {
      ...originalMeal,
      mealType: 'dinner',
      originalText: 'Rice, vegetables and tofu',
      nutrition: {
        caloriesKcal: 510,
        proteinGrams: 25,
        fatGrams: 12,
        carbohydratesGrams: 72,
      },
    };

    await ownerAgent
      .patch(`/meals/${entry.id}`)
      .send({
        ...changed,
        nutrition: { ...changed.nutrition, caloriesKcal: -1 },
      })
      .expect(400);

    const response = await ownerAgent
      .patch(`/meals/${entry.id}`)
      .send(changed)
      .expect(200);

    expect(response.body as MealEntryResponse).toMatchObject({
      id: entry.id,
      localDate: '2026-10-12',
      ...changed,
    });

    const stored = await mealsRepository.findOneByOrFail({
      id: entry.id,
      userId: ownerId,
    });

    expect(stored.encryptedData).not.toContain(changed.originalText);
    expect(
      encryptionService.decrypt(
        stored.encryptedData,
        createMealEntryEncryptionContext(ownerId, entry.id),
      ),
    ).toEqual({ schemaVersion: 1, ...changed });
  });

  it('rejects editing or deleting another user’s meal', async () => {
    const entry = await createMeal(otherId, '2026-10-13');

    await ownerAgent.patch(`/meals/${entry.id}`).send(originalMeal).expect(404);

    await ownerAgent.delete(`/meals/${entry.id}`).expect(404);

    expect(
      await mealsRepository.findOneBy({
        id: entry.id,
        userId: otherId,
      }),
    ).not.toBeNull();
  });

  it('removes a meal from future lists', async () => {
    const date = '2026-10-14';
    const entry = await createMeal(ownerId, date);

    await ownerAgent.delete(`/meals/${entry.id}`).expect(204);
    await ownerAgent.get(`/meals/${entry.id}`).expect(404);

    const response = await ownerAgent.get(`/meals?date=${date}`).expect(200);

    expect((response.body as ListMealsResponse).meals).toEqual([]);
    expect(await mealsRepository.findOneBy({ id: entry.id })).toBeNull();

    // Repeating DELETE cannot remove any additional record.
    await ownerAgent.delete(`/meals/${entry.id}`).expect(404);
  });
  it('returns zero totals for an empty day and validates the date', async () => {
    await request(app.getHttpServer())
      .get('/meals/totals?date=2026-11-01')
      .expect(401);

    const response = await ownerAgent
      .get('/meals/totals?date=2026-11-01')
      .expect(200);

    expect(response.body as DailyNutritionTotalsResponse).toEqual({
      localDate: '2026-11-01',
      mealCount: 0,
      caloriesKcal: 0,
      proteinGrams: 0,
      fatGrams: 0,
      carbohydratesGrams: 0,
    });

    await ownerAgent.get('/meals/totals').expect(400);
    await ownerAgent.get('/meals/totals?date=2026-02-30').expect(400);
  });

  it('sums only owned confirmed meals for the stored local date', async () => {
    const date = '2026-11-02';

    await createMeal(ownerId, date, {
      ...originalMeal,
      nutrition: {
        caloriesKcal: 420,
        proteinGrams: 12.26,
        fatGrams: 8.11,
        carbohydratesGrams: 70.25,
      },
    });

    const aiMealId = randomUUID();
    const aiMeal = {
      source: 'ai' as const,
      mealType: 'snack' as const,
      originalText: 'Yogurt',
      foods: [
        {
          name: 'Yogurt',
          quantity: 1,
          unit: 'portion' as const,
          caloriesKcal: 250,
          proteinGrams: 10.14,
          fatGrams: 6.16,
          carbohydratesGrams: 30.16,
          confidence: 1,
          isEstimate: true as const,
        },
      ],
      totals: {
        caloriesKcal: 250,
        proteinGrams: 10.14,
        fatGrams: 6.16,
        carbohydratesGrams: 30.16,
      },
    };

    await mealsRepository.save(
      mealsRepository.create({
        id: aiMealId,
        userId: ownerId,
        encryptedData: encryptionService.encrypt(
          { schemaVersion: 1, ...aiMeal },
          createMealEntryEncryptionContext(ownerId, aiMealId),
        ),
        localDate: date,
        status: MealEntryStatus.Confirmed,
        source: MealEntrySource.Ai,
        schemaVersion: 1,
        confirmedAt: new Date(),
      }),
    );

    await createMeal(ownerId, null);
    await createMeal(ownerId, '2026-11-04');
    await createMeal(otherId, date);

    const response = await ownerAgent
      .get(`/meals/totals?date=${date}`)
      .expect(200);

    expect(response.body as DailyNutritionTotalsResponse).toEqual({
      localDate: date,
      mealCount: 2,
      caloriesKcal: 670,
      proteinGrams: 22.4,
      fatGrams: 14.3,
      carbohydratesGrams: 100.4,
    });

    const otherResponse = await otherAgent
      .get(`/meals/totals?date=${date}`)
      .expect(200);

    expect(otherResponse.body as DailyNutritionTotalsResponse).toMatchObject({
      localDate: date,
      mealCount: 1,
      caloriesKcal: 420,
    });
  });

  it('recalculates totals after editing and deleting meals', async () => {
    const date = '2026-11-03';
    const first = await createMeal(ownerId, date);
    const second = await createMeal(ownerId, date);

    const before = await ownerAgent
      .get(`/meals/totals?date=${date}`)
      .expect(200);

    expect(before.body as DailyNutritionTotalsResponse).toMatchObject({
      mealCount: 2,
      caloriesKcal: 840,
    });

    await ownerAgent
      .patch(`/meals/${first.id}`)
      .send({
        ...originalMeal,
        nutrition: {
          ...originalMeal.nutrition,
          caloriesKcal: 300,
        },
      })
      .expect(200);

    const afterEdit = await ownerAgent
      .get(`/meals/totals?date=${date}`)
      .expect(200);

    expect(afterEdit.body as DailyNutritionTotalsResponse).toMatchObject({
      mealCount: 2,
      caloriesKcal: 720,
    });

    await ownerAgent.delete(`/meals/${second.id}`).expect(204);

    const afterDelete = await ownerAgent
      .get(`/meals/totals?date=${date}`)
      .expect(200);

    expect(afterDelete.body as DailyNutritionTotalsResponse).toMatchObject({
      mealCount: 1,
      caloriesKcal: 300,
    });
  });
});

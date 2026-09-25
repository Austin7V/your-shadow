import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  MealEntry,
  MealEntrySource,
  MealEntryStatus,
} from '../src/meals/entities/meal-entry.entity';
import { createMealEntryEncryptionContext } from '../src/meals/security/meal-entry-encryption-context';
import { DataEncryptionService } from '../src/security/services/data-encryption.service';
import { User } from '../src/users/entities/user.entity';

interface MealEntryProtectedData {
  originalText: string;
  foods: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}

describe('MealEntry persistence (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let mealEntriesRepository: Repository<MealEntry>;
  let dataEncryptionService: DataEncryptionService;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    usersRepository = dataSource.getRepository(User);
    mealEntriesRepository = dataSource.getRepository(MealEntry);
    dataEncryptionService = app.get(DataEncryptionService);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await usersRepository.delete(createdUserIds);
    }

    await app.close();
  });

  async function createUser(label: string): Promise<User> {
    const uniqueValue = randomUUID();

    const user = await usersRepository.save(
      usersRepository.create({
        email: `${label}-${uniqueValue}@example.com`,
        passwordHash: 'not-used-in-this-test',
      }),
    );

    createdUserIds.push(user.id);

    return user;
  }

  function encryptMealEntryData(
    userId: string,
    mealEntryId: string,
    protectedData: MealEntryProtectedData,
  ): string {
    return dataEncryptionService.encrypt(
      protectedData,
      createMealEntryEncryptionContext(userId, mealEntryId),
    );
  }

  it('persists an encrypted draft without confirmation fields', async () => {
    const user = await createUser('meal-draft');
    const mealEntryId = randomUUID();
    const protectedData: MealEntryProtectedData = {
      originalText: 'Two eggs and rye toast',
      foods: [
        {
          name: 'Egg',
          amount: 2,
          unit: 'pieces',
        },
        {
          name: 'Rye toast',
          amount: 1,
          unit: 'slice',
        },
      ],
    };

    const savedEntry = await mealEntriesRepository.save(
      mealEntriesRepository.create({
        id: mealEntryId,
        userId: user.id,
        encryptedData: encryptMealEntryData(
          user.id,
          mealEntryId,
          protectedData,
        ),
        localDate: null,
        status: MealEntryStatus.Draft,
        source: MealEntrySource.Ai,
        schemaVersion: 1,
        confirmedAt: null,
      }),
    );

    const storedEntry = await mealEntriesRepository.findOneByOrFail({
      id: savedEntry.id,
      userId: user.id,
    });

    expect(storedEntry.status).toBe(MealEntryStatus.Draft);
    expect(storedEntry.localDate).toBeNull();
    expect(storedEntry.confirmedAt).toBeNull();
    expect(storedEntry.encryptedData).not.toContain(protectedData.originalText);
    expect(storedEntry.encryptedData).not.toContain('Egg');
    expect(
      dataEncryptionService.decrypt<MealEntryProtectedData>(
        storedEntry.encryptedData,
        createMealEntryEncryptionContext(user.id, storedEntry.id),
      ),
    ).toEqual(protectedData);
  });

  it('persists an encrypted confirmed meal with local date', async () => {
    const user = await createUser('confirmed-meal');
    const mealEntryId = randomUUID();
    const confirmedAt = new Date();
    const protectedData: MealEntryProtectedData = {
      originalText: 'Grilled chicken with rice',
      foods: [
        {
          name: 'Grilled chicken',
          amount: 180,
          unit: 'grams',
        },
        {
          name: 'Rice',
          amount: 150,
          unit: 'grams',
        },
      ],
    };

    const savedEntry = await mealEntriesRepository.save(
      mealEntriesRepository.create({
        id: mealEntryId,
        userId: user.id,
        encryptedData: encryptMealEntryData(
          user.id,
          mealEntryId,
          protectedData,
        ),
        localDate: '2026-09-13',
        status: MealEntryStatus.Confirmed,
        source: MealEntrySource.Manual,
        schemaVersion: 1,
        confirmedAt,
      }),
    );

    const storedEntry = await mealEntriesRepository.findOneByOrFail({
      id: savedEntry.id,
      userId: user.id,
    });

    expect(storedEntry.status).toBe(MealEntryStatus.Confirmed);
    expect(storedEntry.localDate).toBe('2026-09-13');
    expect(storedEntry.confirmedAt).toEqual(confirmedAt);
    expect(storedEntry.encryptedData).not.toContain(protectedData.originalText);
    expect(
      dataEncryptionService.decrypt<MealEntryProtectedData>(
        storedEntry.encryptedData,
        createMealEntryEncryptionContext(user.id, storedEntry.id),
      ),
    ).toEqual(protectedData);
  });

  it('rejects a confirmed meal without confirmation fields', async () => {
    const user = await createUser('invalid-confirmed-meal');
    const mealEntryId = randomUUID();
    const protectedData: MealEntryProtectedData = {
      originalText: 'Invalid confirmed meal',
      foods: [],
    };

    await expect(
      mealEntriesRepository.save(
        mealEntriesRepository.create({
          id: mealEntryId,
          userId: user.id,
          encryptedData: encryptMealEntryData(
            user.id,
            mealEntryId,
            protectedData,
          ),
          localDate: null,
          status: MealEntryStatus.Confirmed,
          source: MealEntrySource.Manual,
          schemaVersion: 1,
          confirmedAt: null,
        }),
      ),
    ).rejects.toBeInstanceOf(QueryFailedError);
  });

  it('rejects a non-positive schema version', async () => {
    const user = await createUser('invalid-schema-version');
    const mealEntryId = randomUUID();
    const protectedData: MealEntryProtectedData = {
      originalText: 'Invalid schema version',
      foods: [],
    };

    await expect(
      mealEntriesRepository.save(
        mealEntriesRepository.create({
          id: mealEntryId,
          userId: user.id,
          encryptedData: encryptMealEntryData(
            user.id,
            mealEntryId,
            protectedData,
          ),
          localDate: null,
          status: MealEntryStatus.Draft,
          source: MealEntrySource.Ai,
          schemaVersion: 0,
          confirmedAt: null,
        }),
      ),
    ).rejects.toBeInstanceOf(QueryFailedError);
  });

  it('deletes meal entries when their user is deleted', async () => {
    const user = await createUser('cascade-delete-meal');
    const mealEntryId = randomUUID();
    const protectedData: MealEntryProtectedData = {
      originalText: 'Meal removed with user',
      foods: [],
    };

    await mealEntriesRepository.save(
      mealEntriesRepository.create({
        id: mealEntryId,
        userId: user.id,
        encryptedData: encryptMealEntryData(
          user.id,
          mealEntryId,
          protectedData,
        ),
        localDate: null,
        status: MealEntryStatus.Draft,
        source: MealEntrySource.Ai,
        schemaVersion: 1,
        confirmedAt: null,
      }),
    );

    await usersRepository.delete(user.id);

    expect(
      await mealEntriesRepository.findOneBy({
        id: mealEntryId,
      }),
    ).toBeNull();
  });
});

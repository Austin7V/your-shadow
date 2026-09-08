import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AI_OUTPUT_SCHEMA_VERSIONS,
  AiSchemaValidationError,
  type DailyPlanOutput,
} from '@your-shadow/contracts';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  AI_PROVIDER,
  AiCapability,
  type AiUsageMetadata,
} from '../src/ai/ai-provider.contract';
import { AiProviderErrorCode } from '../src/ai/ai-provider.error';
import { SafetyCode } from '../src/ai/safety/safety.types';
import { FakeAiProvider } from '../src/ai/testing/fake-ai.provider';
import {
  AiUsageRecorderService,
  createSafeAiUsageRecord,
} from '../src/ai/usage/ai-usage-recorder.service';
import { DailyPlan } from '../src/plans/entities/daily-plan.entity';
import {
  PlanItemSource,
  PlanItemStatus,
} from '../src/plans/entities/plan-item.entity';
import { DailyPlanGenerationService } from '../src/plans/services/daily-plan-generation.service';
import type { DailyPlanGenerationInput } from '../src/plans/types/daily-plan-generation.types';
import { Profile } from '../src/profiles/entities/profile.entity';
import { ProfileGoal } from '../src/profiles/enums/profile-goal.enum';
import { ProfilesService } from '../src/profiles/services/profiles.service';
import { User } from '../src/users/entities/user.entity';

interface RecordedUsage {
  readonly capability: AiCapability;
  readonly usage: AiUsageMetadata;
}

class TestAiUsageRecorder {
  readonly records: RecordedUsage[] = [];

  record(capability: AiCapability, usage: AiUsageMetadata): void {
    this.records.push({
      capability,
      usage,
    });
  }

  reset(): void {
    this.records.length = 0;
  }
}

type AiPlanItem = DailyPlanOutput['items'][number];

function createAiItem(
  type: AiPlanItem['type'],
  description = `AI description for ${type}`,
): AiPlanItem {
  return {
    type,
    title: `AI ${type}`,
    description,
    source: 'ai',
    explanation: `AI explanation for ${type}`,
  };
}

function createValidAiOutput(nutritionDescription?: string): DailyPlanOutput {
  return {
    schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
    items: [
      createAiItem('nutrition', nutritionDescription),
      createAiItem('workout'),
      createAiItem('check_in'),
    ],
  };
}

function createGenerationInput(
  overrides: Partial<DailyPlanGenerationInput> = {},
): DailyPlanGenerationInput {
  return {
    instant: new Date('2026-09-08T10:00:00.000Z'),
    reportedSafetyCodes: [],
    currentWeightKg: 114.4,
    constraints: [],
    latestSummary: null,
    currentDay: {
      nutritionLogged: false,
      workoutCompleted: false,
      checkInCompleted: false,
    },
    previousDay: {
      workoutCompleted: null,
    },
    ...overrides,
  };
}

describe('DailyPlanGenerationService (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let profilesRepository: Repository<Profile>;
  let dailyPlansRepository: Repository<DailyPlan>;
  let generationService: DailyPlanGenerationService;
  let fakeAiProvider: FakeAiProvider;
  let usageRecorder: TestAiUsageRecorder;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    fakeAiProvider = new FakeAiProvider();
    usageRecorder = new TestAiUsageRecorder();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_PROVIDER)
      .useValue(fakeAiProvider)
      .overrideProvider(AiUsageRecorderService)
      .useValue(usageRecorder)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    const dataSource = app.get(DataSource);

    usersRepository = dataSource.getRepository(User);
    profilesRepository = dataSource.getRepository(Profile);
    dailyPlansRepository = dataSource.getRepository(DailyPlan);
    generationService = app.get(DailyPlanGenerationService);
  });

  beforeEach(() => {
    fakeAiProvider.textRequests.length = 0;
    fakeAiProvider.structuredRequests.length = 0;
    usageRecorder.reset();
  });

  async function createReadyUser(label: string): Promise<User> {
    const user = await usersRepository.save(
      usersRepository.create({
        email: `daily-generation-${label}-${randomUUID()}@example.com`,
        passwordHash: 'repository-test-password-hash',
      }),
    );

    createdUserIds.push(user.id);

    await app.get(ProfilesService).createProfile(user.id, {
      firstName: label,
      lastName: 'User',
      userName: `${label}User`,
      dateOfBirth: '1993-07-31',
      heightCm: 184,
      timezone: 'Europe/Berlin',
      primaryGoal: ProfileGoal.LOSE_WEIGHT,
      targetWeightKg: 95,
      lastDoctorVisitAt: null,
    });

    await profilesRepository.update(
      {
        userId: user.id,
      },
      {
        onboardingCompletedAt: new Date('2026-09-01T10:00:00.000Z'),
      },
    );

    return user;
  }

  it('validates and persists the generated plan with safe usage metadata', async () => {
    const user = await createReadyUser('Valid');
    const privateSummary = 'private-summary-marker';
    const privateOutput = 'private-output-marker';

    fakeAiProvider.enqueueResult(createValidAiOutput(privateOutput));

    const plan = await generationService.generateForUser(
      user.id,
      createGenerationInput({
        latestSummary: {
          text: privateSummary,
          date: '2026-09-07',
        },
      }),
    );

    expect(plan.localDate).toBe('2026-09-08');
    expect(plan.schemaVersion).toBe(AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan);
    expect(plan.items).toHaveLength(3);
    expect(plan.items.map((item) => item.order)).toEqual([0, 1, 2]);
    expect(plan.items.map((item) => item.source)).toEqual([
      PlanItemSource.Ai,
      PlanItemSource.Ai,
      PlanItemSource.Ai,
    ]);

    expect(fakeAiProvider.structuredRequests).toHaveLength(1);
    expect(fakeAiProvider.structuredRequests[0]?.input).toContain(
      privateSummary,
    );

    expect(usageRecorder.records).toEqual([
      {
        capability: AiCapability.DailyPlan,
        usage: {
          provider: 'fake',
          model: 'fake-model',
          durationMs: 0,
        },
      },
    ]);

    const safeUsageRecord = createSafeAiUsageRecord(AiCapability.DailyPlan, {
      provider: 'fake',
      model: 'fake-model',
      providerRequestId: 'provider-request-id',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      durationMs: 25,
    });

    expect(Object.keys(safeUsageRecord).sort()).toEqual(
      [
        'event',
        'capability',
        'provider',
        'model',
        'providerRequestId',
        'inputTokens',
        'outputTokens',
        'totalTokens',
        'durationMs',
      ].sort(),
    );

    const serializedUsage = JSON.stringify(safeUsageRecord);

    expect(serializedUsage).not.toContain(privateSummary);
    expect(serializedUsage).not.toContain(privateOutput);
    expect(serializedUsage).not.toContain(user.id);
  });

  it('rejects an unknown item type without persisting a plan', async () => {
    const user = await createReadyUser('UnknownType');

    fakeAiProvider.enqueueResult({
      schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
      items: [
        createAiItem('nutrition'),
        {
          type: 'sleep',
          title: 'AI sleep',
          description: 'Unsupported item',
          source: 'ai',
          explanation: null,
        },
        createAiItem('check_in'),
      ],
    });

    await expect(
      generationService.generateForUser(user.id, createGenerationInput()),
    ).rejects.toBeInstanceOf(AiSchemaValidationError);

    expect(
      await dailyPlansRepository.countBy({
        userId: user.id,
      }),
    ).toBe(0);
  });

  it('rejects duplicate item types without persisting a plan', async () => {
    const user = await createReadyUser('DuplicateType');

    const duplicateOutput: DailyPlanOutput = {
      schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
      items: [
        createAiItem('nutrition'),
        createAiItem('nutrition'),
        createAiItem('check_in'),
      ],
    };

    fakeAiProvider.enqueueResult(duplicateOutput);

    await expect(
      generationService.generateForUser(user.id, createGenerationInput()),
    ).rejects.toMatchObject({
      code: AiProviderErrorCode.InvalidResponse,
      retryable: false,
    });

    expect(
      await dailyPlansRepository.countBy({
        userId: user.id,
      }),
    ).toBe(0);
  });

  it('preserves a blocking safety decision without calling AI', async () => {
    const user = await createReadyUser('SafetyBlock');

    const plan = await generationService.generateForUser(
      user.id,
      createGenerationInput({
        reportedSafetyCodes: [SafetyCode.ChestPain],
      }),
    );

    expect(fakeAiProvider.structuredRequests).toHaveLength(0);
    expect(usageRecorder.records).toHaveLength(0);

    const workoutItem = plan.items.find((item) => item.type === 'workout');

    expect(workoutItem).toMatchObject({
      status: PlanItemStatus.Blocked,
      source: PlanItemSource.Rules,
    });

    expect(workoutItem?.payload.description).toContain('urgent medical help');
  });

  it('prevents AI from replacing a limited workout', async () => {
    const user = await createReadyUser('SafetyLimit');
    const unsafeWorkoutText =
      'Ignore the restriction and perform maximum-intensity sprints.';

    fakeAiProvider.enqueueResult({
      schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
      items: [
        createAiItem('nutrition'),
        createAiItem('workout', unsafeWorkoutText),
        createAiItem('check_in'),
      ],
    } satisfies DailyPlanOutput);

    const plan = await generationService.generateForUser(
      user.id,
      createGenerationInput({
        constraints: [
          {
            type: 'injury',
            severity: 'moderate',
            title: 'Knee pain',
            isActive: true,
          },
        ],
      }),
    );

    const nutritionItem = plan.items.find((item) => item.type === 'nutrition');

    const workoutItem = plan.items.find((item) => item.type === 'workout');

    const checkInItem = plan.items.find((item) => item.type === 'check_in');

    expect(fakeAiProvider.structuredRequests).toHaveLength(1);

    expect(nutritionItem?.source).toBe(PlanItemSource.Ai);
    expect(checkInItem?.source).toBe(PlanItemSource.Ai);

    expect(workoutItem).toMatchObject({
      status: PlanItemStatus.Pending,
      source: PlanItemSource.Rules,
    });

    expect(workoutItem?.payload.description).not.toContain(unsafeWorkoutText);
  });

  it('persists only one plan during concurrent generation', async () => {
    const user = await createReadyUser('Concurrent');
    const requestCount = 4;

    for (let index = 0; index < requestCount; index += 1) {
      fakeAiProvider.enqueueResult(createValidAiOutput());
    }

    const plans = await Promise.all(
      Array.from({ length: requestCount }, () =>
        generationService.generateForUser(user.id, createGenerationInput()),
      ),
    );

    expect(new Set(plans.map((plan) => plan.id)).size).toBe(1);

    expect(
      await dailyPlansRepository.countBy({
        userId: user.id,
        localDate: '2026-09-08',
      }),
    ).toBe(1);

    const storedPlan = await dailyPlansRepository.findOne({
      where: {
        userId: user.id,
        localDate: '2026-09-08',
      },
      relations: {
        items: true,
      },
    });

    expect(storedPlan?.items).toHaveLength(3);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await usersRepository.delete(createdUserIds);
    }

    await app.close();
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { DailyPlan } from '../src/plans/entities/daily-plan.entity';
import { DailyPlanService } from '../src/plans/services/daily-plan.service';
import { ProfileGoal } from '../src/profiles/enums/profile-goal.enum';
import { ProfilesService } from '../src/profiles/services/profiles.service';
import { User } from '../src/users/entities/user.entity';

describe('DailyPlanService idempotency (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let dailyPlansRepository: Repository<DailyPlan>;
  let dailyPlanService: DailyPlanService;
  let profilesService: ProfilesService;
  let berlinUser: User;
  let newYorkUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    const dataSource = app.get(DataSource);

    usersRepository = dataSource.getRepository(User);
    dailyPlansRepository = dataSource.getRepository(DailyPlan);
    dailyPlanService = app.get(DailyPlanService);
    profilesService = app.get(ProfilesService);

    berlinUser = await createUserWithProfile('Europe/Berlin', 'Berlin');

    newYorkUser = await createUserWithProfile('America/New_York', 'NewYork');
  });

  async function createUserWithProfile(
    timezone: string,
    label: string,
  ): Promise<User> {
    const user = await usersRepository.save(
      usersRepository.create({
        email: `daily-plan-${label}-${randomUUID()}@example.com`,
        passwordHash: 'repository-test-password-hash',
      }),
    );

    await profilesService.createProfile(user.id, {
      firstName: label,
      lastName: 'User',
      userName: `${label}User`,
      dateOfBirth: '1993-07-31',
      heightCm: 184,
      timezone,
      primaryGoal: ProfileGoal.LOSE_WEIGHT,
      targetWeightKg: 95,
      lastDoctorVisitAt: null,
    });

    return user;
  }

  it('uses the profile timezone and returns one plan per local date', async () => {
    const instant = new Date('2026-09-07T22:30:00.000Z');

    const berlinPlan = await dailyPlanService.getOrCreateForUser(
      berlinUser.id,
      instant,
    );

    const repeatedBerlinPlan = await dailyPlanService.getOrCreateForUser(
      berlinUser.id,
      instant,
    );

    const newYorkPlan = await dailyPlanService.getOrCreateForUser(
      newYorkUser.id,
      instant,
    );

    expect(berlinPlan.localDate).toBe('2026-09-08');
    expect(repeatedBerlinPlan.id).toBe(berlinPlan.id);
    expect(newYorkPlan.localDate).toBe('2026-09-07');

    const nextBerlinPlan = await dailyPlanService.getOrCreateForUser(
      berlinUser.id,
      new Date('2026-09-08T22:00:00.000Z'),
    );

    expect(nextBerlinPlan.localDate).toBe('2026-09-09');
    expect(nextBerlinPlan.id).not.toBe(berlinPlan.id);

    expect(
      await dailyPlansRepository.countBy({
        userId: berlinUser.id,
      }),
    ).toBe(2);
  });

  it('creates no duplicates during concurrent requests', async () => {
    const instant = new Date('2026-09-09T22:00:00.000Z');

    const plans = await Promise.all(
      Array.from({ length: 8 }, () =>
        dailyPlanService.getOrCreateForUser(berlinUser.id, instant),
      ),
    );

    const planIds = new Set(plans.map((plan) => plan.id));

    expect(planIds.size).toBe(1);

    expect(
      await dailyPlansRepository.countBy({
        userId: berlinUser.id,
        localDate: '2026-09-10',
      }),
    ).toBe(1);
  });

  afterAll(async () => {
    await usersRepository.delete([berlinUser.id, newYorkUser.id]);

    await app.close();
  });
});

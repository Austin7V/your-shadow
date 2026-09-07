import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  DailyPlan,
  DailyPlanStatus,
} from '../src/plans/entities/daily-plan.entity';
import {
  PlanItem,
  PlanItemSource,
  PlanItemStatus,
} from '../src/plans/entities/plan-item.entity';
import { User } from '../src/users/entities/user.entity';

describe('Daily plan repositories (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let plansRepository: Repository<DailyPlan>;
  let itemsRepository: Repository<PlanItem>;
  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([DailyPlan, PlanItem])],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    dataSource = app.get(DataSource);
    usersRepository = dataSource.getRepository(User);
    plansRepository = dataSource.getRepository(DailyPlan);
    itemsRepository = dataSource.getRepository(PlanItem);

    user = await usersRepository.save(
      usersRepository.create({
        email: `daily-plan-${randomUUID()}@example.com`,
        passwordHash: 'repository-test-password-hash',
      }),
    );
  });

  it('stores a plan with items and enforces database constraints', async () => {
    const plan = plansRepository.create({
      userId: user.id,
      localDate: '2026-09-07',
      summary: 'A balanced plan for the day.',
      items: [
        itemsRepository.create({
          type: 'nutrition',
          order: 0,
          source: PlanItemSource.Ai,
          payload: {
            title: 'Prepare breakfast',
            description: 'Prepare a balanced breakfast with available food.',
            explanation: 'Supports the daily nutrition goal.',
          },
        }),
        itemsRepository.create({
          type: 'workout',
          order: 1,
          source: PlanItemSource.Rules,
          payload: {
            title: 'Take a short walk',
            description: 'Walk at a comfortable pace for twenty minutes.',
            explanation: null,
          },
        }),
      ],
    });

    const savedPlan = await plansRepository.save(plan);

    const storedPlan = await plansRepository.findOneByOrFail({
      id: savedPlan.id,
    });

    const storedItems = await itemsRepository.find({
      where: {
        planId: savedPlan.id,
      },
      order: {
        order: 'ASC',
      },
    });

    expect(storedPlan).toMatchObject({
      userId: user.id,
      localDate: '2026-09-07',
      status: DailyPlanStatus.Active,
      schemaVersion: 1,
      summary: 'A balanced plan for the day.',
    });

    expect(storedItems).toHaveLength(2);

    expect(storedItems[0]).toMatchObject({
      type: 'nutrition',
      status: PlanItemStatus.Pending,
      order: 0,
      source: PlanItemSource.Ai,
      payload: {
        title: 'Prepare breakfast',
        description: 'Prepare a balanced breakfast with available food.',
        explanation: 'Supports the daily nutrition goal.',
      },
    });

    expect(storedItems[1]).toMatchObject({
      type: 'workout',
      status: PlanItemStatus.Pending,
      order: 1,
      source: PlanItemSource.Rules,
      payload: {
        title: 'Take a short walk',
        description: 'Walk at a comfortable pace for twenty minutes.',
        explanation: null,
      },
    });

    const duplicatePlan = plansRepository.create({
      userId: user.id,
      localDate: '2026-09-07',
      summary: null,
    });

    await expect(plansRepository.save(duplicatePlan)).rejects.toBeInstanceOf(
      QueryFailedError,
    );

    const duplicateOrderItem = itemsRepository.create({
      planId: savedPlan.id,
      type: 'check_in',
      order: 0,
      source: PlanItemSource.Fallback,
      payload: {
        title: 'Evening check-in',
        description: 'Review how the day went.',
        explanation: null,
      },
    });

    await expect(
      itemsRepository.save(duplicateOrderItem),
    ).rejects.toBeInstanceOf(QueryFailedError);

    await plansRepository.delete(savedPlan.id);

    expect(
      await itemsRepository.countBy({
        planId: savedPlan.id,
      }),
    ).toBe(0);
  });

  afterAll(async () => {
    if (user) {
      await usersRepository.delete(user.id);
    }

    await app.close();
  });
});

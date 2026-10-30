import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { Exercise } from '../src/workouts/entities/exercise.entity';
import { SeedBeginnerExercises1791000000001 } from '../src/database/migrations/1791000000001-seed-beginner-exercises';

describe('Exercise seed idempotency (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not add rows when the seed runs again', async () => {
    const exercisesRepository = dataSource.getRepository(Exercise);
    const countBefore = await exercisesRepository.count();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await new SeedBeginnerExercises1791000000001().up(queryRunner);
    } finally {
      await queryRunner.release();
    }

    const countAfter = await exercisesRepository.count();

    expect(countAfter).toBe(countBefore);
  });
});

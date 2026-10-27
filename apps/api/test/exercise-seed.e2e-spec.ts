import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import {
  Exercise,
  ExerciseLevel,
} from '../src/workouts/entities/exercise.entity';

describe('Exercise seed (e2e)', () => {
  let dataSource: DataSource;
  let exercisesRepository: Repository<Exercise>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    exercisesRepository = dataSource.getRepository(Exercise);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('seed data validation', () => {
    it('creates exactly 15 exercises', async () => {
      const exercises = await exercisesRepository.find();
      expect(exercises).toHaveLength(15);
    });

    it('all exercises have required fields', async () => {
      const exercises = await exercisesRepository.find();

      exercises.forEach((exercise) => {
        expect(exercise.id).toBeDefined();
        expect(exercise.name).toBeDefined();
        expect(exercise.name.length).toBeGreaterThan(0);
        expect(exercise.instructions).toBeDefined();
        expect(exercise.instructions.length).toBeGreaterThan(0);
        expect(exercise.level).toBeDefined();
        expect(
          [
            ExerciseLevel.Gentle,
            ExerciseLevel.Light,
            ExerciseLevel.Standard,
          ].includes(exercise.level),
        ).toBe(true);
        expect(exercise.targetAreas).toBeDefined();
        expect(Array.isArray(exercise.targetAreas)).toBe(true);
        expect(exercise.targetAreas.length).toBeGreaterThan(0);
        expect(exercise.workload).toBeDefined();
        expect(typeof exercise.workload).toBe('object');
        expect(exercise.isActive).toBe(true);
        expect(exercise.safetyMetadata).toBeDefined();
        expect(typeof exercise.safetyMetadata).toBe('object');
        expect(exercise.schemaVersion).toBe(1);
      });
    });

    it('all exercises are equipment-free', async () => {
      const exercises = await exercisesRepository.find();

      const equipmentKeywords = [
        'гантель',
        'штанга',
        'вес',
        'пояс',
        'тренажер',
        'блок',
        'машина',
        'cable',
        'machine',
        'weight',
        'dumbbell',
        'barbell',
      ];

      exercises.forEach((exercise) => {
        const lowerInstructions = exercise.instructions.toLowerCase();
        const lowerName = exercise.name.toLowerCase();

        equipmentKeywords.forEach((keyword) => {
          expect(lowerInstructions).not.toContain(keyword.toLowerCase());
          expect(lowerName).not.toContain(keyword.toLowerCase());
        });
      });
    });

    it('all exercises have Russian target areas', async () => {
      const exercises = await exercisesRepository.find();

      const validRussianAreas = [
        'грудь',
        'трицепсы',
        'плечи',
        'квадрицепсы',
        'ягодицы',
        'подколенные сухожилия',
        'кор',
        'спина',
        'баланс',
        'кардио',
        'сгибатели бёдер',
        'общая физическая подготовка',
      ];

      exercises.forEach((exercise) => {
        expect(Array.isArray(exercise.targetAreas)).toBe(true);
        exercise.targetAreas.forEach((area) => {
          expect(validRussianAreas).toContain(area);
        });
      });
    });

    it('exercises with reps have sets and rest', async () => {
      const exercises = await exercisesRepository.find();

      exercises.forEach((exercise) => {
        const workload = exercise.workload;
        if ('reps' in workload) {
          expect('sets' in workload).toBe(true);
          expect('rest' in workload).toBe(true);
          expect(typeof workload.reps).toBe('number');
          expect(typeof workload.sets).toBe('number');
          expect(typeof workload.rest).toBe('number');
          expect(workload.reps).toBeGreaterThan(0);
          expect(workload.sets).toBeGreaterThan(0);
          expect(workload.rest).toBeGreaterThan(0);
        }
      });
    });

    it('exercises with duration have valid times', async () => {
      const exercises = await exercisesRepository.find();

      exercises.forEach((exercise) => {
        const workload = exercise.workload;
        if ('duration' in workload) {
          expect(typeof workload.duration).toBe('number');
          expect(workload.duration).toBeGreaterThan(0);
          expect(workload.duration).toBeLessThanOrEqual(120);
        }
      });
    });

    it('includes variety of difficulty levels', async () => {
      const exercises = await exercisesRepository.find();

      const levels = exercises.map((e) => e.level);
      const hasGentle = levels.includes(ExerciseLevel.Gentle);
      const hasLight = levels.includes(ExerciseLevel.Light);
      const hasStandard = levels.includes(ExerciseLevel.Standard);

      expect(hasGentle && hasLight && hasStandard).toBe(true);
    });

    it('safety metadata includes constraint codes and notes', async () => {
      const exercises = await exercisesRepository.find();

      exercises.forEach((exercise) => {
        const metadata = exercise.safetyMetadata;
        expect(metadata).toHaveProperty('constraintCodes');
        expect(Array.isArray(metadata.constraintCodes)).toBe(true);
        if (metadata.allowedReplacements) {
          expect(Array.isArray(metadata.allowedReplacements)).toBe(true);
        }
        expect(metadata).toHaveProperty('notes');
        expect(typeof metadata.notes).toBe('string');
        expect(metadata.notes.length).toBeGreaterThan(0);
      });
    });

    it('seed is idempotent when run multiple times', async () => {
      const countBefore = await exercisesRepository.count();

      const queryRunner = dataSource.createQueryRunner();
      try {
        const migration = new (
          await import(
            '../src/database/migrations/1791000000001-seed-beginner-exercises'
          )
        ).SeedBeginnerExercises1791000000001();

        await migration.up(queryRunner);

        const countAfter = await exercisesRepository.count();
        expect(countAfter).toBe(countBefore);
      } finally {
        await queryRunner.release();
      }
    });

    it('all exercise IDs are unique', async () => {
      const exercises = await exercisesRepository.find();
      const ids = exercises.map((e) => e.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(exercises.length);
    });

    it('covers diverse muscle groups', async () => {
      const exercises = await exercisesRepository.find();
      const allAreas = exercises.flatMap((e) => e.targetAreas);

      expect(allAreas).toContain('грудь');
      expect(allAreas).toContain('спина');
      expect(allAreas).toContain('кор');
      expect(allAreas).toContain('ягодицы');
      expect(allAreas).toContain('квадрицепсы');
      expect(allAreas).toContain('кардио');
    });
  });
});

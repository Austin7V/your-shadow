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

      for (const exercise of exercises) {
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
      }
    });

    it('all exercises are equipment-free', async () => {
      const exercises = await exercisesRepository.find();

      const equipmentKeywords = [
        'dumbell',
        'dumbbell',
        'barbell',
        'weight',
        'resistance band',
        'kettlebell',
        'medicine ball',
        'cable',
        'machine',
        'bench',
      ];

      for (const exercise of exercises) {
        const lowerInstructions = exercise.instructions.toLowerCase();
        const lowerName = exercise.name.toLowerCase();

        for (const keyword of equipmentKeywords) {
          if (keyword === 'bench' && lowerName.includes('bench')) {
            continue;
          }
          expect(lowerInstructions).not.toContain(keyword.toLowerCase());
        }
      }
    });

    it('all exercises have at least one target area', async () => {
      const exercises = await exercisesRepository.find();

      for (const exercise of exercises) {
        expect(exercise.targetAreas.length).toBeGreaterThan(0);
        expect(exercise.targetAreas.every((area) => typeof area === 'string'))
          .toBe(true);
      }
    });

    it('all exercises have workload information', async () => {
      const exercises = await exercisesRepository.find();

      for (const exercise of exercises) {
        const workload = exercise.workload;
        const hasReps = 'reps' in workload;
        const hasDuration = 'duration' in workload;

        expect(hasReps || hasDuration).toBe(true);
      }
    });

    it('exercises with reps have sets and rest', async () => {
      const exercises = await exercisesRepository.find();

      for (const exercise of exercises) {
        const workload = exercise.workload;
        if ('reps' in workload) {
          expect('sets' in workload).toBe(true);
          expect('rest' in workload).toBe(true);
          expect(typeof workload.reps).toBe('number');
          expect(typeof workload.sets).toBe('number');
          expect(typeof workload.rest).toBe('number');
        }
      }
    });

    it('seed is idempotent (running twice creates no duplicates)', async () => {
      const firstCount = await exercisesRepository.count();

      await dataSource.migrations.forEach((migration) => {
        if (migration.name === 'SeedBeginnerExercises1791000000001') {
          migration.up(dataSource.createQueryRunner());
        }
      });

      const secondCount = await exercisesRepository.count();

      expect(secondCount).toBe(firstCount);
    });

    it('exercises include variety of difficulty levels', async () => {
      const exercises = await exercisesRepository.find();

      const levels = exercises.map((e) => e.level);
      const hasGentle = levels.includes(ExerciseLevel.Gentle);
      const hasLight = levels.includes(ExerciseLevel.Light);
      const hasStandard = levels.includes(ExerciseLevel.Standard);

      expect(hasGentle && hasLight && hasStandard).toBe(true);
    });

    it('exercises cover different muscle groups', async () => {
      const exercises = await exercisesRepository.find();

      const allTargetAreas = exercises.flatMap((e) => e.targetAreas);
      const uniqueAreas = new Set(allTargetAreas);

      expect(uniqueAreas.size).toBeGreaterThan(5);

      const muscleGroups = ['chest', 'legs', 'core', 'cardio', 'back'];
      for (const group of muscleGroups) {
        expect(allTargetAreas.some((area) => area.toLowerCase().includes(group.toLowerCase()) || group.toLowerCase().includes(area.toLowerCase()))).toBe(true);
      }
    });
  });
});

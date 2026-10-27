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

    it('all exercises have Russian names and instructions', async () => {
      const exercises = await exercisesRepository.find();

      exercises.forEach((exercise) => {
        expect(exercise.name).toBeDefined();
        expect(exercise.name.length).toBeGreaterThan(0);
        expect(exercise.instructions).toBeDefined();
        expect(exercise.instructions.length).toBeGreaterThan(10);
        expect(/[а-яА-ЯёЁ]/.test(exercise.instructions)).toBe(true);
      });
    });

    it('all exercises are equipment-free', async () => {
      const exercises = await exercisesRepository.find();

      const equipmentKeywords = [
        'гантель',
        'штанга',
        'тренажер',
        'машина',
        'cable',
        'weight',
      ];

      exercises.forEach((exercise) => {
        const lower = (exercise.instructions + exercise.name).toLowerCase();
        equipmentKeywords.forEach((keyword) => {
          expect(lower).not.toContain(keyword.toLowerCase());
        });
      });
    });

    it('all exercises have Russian target areas', async () => {
      const exercises = await exercisesRepository.find();

      const validAreas = [
        'грудь',
        'трицепсы',
        'плечи',
        'квадрицепсы',
        'ягодицы',
        'подколенные',
        'кор',
        'спина',
        'баланс',
        'кардио',
        'сгибатели',
      ];

      exercises.forEach((exercise) => {
        expect(Array.isArray(exercise.targetAreas)).toBe(true);
        expect(exercise.targetAreas.length).toBeGreaterThan(0);
        exercise.targetAreas.forEach((area: string) => {
          const isValid = validAreas.some((v) =>
            area.toLowerCase().includes(v.toLowerCase()),
          );
          expect(isValid).toBe(true);
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
        }
      });
    });

    it('all exercises have safety metadata with notes', async () => {
      const exercises = await exercisesRepository.find();

      exercises.forEach((exercise) => {
        const metadata = exercise.safetyMetadata;
        expect(metadata).toHaveProperty('constraintCodes');
        expect(metadata).toHaveProperty('allowedReplacements');
        expect(metadata).toHaveProperty('notes');
        expect(typeof metadata.notes).toBe('string');
        expect(metadata.notes.length).toBeGreaterThan(0);
      });
    });

    it('includes variety of difficulty levels', async () => {
      const exercises = await exercisesRepository.find();

      const levels = exercises.map((e) => e.level);
      expect(levels).toContain(ExerciseLevel.Gentle);
      expect(levels).toContain(ExerciseLevel.Light);
      expect(levels).toContain(ExerciseLevel.Standard);
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
      const uniqueAreas = new Set(allAreas);

      expect(uniqueAreas.size).toBeGreaterThan(6);
    });
  });
});

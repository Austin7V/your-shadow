import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import {
  Exercise,
  ExerciseLevel,
} from '../src/workouts/entities/exercise.entity';

describe('Exercise repository (e2e)', () => {
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

  describe('field persistence and defaults', () => {
    it('persists and retrieves exercise with all fields', async () => {
      const exercise = exercisesRepository.create({
        name: 'Push-ups',
        instructions: 'Place hands on ground...',
        level: ExerciseLevel.Light,
        targetAreas: ['chest', 'arms'],
        workload: { reps: 10, sets: 3 },
        isActive: true,
        safetyMetadata: { constraintCodes: ['no-lower-body'] },
        assetReference: 'pushups-demo.mp4',
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.name).toBe('Push-ups');
      expect(retrieved.instructions).toBe('Place hands on ground...');
      expect(retrieved.level).toBe(ExerciseLevel.Light);
      expect(retrieved.targetAreas).toEqual(['chest', 'arms']);
      expect(retrieved.workload).toEqual({ reps: 10, sets: 3 });
      expect(retrieved.isActive).toBe(true);
      expect(retrieved.safetyMetadata).toEqual({
        constraintCodes: ['no-lower-body'],
      });
      expect(retrieved.assetReference).toBe('pushups-demo.mp4');
      expect(retrieved.schemaVersion).toBe(1);
    });

    it('applies default value for is_active when not provided', async () => {
      const exercise = exercisesRepository.create({
        name: 'Squats',
        instructions: 'Bend knees...',
        level: ExerciseLevel.Standard,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.isActive).toBe(true);
    });

    it('applies default value for target_areas (empty array) when not provided', async () => {
      const exercise = exercisesRepository.create({
        name: 'Planks',
        instructions: 'Hold position...',
        level: ExerciseLevel.Gentle,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.targetAreas).toEqual([]);
      expect(Array.isArray(retrieved.targetAreas)).toBe(true);
    });

    it('applies default value for workload (empty object) when not provided', async () => {
      const exercise = exercisesRepository.create({
        name: 'Lunges',
        instructions: 'Step forward...',
        level: ExerciseLevel.Light,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.workload).toEqual({});
    });

    it('applies default value for safety_metadata (empty object) when not provided', async () => {
      const exercise = exercisesRepository.create({
        name: 'Calf raises',
        instructions: 'Raise on toes...',
        level: ExerciseLevel.Gentle,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.safetyMetadata).toEqual({});
    });

    it('applies default value for schema_version (1) when not provided', async () => {
      const exercise = exercisesRepository.create({
        name: 'Jumping jacks',
        instructions: 'Jump with arms up...',
        level: ExerciseLevel.Standard,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.schemaVersion).toBe(1);
    });

    it('allows null asset reference', async () => {
      const exercise = exercisesRepository.create({
        name: 'Stretching',
        instructions: 'Stretch muscles...',
        level: ExerciseLevel.Gentle,
        assetReference: null,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.assetReference).toBeNull();
    });
  });

  describe('database constraints', () => {
    it('enforces schema_version > 0 constraint', async () => {
      const exercise = exercisesRepository.create({
        name: 'Invalid schema',
        instructions: 'Invalid...',
        level: ExerciseLevel.Standard,
        schemaVersion: 0,
      });

      await expect(exercisesRepository.save(exercise)).rejects.toThrow();
    });

    it('enforces schema_version > 0 with negative value', async () => {
      const exercise = exercisesRepository.create({
        name: 'Negative schema',
        instructions: 'Invalid...',
        level: ExerciseLevel.Standard,
        schemaVersion: -1,
      });

      await expect(exercisesRepository.save(exercise)).rejects.toThrow();
    });

    it('allows schema_version 1 (default)', async () => {
      const exercise = exercisesRepository.create({
        name: 'Valid schema 1',
        instructions: 'Valid...',
        level: ExerciseLevel.Standard,
        schemaVersion: 1,
      });

      const saved = await exercisesRepository.save(exercise);

      expect(saved.schemaVersion).toBe(1);
    });

    it('allows higher schema_version values', async () => {
      const exercise = exercisesRepository.create({
        name: 'Valid schema 2',
        instructions: 'Valid...',
        level: ExerciseLevel.Standard,
        schemaVersion: 2,
      });

      const saved = await exercisesRepository.save(exercise);

      expect(saved.schemaVersion).toBe(2);
    });
  });

  describe('enum validation', () => {
    it('persists and retrieves gentle level', async () => {
      const exercise = exercisesRepository.create({
        name: 'Gentle exercise',
        instructions: 'Gentle...',
        level: ExerciseLevel.Gentle,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.level).toBe(ExerciseLevel.Gentle);
    });

    it('persists and retrieves light level', async () => {
      const exercise = exercisesRepository.create({
        name: 'Light exercise',
        instructions: 'Light...',
        level: ExerciseLevel.Light,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.level).toBe(ExerciseLevel.Light);
    });

    it('persists and retrieves standard level', async () => {
      const exercise = exercisesRepository.create({
        name: 'Standard exercise',
        instructions: 'Standard...',
        level: ExerciseLevel.Standard,
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.level).toBe(ExerciseLevel.Standard);
    });
  });

  describe('jsonb field flexibility', () => {
    it('stores and retrieves complex workload object', async () => {
      const exercise = exercisesRepository.create({
        name: 'Complex workload',
        instructions: 'Test...',
        level: ExerciseLevel.Standard,
        workload: {
          reps: 15,
          sets: 4,
          rest: 60,
          tempo: '3-1-2-1',
        },
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.workload).toEqual({
        reps: 15,
        sets: 4,
        rest: 60,
        tempo: '3-1-2-1',
      });
    });

    it('stores and retrieves complex safety metadata', async () => {
      const exercise = exercisesRepository.create({
        name: 'Complex safety',
        instructions: 'Test...',
        level: ExerciseLevel.Standard,
        safetyMetadata: {
          constraintCodes: ['no-knee-extension', 'no-back-bend'],
          allowedReplacements: [
            '550e8400-e29b-41d4-a716-446655440000',
            '660e8400-e29b-41d4-a716-446655440000',
          ],
          riskLevel: 'moderate',
        },
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.safetyMetadata).toEqual({
        constraintCodes: ['no-knee-extension', 'no-back-bend'],
        allowedReplacements: [
          '550e8400-e29b-41d4-a716-446655440000',
          '660e8400-e29b-41d4-a716-446655440000',
        ],
        riskLevel: 'moderate',
      });
    });

    it('stores and retrieves array target areas with various muscle groups', async () => {
      const exercise = exercisesRepository.create({
        name: 'Multi-area exercise',
        instructions: 'Test...',
        level: ExerciseLevel.Standard,
        targetAreas: [
          'chest',
          'shoulders',
          'triceps',
          'core',
        ],
      });

      const saved = await exercisesRepository.save(exercise);
      const retrieved = await exercisesRepository.findOneByOrFail({
        id: saved.id,
      });

      expect(retrieved.targetAreas).toEqual(['chest', 'shoulders', 'triceps', 'core']);
      expect(retrieved.targetAreas).toHaveLength(4);
    });
  });
});

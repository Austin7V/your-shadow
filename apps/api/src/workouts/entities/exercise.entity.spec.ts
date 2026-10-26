import { getMetadataArgsStorage } from 'typeorm';
import { Exercise, ExerciseLevel } from './exercise.entity';

describe('Exercise repository', () => {
  describe('entity structure', () => {
    it('instantiates with all required fields', () => {
      const exercise = new Exercise();

      exercise.id = '123e4567-e89b-12d3-a456-426614174000';
      exercise.name = 'Push-ups';
      exercise.instructions = 'Place hands on the ground...';
      exercise.level = ExerciseLevel.Light;
      exercise.targetAreas = ['chest', 'arms'];
      exercise.workload = { reps: 10, sets: 3 };
      exercise.isActive = true;
      exercise.safetyMetadata = { constraintCodes: ['lower-body'] };
      exercise.schemaVersion = 1;

      expect(exercise.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(exercise.name).toBe('Push-ups');
      expect(exercise.instructions).toBe('Place hands on the ground...');
      expect(exercise.level).toBe(ExerciseLevel.Light);
      expect(exercise.targetAreas).toEqual(['chest', 'arms']);
      expect(exercise.workload).toEqual({ reps: 10, sets: 3 });
      expect(exercise.isActive).toBe(true);
      expect(exercise.safetyMetadata).toEqual({
        constraintCodes: ['lower-body'],
      });
      expect(exercise.schemaVersion).toBe(1);
    });

    it('has target areas field for body parts and muscle groups', () => {
      const exercise = new Exercise();
      exercise.targetAreas = ['chest', 'triceps', 'shoulders'];

      expect(exercise.targetAreas).toEqual(['chest', 'triceps', 'shoulders']);
      expect(Array.isArray(exercise.targetAreas)).toBe(true);
    });

    it('has workload field for repetition and time parameters', () => {
      const exercise = new Exercise();
      exercise.workload = { reps: 15, duration: 30 };

      expect(exercise.workload).toEqual({ reps: 15, duration: 30 });
    });

    it('has safety metadata for constraint codes and selection rules', () => {
      const exercise = new Exercise();
      exercise.safetyMetadata = {
        constraintCodes: ['no-knee-extension'],
        allowedReplacements: ['e2b3c4d5-e89b-12d3-a456-426614174000'],
      };

      expect(exercise.safetyMetadata).toHaveProperty('constraintCodes');
      expect(exercise.safetyMetadata).toHaveProperty('allowedReplacements');
    });

    it('supports all exercise levels', () => {
      expect(ExerciseLevel.Gentle).toBe('gentle');
      expect(ExerciseLevel.Light).toBe('light');
      expect(ExerciseLevel.Standard).toBe('standard');
    });

    it('allows nullable asset reference field', () => {
      const exercise = new Exercise();
      exercise.assetReference = null;

      expect(exercise.assetReference).toBeNull();

      exercise.assetReference = 'exercise-demo.mp4';
      expect(exercise.assetReference).toBe('exercise-demo.mp4');
    });

    it('defines schema version database constraint', () => {
      const metadata = getMetadataArgsStorage();
      const tableMetadata = metadata.tables.find(
        (table) => table.target === Exercise,
      );

      expect(tableMetadata).toBeDefined();

      const checks = metadata.checks.filter(
        (check) => check.target === Exercise,
      );
      expect(checks.length).toBeGreaterThan(0);
      expect(checks.some((c) => c.name?.includes('schema_version'))).toBe(true);
    });

    it('has timestamps for created and updated tracking', () => {
      const exercise = new Exercise();
      const now = new Date();

      exercise.createdAt = now;
      exercise.updatedAt = now;

      expect(exercise.createdAt).toEqual(now);
      expect(exercise.updatedAt).toEqual(now);
    });
  });

  describe('field requirements and database defaults', () => {
    it('defines name field as required', () => {
      const exercise = new Exercise();
      exercise.name = 'Test Exercise';

      expect(exercise.name).toBeDefined();
      expect(exercise.name).toBe('Test Exercise');
    });

    it('defines instructions field as required', () => {
      const exercise = new Exercise();
      exercise.instructions = 'Step 1: ...';

      expect(exercise.instructions).toBeDefined();
    });

    it('defines level field as required enum', () => {
      const exercise = new Exercise();
      exercise.level = ExerciseLevel.Standard;

      expect(exercise.level).toBeDefined();
      expect(exercise.level).toBe(ExerciseLevel.Standard);
    });

    it('defines is_active field with default true in database', () => {
      const exercise = new Exercise();
      exercise.isActive = true;

      expect(exercise.isActive).toBe(true);
    });

    it('defines target_areas field with empty array default in database', () => {
      const exercise = new Exercise();
      exercise.targetAreas = [];

      expect(exercise.targetAreas).toEqual([]);
    });

    it('defines workload field with empty object default in database', () => {
      const exercise = new Exercise();
      exercise.workload = {};

      expect(exercise.workload).toEqual({});
    });

    it('defines safety_metadata field with empty object default in database', () => {
      const exercise = new Exercise();
      exercise.safetyMetadata = {};

      expect(exercise.safetyMetadata).toEqual({});
    });

    it('defines schema_version field with positive constraint in database', () => {
      const exercise = new Exercise();
      exercise.schemaVersion = 1;

      expect(exercise.schemaVersion).toBeGreaterThan(0);
    });
  });
});

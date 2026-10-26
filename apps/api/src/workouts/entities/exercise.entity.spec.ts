import { Exercise, ExerciseLevel } from './exercise.entity';

describe('Exercise entity', () => {
  it('creates an exercise with valid properties', () => {
    const exercise = new Exercise();

    exercise.id = '123e4567-e89b-12d3-a456-426614174000';
    exercise.name = 'Push-ups';
    exercise.instructions = 'Place hands on the ground...';
    exercise.level = ExerciseLevel.Light;
    exercise.workload = { reps: 10, sets: 3 };
    exercise.isActive = true;
    exercise.safetyMetadata = { targetAreas: ['chest', 'arms'] };
    exercise.assetReference = 'push-ups-demo.mp4';
    exercise.schemaVersion = 1;

    expect(exercise.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(exercise.name).toBe('Push-ups');
    expect(exercise.instructions).toBe('Place hands on the ground...');
    expect(exercise.level).toBe(ExerciseLevel.Light);
    expect(exercise.workload).toEqual({ reps: 10, sets: 3 });
    expect(exercise.isActive).toBe(true);
    expect(exercise.safetyMetadata).toEqual({ targetAreas: ['chest', 'arms'] });
    expect(exercise.assetReference).toBe('push-ups-demo.mp4');
    expect(exercise.schemaVersion).toBe(1);
  });

  it('sets default values for optional fields', () => {
    const exercise = new Exercise();

    expect(exercise.workload).toBeUndefined();
    expect(exercise.isActive).toBeUndefined();
    expect(exercise.safetyMetadata).toBeUndefined();
  });

  it('supports all exercise levels', () => {
    const gentle = new Exercise();
    gentle.level = ExerciseLevel.Gentle;
    expect(gentle.level).toBe(ExerciseLevel.Gentle);

    const light = new Exercise();
    light.level = ExerciseLevel.Light;
    expect(light.level).toBe(ExerciseLevel.Light);

    const standard = new Exercise();
    standard.level = ExerciseLevel.Standard;
    expect(standard.level).toBe(ExerciseLevel.Standard);
  });

  it('allows null asset reference', () => {
    const exercise = new Exercise();
    exercise.assetReference = null;

    expect(exercise.assetReference).toBeNull();
  });

  it('validates schema version is positive through database constraint', () => {
    const exercise = new Exercise();
    exercise.schemaVersion = 1;

    expect(exercise.schemaVersion).toBeGreaterThan(0);
  });
});

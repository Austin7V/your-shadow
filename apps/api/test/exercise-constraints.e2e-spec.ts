import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { ExerciseConstraintsService } from '../src/workouts/services/exercise-constraints.service';

describe('Exercise constraints validation (e2e)', () => {
  let app: INestApplication;
  let constraintsService: ExerciseConstraintsService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    constraintsService = app.get(ExerciseConstraintsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should validate current exercise catalog without errors', async () => {
    const errors = await constraintsService.validateCatalog();

    expect(errors).toHaveLength(0);
  });

  it('should reject unknown constraint codes', async () => {
    // After migration, all codes should be valid
    const errors = await constraintsService.validateCatalog();

    const unknownCodeErrors = errors.filter(
      (e) => e.code === 'UNKNOWN_CONSTRAINT_CODE',
    );
    expect(unknownCodeErrors).toHaveLength(0);
  });

  it('should reject replacement with same constraint', async () => {
    // After migration, no exercises should have this issue
    const errors = await constraintsService.validateCatalog();

    const sameConstraintErrors = errors.filter(
      (e) => e.code === 'REPLACEMENT_SAME_CONSTRAINT',
    );
    expect(sameConstraintErrors).toHaveLength(0);
  });

  it('should reject replacement not simpler than original', async () => {
    // After migration, no exercises should have this issue
    const errors = await constraintsService.validateCatalog();

    const notSimplerErrors = errors.filter(
      (e) => e.code === 'REPLACEMENT_NOT_SIMPLER',
    );
    expect(notSimplerErrors).toHaveLength(0);
  });

  it('should detect replacement cycles', async () => {
    // After migration, no cycles should exist
    const errors = await constraintsService.validateCatalog();

    const cycleErrors = errors.filter((e) => e.code === 'REPLACEMENT_CYCLE');
    expect(cycleErrors).toHaveLength(0);
  });

  it('should reject missing replacement targets', async () => {
    // After migration, all targets should exist
    const errors = await constraintsService.validateCatalog();

    const missingTargetErrors = errors.filter(
      (e) => e.code === 'MISSING_REPLACEMENT_TARGET',
    );
    expect(missingTargetErrors).toHaveLength(0);
  });
});

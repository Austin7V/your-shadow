import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Exercise, ExerciseLevel } from '../entities/exercise.entity';
import {
  ExerciseSafetyMetadata,
  VALID_CONSTRAINT_CODES,
} from '../types/exercise-constraints';

export class ExerciseConstraintError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ExerciseConstraintError';
  }
}

@Injectable()
export class ExerciseConstraintsService {
  private exerciseRepository: Repository<Exercise>;

  constructor(private dataSource: DataSource) {
    this.exerciseRepository = this.dataSource.getRepository(Exercise);
  }

  async validateCatalog(): Promise<ExerciseConstraintError[]> {
    const exercises = await this.exerciseRepository.find();
    const exerciseMap = new Map(exercises.map((ex) => [ex.id, ex]));
    const errors: ExerciseConstraintError[] = [];

    for (const exercise of exercises) {
      const safety = this.parseSafetyMetadata(exercise);
      if (!safety) continue;

      errors.push(
        ...this.validateConstraintCodes(exercise.id, safety),
        ...this.validateReplacements(
          exercise.id,
          exercise.level,
          safety,
          exerciseMap,
        ),
        ...this.detectCycles(exercise.id, safety, exerciseMap, new Set()),
      );
    }

    return errors;
  }

  private validateConstraintCodes(
    exerciseId: string,
    safety: ExerciseSafetyMetadata,
  ): ExerciseConstraintError[] {
    const errors: ExerciseConstraintError[] = [];

    for (const code of safety.constraintCodes) {
      if (!VALID_CONSTRAINT_CODES.has(code)) {
        errors.push(
          new ExerciseConstraintError(
            'UNKNOWN_CONSTRAINT_CODE',
            `Exercise ${exerciseId}: unknown constraint code "${code}"`,
          ),
        );
      }
    }

    return errors;
  }

  private validateReplacements(
    exerciseId: string,
    level: ExerciseLevel,
    safety: ExerciseSafetyMetadata,
    exerciseMap: Map<string, Exercise>,
  ): ExerciseConstraintError[] {
    const errors: ExerciseConstraintError[] = [];
    const constraintSet = new Set(safety.constraintCodes);

    for (const replacementId of safety.allowedReplacements) {
      const replacement = exerciseMap.get(replacementId);

      if (!replacement) {
        errors.push(
          new ExerciseConstraintError(
            'MISSING_REPLACEMENT_TARGET',
            `Exercise ${exerciseId}: replacement target ${replacementId} does not exist`,
          ),
        );
        continue;
      }

      const replacementSafety = this.parseSafetyMetadata(replacement);
      if (!replacementSafety) continue;

      const replacementConstraintSet = new Set(
        replacementSafety.constraintCodes,
      );

      // Check for overlapping constraints
      for (const constraint of constraintSet) {
        if (replacementConstraintSet.has(constraint)) {
          errors.push(
            new ExerciseConstraintError(
              'REPLACEMENT_SAME_CONSTRAINT',
              `Exercise ${exerciseId}: replacement ${replacementId} has same constraint "${constraint}"`,
            ),
          );
        }
      }

      // Check that replacement is simpler (lower level)
      if (!this.isSimpler(replacement.level, level)) {
        errors.push(
          new ExerciseConstraintError(
            'REPLACEMENT_NOT_SIMPLER',
            `Exercise ${exerciseId}: replacement ${replacementId} (${replacement.level}) is not simpler than original (${level})`,
          ),
        );
      }
    }

    return errors;
  }

  private detectCycles(
    exerciseId: string,
    safety: ExerciseSafetyMetadata,
    exerciseMap: Map<string, Exercise>,
    visited: Set<string>,
  ): ExerciseConstraintError[] {
    const errors: ExerciseConstraintError[] = [];

    if (visited.has(exerciseId)) {
      errors.push(
        new ExerciseConstraintError(
          'REPLACEMENT_CYCLE',
          `Cycle detected: ${exerciseId} is part of a replacement cycle`,
        ),
      );
      return errors;
    }

    visited.add(exerciseId);

    for (const replacementId of safety.allowedReplacements) {
      const replacement = exerciseMap.get(replacementId);
      if (!replacement) continue;

      const replacementSafety = this.parseSafetyMetadata(replacement);
      if (
        !replacementSafety ||
        replacementSafety.allowedReplacements.length === 0
      ) {
        continue;
      }

      errors.push(
        ...this.detectCycles(
          replacementId,
          replacementSafety,
          exerciseMap,
          new Set(visited),
        ),
      );
    }

    return errors;
  }

  private isSimpler(
    replacementLevel: ExerciseLevel,
    originalLevel: ExerciseLevel,
  ): boolean {
    const levelOrder: Record<ExerciseLevel, number> = {
      [ExerciseLevel.Gentle]: 0,
      [ExerciseLevel.Light]: 1,
      [ExerciseLevel.Standard]: 2,
    };

    return levelOrder[replacementLevel] < levelOrder[originalLevel];
  }

  private parseSafetyMetadata(
    exercise: Exercise,
  ): ExerciseSafetyMetadata | null {
    try {
      const metadata = exercise.safetyMetadata;

      if (typeof metadata === 'string') {
        return JSON.parse(metadata) as ExerciseSafetyMetadata;
      }

      if (typeof metadata === 'object' && metadata !== null) {
        return metadata as unknown as ExerciseSafetyMetadata;
      }

      return null;
    } catch {
      return null;
    }
  }
}

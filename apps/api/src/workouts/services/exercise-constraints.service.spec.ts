import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { Exercise, ExerciseLevel } from '../entities/exercise.entity';
import {
  ExerciseConstraintError,
  ExerciseConstraintsService,
} from './exercise-constraints.service';

describe('ExerciseConstraintsService', () => {
  let service: ExerciseConstraintsService;
  let mockRepository: jest.Mocked<Repository<Exercise>>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<Exercise>>;

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as unknown as jest.Mocked<DataSource>;

    const module = await Test.createTestingModule({
      providers: [
        ExerciseConstraintsService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get(ExerciseConstraintsService);
  });

  describe('validateCatalog', () => {
    it('should pass validation for correct replacements', async () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Push-ups',
          instructions: 'Do push-ups',
          level: ExerciseLevel.Light,
          targetAreas: ['chest'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['shoulder-pain'],
            allowedReplacements: ['ex-2'],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ex-2',
          name: 'Wall push-ups',
          instructions: 'Do wall push-ups',
          level: ExerciseLevel.Gentle,
          targetAreas: ['chest'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['wrist-pain'],
            allowedReplacements: [],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(exercises);

      const errors = await service.validateCatalog();
      expect(errors).toHaveLength(0);
    });

    it('should reject replacement with same constraint', async () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Exercise',
          instructions: 'Do it',
          level: ExerciseLevel.Light,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['shoulder-pain'],
            allowedReplacements: ['ex-2'],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ex-2',
          name: 'Bad replacement',
          instructions: 'Do it',
          level: ExerciseLevel.Gentle,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['shoulder-pain', 'wrist-pain'],
            allowedReplacements: [],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(exercises);

      const errors = await service.validateCatalog();
      expect(errors).toHaveLength(1);
      expect(errors[0]!).toBeInstanceOf(ExerciseConstraintError);
      expect(errors[0]!.code).toBe('REPLACEMENT_SAME_CONSTRAINT');
      expect(errors[0]!.message).toContain('shoulder-pain');
    });

    it('should reject unknown constraint codes', async () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Exercise',
          instructions: 'Do it',
          level: ExerciseLevel.Light,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['unknown-code'],
            allowedReplacements: [],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(exercises);

      const errors = await service.validateCatalog();
      expect(errors).toHaveLength(1);
      expect(errors[0]!).toBeInstanceOf(ExerciseConstraintError);
      expect(errors[0]!.code).toBe('UNKNOWN_CONSTRAINT_CODE');
    });

    it('should reject missing replacement targets', async () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Exercise',
          instructions: 'Do it',
          level: ExerciseLevel.Light,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['shoulder-pain'],
            allowedReplacements: ['non-existent-id'],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(exercises);

      const errors = await service.validateCatalog();
      expect(errors).toHaveLength(1);
      expect(errors[0]!).toBeInstanceOf(ExerciseConstraintError);
      expect(errors[0]!.code).toBe('MISSING_REPLACEMENT_TARGET');
    });

    it('should reject replacement not simpler (same level)', async () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Exercise',
          instructions: 'Do it',
          level: ExerciseLevel.Light,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['shoulder-pain'],
            allowedReplacements: ['ex-2'],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ex-2',
          name: 'Same level replacement',
          instructions: 'Do it',
          level: ExerciseLevel.Light,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['wrist-pain'],
            allowedReplacements: [],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(exercises);

      const errors = await service.validateCatalog();
      expect(errors).toHaveLength(1);
      expect(errors[0]!).toBeInstanceOf(ExerciseConstraintError);
      expect(errors[0]!.code).toBe('REPLACEMENT_NOT_SIMPLER');
    });

    it('should detect replacement cycles', async () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Exercise 1',
          instructions: 'Do it',
          level: ExerciseLevel.Standard,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['high-impact'],
            allowedReplacements: ['ex-2'],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ex-2',
          name: 'Exercise 2',
          instructions: 'Do it',
          level: ExerciseLevel.Gentle,
          targetAreas: ['target'],
          workload: {},
          isActive: true,
          safetyMetadata: {
            constraintCodes: ['joint-pain'],
            allowedReplacements: ['ex-1'],
          },
          assetReference: null,
          schemaVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(exercises);

      const errors = await service.validateCatalog();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.code === 'REPLACEMENT_CYCLE')).toBe(true);
    });
  });
});

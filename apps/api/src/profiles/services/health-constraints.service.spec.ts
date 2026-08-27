import { NotFoundException } from '@nestjs/common';
import type {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import { HealthConstraintSeverity } from '../enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../enums/health-constraint-type.enum';
import { HealthConstraint } from '../entities/health-constraint.entity';
import { HealthConstraintEncryptedData } from '../types/health-constraint-encrypted-data.type';
import { HealthConstraintsService } from './health-constraints.service';

describe('HealthConstraintsService', () => {
  let healthConstraintsService: HealthConstraintsService;

  let findHealthConstraints: jest.MockedFunction<
    (options: FindManyOptions<HealthConstraint>) => Promise<HealthConstraint[]>
  >;

  let findOneHealthConstraint: jest.MockedFunction<
    (
      options: FindOneOptions<HealthConstraint>,
    ) => Promise<HealthConstraint | null>
  >;

  let createHealthConstraintEntity: jest.MockedFunction<
    (entityLike: DeepPartial<HealthConstraint>) => HealthConstraint
  >;

  let saveHealthConstraintEntity: jest.MockedFunction<
    (healthConstraint: HealthConstraint) => Promise<HealthConstraint>
  >;

  let encryptHealthConstraint: jest.MockedFunction<
    (value: HealthConstraintEncryptedData, context: string) => string
  >;

  let decryptHealthConstraint: jest.MockedFunction<
    (value: string, context: string) => HealthConstraintEncryptedData
  >;

  const constraintData: HealthConstraintEncryptedData = {
    schemaVersion: 1,
    type: HealthConstraintType.INJURY,
    title: 'Lower back pain',
    notes: 'Avoid high-impact exercises.',
    severity: HealthConstraintSeverity.MODERATE,
  };

  const createStoredHealthConstraint = (
    id = 'constraint-id',
  ): HealthConstraint => {
    const healthConstraint = new HealthConstraint();

    healthConstraint.id = id;
    healthConstraint.userId = 'user-id';
    healthConstraint.encryptedData = 'encrypted-constraint';
    healthConstraint.isActive = true;
    healthConstraint.createdAt = new Date('2026-08-27T09:00:00.000Z');
    healthConstraint.updatedAt = new Date('2026-08-27T09:30:00.000Z');

    return healthConstraint;
  };

  beforeEach(() => {
    findHealthConstraints = jest.fn<
      Promise<HealthConstraint[]>,
      [FindManyOptions<HealthConstraint>]
    >();

    findOneHealthConstraint = jest.fn<
      Promise<HealthConstraint | null>,
      [FindOneOptions<HealthConstraint>]
    >();

    createHealthConstraintEntity = jest.fn<
      HealthConstraint,
      [DeepPartial<HealthConstraint>]
    >();

    saveHealthConstraintEntity = jest.fn<
      Promise<HealthConstraint>,
      [HealthConstraint]
    >();

    encryptHealthConstraint = jest.fn<
      string,
      [HealthConstraintEncryptedData, string]
    >();

    decryptHealthConstraint = jest.fn<
      HealthConstraintEncryptedData,
      [string, string]
    >();

    const healthConstraintsRepository = {
      find: findHealthConstraints,
      findOne: findOneHealthConstraint,
      create: createHealthConstraintEntity,
      save: saveHealthConstraintEntity,
    } as unknown as Repository<HealthConstraint>;

    const dataEncryptionService = {
      encrypt: encryptHealthConstraint,
      decrypt: decryptHealthConstraint,
    } as unknown as DataEncryptionService;

    healthConstraintsService = new HealthConstraintsService(
      healthConstraintsRepository,
      dataEncryptionService,
    );
  });

  it('creates an encrypted constraint for the authenticated user', async () => {
    const storedConstraint = createStoredHealthConstraint();

    encryptHealthConstraint.mockReturnValue('encrypted-constraint');
    createHealthConstraintEntity.mockReturnValue(storedConstraint);
    saveHealthConstraintEntity.mockResolvedValue(storedConstraint);

    const response = await healthConstraintsService.createHealthConstraint(
      'user-id',
      {
        type: HealthConstraintType.INJURY,
        title: 'Lower back pain',
        notes: 'Avoid high-impact exercises.',
        severity: HealthConstraintSeverity.MODERATE,
      },
    );

    expect(encryptHealthConstraint).toHaveBeenCalledWith(
      constraintData,
      'health-constraint:user-id',
    );
    expect(createHealthConstraintEntity).toHaveBeenCalledWith({
      userId: 'user-id',
      encryptedData: 'encrypted-constraint',
      isActive: true,
    });
    expect(response.title).toBe('Lower back pain');
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('encryptedData');
  });

  it('lists only the authenticated user constraints', async () => {
    const storedConstraint = createStoredHealthConstraint();

    findHealthConstraints.mockResolvedValue([storedConstraint]);
    decryptHealthConstraint.mockReturnValue(constraintData);

    const response =
      await healthConstraintsService.listHealthConstraints('user-id');

    expect(findHealthConstraints).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
      },
      order: {
        createdAt: 'DESC',
      },
    });
    expect(decryptHealthConstraint).toHaveBeenCalledWith(
      'encrypted-constraint',
      'health-constraint:user-id',
    );
    expect(response).toHaveLength(1);
    expect(response[0]).not.toHaveProperty('encryptedData');
  });

  it('updates a constraint scoped by its id and current user id', async () => {
    const storedConstraint = createStoredHealthConstraint();

    findOneHealthConstraint.mockResolvedValue(storedConstraint);
    decryptHealthConstraint.mockReturnValue(constraintData);
    encryptHealthConstraint.mockReturnValue('updated-encrypted-constraint');
    saveHealthConstraintEntity.mockImplementation((healthConstraint) =>
      Promise.resolve(healthConstraint),
    );

    const response = await healthConstraintsService.updateHealthConstraint(
      'user-id',
      'constraint-id',
      {
        title: 'Improving lower back pain',
        severity: HealthConstraintSeverity.HIGH,
        isActive: false,
      },
    );

    const expectedUpdatedData: HealthConstraintEncryptedData = {
      ...constraintData,
      title: 'Improving lower back pain',
      severity: HealthConstraintSeverity.HIGH,
    };

    expect(findOneHealthConstraint).toHaveBeenCalledWith({
      where: {
        id: 'constraint-id',
        userId: 'user-id',
      },
    });
    expect(encryptHealthConstraint).toHaveBeenCalledWith(
      expectedUpdatedData,
      'health-constraint:user-id',
    );
    expect(saveHealthConstraintEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'constraint-id',
        userId: 'user-id',
        encryptedData: 'updated-encrypted-constraint',
        isActive: false,
      }),
    );
    expect(response.title).toBe('Improving lower back pain');
    expect(response.isActive).toBe(false);
  });

  it('allows nullable notes to be cleared', async () => {
    const storedConstraint = createStoredHealthConstraint();

    findOneHealthConstraint.mockResolvedValue(storedConstraint);
    decryptHealthConstraint.mockReturnValue(constraintData);
    encryptHealthConstraint.mockReturnValue('updated-encrypted-constraint');
    saveHealthConstraintEntity.mockImplementation((healthConstraint) =>
      Promise.resolve(healthConstraint),
    );

    const response = await healthConstraintsService.updateHealthConstraint(
      'user-id',
      'constraint-id',
      {
        notes: null,
      },
    );

    expect(encryptHealthConstraint).toHaveBeenCalledWith(
      {
        ...constraintData,
        notes: null,
      },
      'health-constraint:user-id',
    );
    expect(response.notes).toBeNull();
  });

  it('does not reveal another users constraint', async () => {
    findOneHealthConstraint.mockResolvedValue(null);

    await expect(
      healthConstraintsService.updateHealthConstraint(
        'user-id',
        'other-users-constraint-id',
        {
          isActive: false,
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(decryptHealthConstraint).not.toHaveBeenCalled();
    expect(saveHealthConstraintEntity).not.toHaveBeenCalled();
  });
});

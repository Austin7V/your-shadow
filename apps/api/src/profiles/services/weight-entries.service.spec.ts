import { BadRequestException } from '@nestjs/common';
import type { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import { WeightEntry } from '../entities/weight-entry.entity';
import { WeightEntryEncryptedData } from '../types/weight-entry-encrypted-data.type';
import { WeightEntriesService } from './weight-entries.service';

type FindWeightEntries = (
  options: FindManyOptions<WeightEntry>,
) => Promise<WeightEntry[]>;

type CreateWeightEntryEntity = (
  entityLike: DeepPartial<WeightEntry>,
) => WeightEntry;

type SaveWeightEntryEntity = (weightEntry: WeightEntry) => Promise<WeightEntry>;

type EncryptWeightEntry = (
  value: WeightEntryEncryptedData,
  context: string,
) => string;

type DecryptWeightEntry = (
  value: string,
  context: string,
) => WeightEntryEncryptedData;

describe('WeightEntriesService', () => {
  let weightEntriesService: WeightEntriesService;
  let findWeightEntries: jest.MockedFunction<FindWeightEntries>;
  let createWeightEntryEntity: jest.MockedFunction<CreateWeightEntryEntity>;
  let saveWeightEntryEntity: jest.MockedFunction<SaveWeightEntryEntity>;
  let encryptWeightEntry: jest.MockedFunction<EncryptWeightEntry>;
  let decryptWeightEntry: jest.MockedFunction<DecryptWeightEntry>;

  const createStoredWeightEntry = (
    id: string,
    encryptedData: string,
    measuredAt: string,
  ): WeightEntry => {
    const weightEntry = new WeightEntry();

    weightEntry.id = id;
    weightEntry.userId = 'user-id';
    weightEntry.encryptedData = encryptedData;
    weightEntry.measuredAt = new Date(measuredAt);
    weightEntry.createdAt = new Date(measuredAt);
    weightEntry.updatedAt = new Date(measuredAt);

    return weightEntry;
  };

  beforeEach(() => {
    findWeightEntries = jest.fn<
      Promise<WeightEntry[]>,
      [FindManyOptions<WeightEntry>]
    >();

    createWeightEntryEntity = jest.fn<
      WeightEntry,
      [DeepPartial<WeightEntry>]
    >();

    saveWeightEntryEntity = jest.fn<Promise<WeightEntry>, [WeightEntry]>();

    encryptWeightEntry = jest.fn<string, [WeightEntryEncryptedData, string]>();

    decryptWeightEntry = jest.fn<WeightEntryEncryptedData, [string, string]>();

    const weightEntriesRepository = {
      find: findWeightEntries,
      create: createWeightEntryEntity,
      save: saveWeightEntryEntity,
    } as unknown as Repository<WeightEntry>;

    const dataEncryptionService = {
      encrypt: encryptWeightEntry,
      decrypt: decryptWeightEntry,
    } as unknown as DataEncryptionService;

    weightEntriesService = new WeightEntriesService(
      weightEntriesRepository,
      dataEncryptionService,
    );
  });

  it('creates an encrypted weight entry for the authenticated user', async () => {
    const storedWeightEntry = createStoredWeightEntry(
      'weight-entry-id',
      'encrypted-weight',
      '2026-08-27T08:00:00.000Z',
    );

    encryptWeightEntry.mockReturnValue('encrypted-weight');
    createWeightEntryEntity.mockReturnValue(storedWeightEntry);
    saveWeightEntryEntity.mockResolvedValue(storedWeightEntry);

    const response = await weightEntriesService.createWeightEntry('user-id', {
      weightKg: 114.4,
      measuredAt: '2026-08-27T08:00:00.000Z',
    });

    expect(encryptWeightEntry).toHaveBeenCalledWith(
      {
        schemaVersion: 1,
        weightKg: 114.4,
      },
      'weight-entry:user-id',
    );
    expect(createWeightEntryEntity).toHaveBeenCalledWith({
      userId: 'user-id',
      encryptedData: 'encrypted-weight',
      measuredAt: new Date('2026-08-27T08:00:00.000Z'),
    });
    expect(response.weightKg).toBe(114.4);
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('encryptedData');
  });

  it('rejects a measurement date in the future', async () => {
    await expect(
      weightEntriesService.createWeightEntry('user-id', {
        weightKg: 114.4,
        measuredAt: '2999-01-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(encryptWeightEntry).not.toHaveBeenCalled();
    expect(saveWeightEntryEntity).not.toHaveBeenCalled();
  });

  it('lists only the authenticated user weight entries newest first', async () => {
    const newerWeightEntry = createStoredWeightEntry(
      'newer-entry-id',
      'encrypted-newer-weight',
      '2026-08-27T08:00:00.000Z',
    );

    const olderWeightEntry = createStoredWeightEntry(
      'older-entry-id',
      'encrypted-older-weight',
      '2026-08-20T08:00:00.000Z',
    );

    findWeightEntries.mockResolvedValue([newerWeightEntry, olderWeightEntry]);

    decryptWeightEntry
      .mockReturnValueOnce({
        schemaVersion: 1,
        weightKg: 114.4,
      })
      .mockReturnValueOnce({
        schemaVersion: 1,
        weightKg: 115.2,
      });

    const response = await weightEntriesService.listWeightEntries('user-id');

    expect(findWeightEntries).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
      },
      order: {
        measuredAt: 'DESC',
      },
    });
    expect(decryptWeightEntry).toHaveBeenNthCalledWith(
      1,
      'encrypted-newer-weight',
      'weight-entry:user-id',
    );
    expect(decryptWeightEntry).toHaveBeenNthCalledWith(
      2,
      'encrypted-older-weight',
      'weight-entry:user-id',
    );
    expect(response.map((entry) => entry.weightKg)).toEqual([114.4, 115.2]);
    expect(response[0]).not.toHaveProperty('encryptedData');
  });

  it('returns an empty list when the user has no weight entries', async () => {
    findWeightEntries.mockResolvedValue([]);

    const response = await weightEntriesService.listWeightEntries('user-id');

    expect(response).toEqual([]);
    expect(decryptWeightEntry).not.toHaveBeenCalled();
  });
});

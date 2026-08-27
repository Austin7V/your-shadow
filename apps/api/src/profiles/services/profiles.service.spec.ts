import { ConflictException, NotFoundException } from '@nestjs/common';
import type { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import { ProfileGoal } from '../enums/profile-goal.enum';
import { Profile } from '../entities/profile.entity';
import { ProfileEncryptedData } from '../types/profile-encrypted-data.type';
import { ProfilesService } from './profiles.service';

type FindOneProfile = (
  options: FindOneOptions<Profile>,
) => Promise<Profile | null>;

type CreateProfileEntity = (entityLike: DeepPartial<Profile>) => Profile;

type SaveProfileEntity = (profile: Profile) => Promise<Profile>;

type EncryptProfile = (value: ProfileEncryptedData, context: string) => string;

type DecryptProfile = (value: string, context: string) => ProfileEncryptedData;

describe('ProfilesService', () => {
  let profilesService: ProfilesService;
  let findOneProfile: jest.MockedFunction<FindOneProfile>;
  let createProfileEntity: jest.MockedFunction<CreateProfileEntity>;
  let saveProfileEntity: jest.MockedFunction<SaveProfileEntity>;
  let encryptProfile: jest.MockedFunction<EncryptProfile>;
  let decryptProfile: jest.MockedFunction<DecryptProfile>;

  const profileData: ProfileEncryptedData = {
    schemaVersion: 1,
    firstName: 'Sergey',
    lastName: 'Badin',
    userName: 'Sergey',
    dateOfBirth: '1993-07-31',
    heightCm: 184,
    timezone: 'Europe/Berlin',
    primaryGoal: ProfileGoal.LOSE_WEIGHT,
    targetWeightKg: 95,
    lastDoctorVisitAt: null,
  };

  const createStoredProfile = (): Profile => {
    const profile = new Profile();

    profile.id = 'profile-id';
    profile.userId = 'user-id';
    profile.encryptedData = 'encrypted-profile';
    profile.onboardingCompletedAt = null;
    profile.createdAt = new Date('2026-08-27T10:00:00.000Z');
    profile.updatedAt = new Date('2026-08-27T11:00:00.000Z');

    return profile;
  };

  beforeEach(() => {
    findOneProfile = jest.fn<
      Promise<Profile | null>,
      [FindOneOptions<Profile>]
    >();

    createProfileEntity = jest.fn<Profile, [DeepPartial<Profile>]>();

    saveProfileEntity = jest.fn<Promise<Profile>, [Profile]>();

    encryptProfile = jest.fn<string, [ProfileEncryptedData, string]>();

    decryptProfile = jest.fn<ProfileEncryptedData, [string, string]>();

    const profilesRepository = {
      findOne: findOneProfile,
      create: createProfileEntity,
      save: saveProfileEntity,
    } as unknown as Repository<Profile>;

    const dataEncryptionService = {
      encrypt: encryptProfile,
      decrypt: decryptProfile,
    } as unknown as DataEncryptionService;

    profilesService = new ProfilesService(
      profilesRepository,
      dataEncryptionService,
    );
  });

  it('creates an encrypted profile for the authenticated user', async () => {
    const storedProfile = createStoredProfile();

    findOneProfile.mockResolvedValue(null);
    encryptProfile.mockReturnValue('encrypted-profile');
    createProfileEntity.mockReturnValue(storedProfile);
    saveProfileEntity.mockResolvedValue(storedProfile);

    const response = await profilesService.createProfile('user-id', {
      firstName: 'Sergey',
      lastName: 'Badin',
      userName: 'Sergey',
      dateOfBirth: '1993-07-31',
      heightCm: 184,
      timezone: 'Europe/Berlin',
      primaryGoal: ProfileGoal.LOSE_WEIGHT,
      targetWeightKg: 95,
      lastDoctorVisitAt: null,
    });

    expect(findOneProfile).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
      },
    });
    expect(encryptProfile).toHaveBeenCalledWith(profileData, 'profile:user-id');
    expect(createProfileEntity).toHaveBeenCalledWith({
      userId: 'user-id',
      encryptedData: 'encrypted-profile',
      onboardingCompletedAt: null,
    });
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('encryptedData');
  });

  it('rejects creation when the user already has a profile', async () => {
    findOneProfile.mockResolvedValue(createStoredProfile());

    await expect(
      profilesService.createProfile('user-id', {
        firstName: 'Sergey',
        lastName: 'Badin',
        userName: 'Sergey',
        dateOfBirth: '1993-07-31',
        heightCm: 184,
        timezone: 'Europe/Berlin',
        primaryGoal: ProfileGoal.LOSE_WEIGHT,
        targetWeightKg: 95,
        lastDoctorVisitAt: null,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(encryptProfile).not.toHaveBeenCalled();
    expect(saveProfileEntity).not.toHaveBeenCalled();
  });

  it('gets and decrypts the authenticated user profile', async () => {
    const storedProfile = createStoredProfile();

    findOneProfile.mockResolvedValue(storedProfile);
    decryptProfile.mockReturnValue(profileData);

    const response = await profilesService.getProfile('user-id');

    expect(findOneProfile).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
      },
    });
    expect(decryptProfile).toHaveBeenCalledWith(
      'encrypted-profile',
      'profile:user-id',
    );
    expect(response.firstName).toBe('Sergey');
    expect(response.timezone).toBe('Europe/Berlin');
    expect(response).not.toHaveProperty('encryptedData');
  });

  it('returns not found when the authenticated user has no profile', async () => {
    findOneProfile.mockResolvedValue(null);

    await expect(profilesService.getProfile('user-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(decryptProfile).not.toHaveBeenCalled();
  });

  it('updates supplied fields and preserves omitted profile data', async () => {
    const storedProfile = createStoredProfile();

    findOneProfile.mockResolvedValue(storedProfile);
    decryptProfile.mockReturnValue(profileData);
    encryptProfile.mockReturnValue('updated-encrypted-profile');
    saveProfileEntity.mockResolvedValue({
      ...storedProfile,
      encryptedData: 'updated-encrypted-profile',
    });

    const response = await profilesService.updateProfile('user-id', {
      userName: 'Shadow',
      targetWeightKg: null,
    });

    const expectedUpdatedData: ProfileEncryptedData = {
      ...profileData,
      userName: 'Shadow',
      targetWeightKg: null,
    };

    expect(encryptProfile).toHaveBeenCalledWith(
      expectedUpdatedData,
      'profile:user-id',
    );
    expect(saveProfileEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'profile-id',
        userId: 'user-id',
        encryptedData: 'updated-encrypted-profile',
      }),
    );
    expect(response.userName).toBe('Shadow');
    expect(response.targetWeightKg).toBeNull();
    expect(response.timezone).toBe('Europe/Berlin');
  });
});

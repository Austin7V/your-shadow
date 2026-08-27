import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProfileGoal } from '../enums/profile-goal.enum';
import { CreateProfileDto } from './create-profile.dto';
import { UpdateProfileDto } from './update-profile.dto';

describe('profile DTOs', () => {
  const validProfile = {
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

  it('accepts valid profile data', async () => {
    const dto = plainToInstance(CreateProfileDto, validProfile);

    const validationErrors = await validate(dto);

    expect(validationErrors).toHaveLength(0);
  });

  it('trims profile names and timezone', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      firstName: '  Sergey  ',
      lastName: '  Badin  ',
      userName: '  Sergey  ',
      timezone: '  Europe/Berlin  ',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).toHaveLength(0);
    expect(dto.firstName).toBe('Sergey');
    expect(dto.lastName).toBe('Badin');
    expect(dto.userName).toBe('Sergey');
    expect(dto.timezone).toBe('Europe/Berlin');
  });

  it('rejects an empty user name', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      userName: '   ',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects an invalid date-of-birth format', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      dateOfBirth: '31.07.1993',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects a height below the allowed range', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      heightCm: 99,
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects a height above the allowed range', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      heightCm: 251,
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects a target weight outside the allowed range', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      targetWeightKg: 501,
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects an unknown profile goal', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      primaryGoal: 'unknown_goal',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('rejects an invalid timezone', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      ...validProfile,
      timezone: 'Berlin',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });

  it('allows a partial profile update', async () => {
    const dto = plainToInstance(UpdateProfileDto, {
      userName: 'Shadow',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).toHaveLength(0);
  });

  it('allows a valid timezone update', async () => {
    const dto = plainToInstance(UpdateProfileDto, {
      timezone: 'Europe/Kyiv',
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).toHaveLength(0);
  });

  it('rejects invalid values in a partial update', async () => {
    const dto = plainToInstance(UpdateProfileDto, {
      heightCm: 300,
    });

    const validationErrors = await validate(dto);

    expect(validationErrors).not.toHaveLength(0);
  });
});

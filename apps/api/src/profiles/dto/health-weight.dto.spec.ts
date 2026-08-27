import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HealthConstraintSeverity } from '../enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../enums/health-constraint-type.enum';
import { CreateHealthConstraintDto } from './create-health-constraint.dto';
import { CreateWeightEntryDto } from './create-weight-entry.dto';
import { UpdateHealthConstraintDto } from './update-health-constraint.dto';

describe('health and weight DTOs', () => {
  describe('CreateWeightEntryDto', () => {
    it('accepts a valid weight entry', async () => {
      const dto = plainToInstance(CreateWeightEntryDto, {
        weightKg: 114.4,
        measuredAt: '2026-08-27T10:00:00.000Z',
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
    });

    it('accepts an entry without an explicit measurement date', async () => {
      const dto = plainToInstance(CreateWeightEntryDto, {
        weightKg: 114.4,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
    });

    it('rejects a weight outside the allowed range', async () => {
      const dto = plainToInstance(CreateWeightEntryDto, {
        weightKg: 501,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });

    it('rejects a weight with excessive decimal places', async () => {
      const dto = plainToInstance(CreateWeightEntryDto, {
        weightKg: 114.444,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });

    it('rejects an invalid measurement date', async () => {
      const dto = plainToInstance(CreateWeightEntryDto, {
        weightKg: 114.4,
        measuredAt: 'invalid-date',
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });

    it('rejects null as a measurement date', async () => {
      const dto = plainToInstance(CreateWeightEntryDto, {
        weightKg: 114.4,
        measuredAt: null,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });
  });

  describe('CreateHealthConstraintDto', () => {
    const validConstraint = {
      type: HealthConstraintType.INJURY,
      title: 'Lower back pain',
      notes: 'Avoid high-impact exercises.',
      severity: HealthConstraintSeverity.MODERATE,
    };

    it('accepts a valid health constraint', async () => {
      const dto = plainToInstance(CreateHealthConstraintDto, validConstraint);

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
    });

    it('trims the title and notes', async () => {
      const dto = plainToInstance(CreateHealthConstraintDto, {
        ...validConstraint,
        title: '  Lower back pain  ',
        notes: '  Avoid high-impact exercises.  ',
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
      expect(dto.title).toBe('Lower back pain');
      expect(dto.notes).toBe('Avoid high-impact exercises.');
    });

    it('normalizes blank notes to null', async () => {
      const dto = plainToInstance(CreateHealthConstraintDto, {
        ...validConstraint,
        notes: '   ',
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
      expect(dto.notes).toBeNull();
    });

    it('rejects an unknown constraint type', async () => {
      const dto = plainToInstance(CreateHealthConstraintDto, {
        ...validConstraint,
        type: 'unknown_type',
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });

    it('rejects a blank title', async () => {
      const dto = plainToInstance(CreateHealthConstraintDto, {
        ...validConstraint,
        title: '   ',
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });

    it('rejects notes longer than the allowed limit', async () => {
      const dto = plainToInstance(CreateHealthConstraintDto, {
        ...validConstraint,
        notes: 'a'.repeat(1001),
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });
  });

  describe('UpdateHealthConstraintDto', () => {
    it('allows a partial health-constraint update', async () => {
      const dto = plainToInstance(UpdateHealthConstraintDto, {
        severity: HealthConstraintSeverity.HIGH,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
    });

    it('allows a constraint to be deactivated', async () => {
      const dto = plainToInstance(UpdateHealthConstraintDto, {
        isActive: false,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).toHaveLength(0);
    });

    it('rejects null for a non-nullable update field', async () => {
      const dto = plainToInstance(UpdateHealthConstraintDto, {
        title: null,
      });

      const validationErrors = await validate(dto);

      expect(validationErrors).not.toHaveLength(0);
    });
  });
});

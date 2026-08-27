import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { HealthConstraintSeverity } from '../enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../enums/health-constraint-type.enum';

const trimStringInput = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim();
};

const normalizeOptionalStringInput = (value: unknown): unknown => {
  const trimmedValue = trimStringInput(value);

  return trimmedValue === '' ? null : trimmedValue;
};

export class CreateHealthConstraintDto {
  @IsEnum(HealthConstraintType)
  type!: HealthConstraintType;

  @Transform(({ value }: TransformFnParams) => trimStringInput(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    normalizeOptionalStringInput(value),
  )
  @IsString()
  @MaxLength(1000)
  notes?: string | null;

  @IsEnum(HealthConstraintSeverity)
  severity!: HealthConstraintSeverity;
}

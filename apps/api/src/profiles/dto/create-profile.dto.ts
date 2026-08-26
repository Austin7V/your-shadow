import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProfileGoal } from '../enums/profile-goal.enum';

const trimStringInput = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim();
};

export class CreateProfileDto {
  @Transform(({ value }: TransformFnParams) => trimStringInput(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/\S/, {
    message: 'firstName must contain a non-whitespace character',
  })
  firstName!: string;

  @Transform(({ value }: TransformFnParams) => trimStringInput(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/\S/, {
    message: 'lastName must contain a non-whitespace character',
  })
  lastName!: string;

  @Transform(({ value }: TransformFnParams) => trimStringInput(value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/\S/, {
    message: 'userName must contain a non-whitespace character',
  })
  userName!: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateOfBirth must use the YYYY-MM-DD format',
  })
  dateOfBirth!: string;

  @IsNumber({
    maxDecimalPlaces: 1,
  })
  @Min(100)
  @Max(250)
  heightCm!: number;

  @IsEnum(ProfileGoal)
  primaryGoal!: ProfileGoal;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(30)
  @Max(500)
  targetWeightKg?: number | null;

  @IsOptional()
  @IsDateString({ strict: true })
  lastDoctorVisitAt?: string | null;
}

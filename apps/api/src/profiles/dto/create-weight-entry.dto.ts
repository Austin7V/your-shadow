import { IsDateString, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class CreateWeightEntryDto {
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(30)
  @Max(500)
  weightKg!: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsDateString({ strict: true })
  measuredAt?: string;
}

import {
  MEAL_DESCRIPTION_LIMITS,
  type ParseMealRequest,
} from '@your-shadow/contracts';
import { IsString, Length, Matches } from 'class-validator';

export class ParseMealDto implements ParseMealRequest {
  @IsString()
  @Length(
    MEAL_DESCRIPTION_LIMITS.minimumLength,
    MEAL_DESCRIPTION_LIMITS.maximumLength,
  )
  @Matches(/\S/u, {
    message: 'originalText must contain non-whitespace characters',
  })
  readonly originalText!: string;
}

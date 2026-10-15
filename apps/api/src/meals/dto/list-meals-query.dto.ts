import type { ListMealsQuery } from '@your-shadow/contracts';
import { IsISO8601, IsString, Matches } from 'class-validator';

export class ListMealsQueryDto implements ListMealsQuery {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, {
    message: 'date must use YYYY-MM-DD format',
  })
  @IsISO8601({ strict: true })
  readonly date!: string;
}

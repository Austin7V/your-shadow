import { HealthConstraintSeverity } from '../enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../enums/health-constraint-type.enum';

export class HealthConstraintResponseDto {
  readonly id!: string;
  readonly type!: HealthConstraintType;
  readonly title!: string;
  readonly notes!: string | null;
  readonly severity!: HealthConstraintSeverity;
  readonly isActive!: boolean;
  readonly createdAt!: string;
  readonly updatedAt!: string;
}

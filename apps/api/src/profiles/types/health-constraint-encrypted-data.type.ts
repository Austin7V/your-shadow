import { HealthConstraintSeverity } from '../enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../enums/health-constraint-type.enum';

export interface HealthConstraintEncryptedData {
  readonly schemaVersion: 1;
  readonly type: HealthConstraintType;
  readonly title: string;
  readonly notes: string | null;
  readonly severity: HealthConstraintSeverity;
}

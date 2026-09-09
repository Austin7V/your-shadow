import {
  ALLOWED_PLAN_ITEM_STATUS_UPDATES,
  type AllowedPlanItemStatusUpdate,
  type UpdateTodayPlanItemStatusRequest,
} from '@your-shadow/contracts';
import { IsIn } from 'class-validator';

export class UpdatePlanItemStatusDto implements UpdateTodayPlanItemStatusRequest {
  @IsIn(ALLOWED_PLAN_ITEM_STATUS_UPDATES)
  readonly status!: AllowedPlanItemStatusUpdate;
}

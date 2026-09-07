import {
  DAILY_PLAN_ITEM_TYPES,
  type DailyPlanItemOutput,
} from '@your-shadow/contracts';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DailyPlan } from './daily-plan.entity';

export enum PlanItemStatus {
  Pending = 'pending',
  Completed = 'completed',
  Skipped = 'skipped',
  Blocked = 'blocked',
}

export enum PlanItemSource {
  Rules = 'rules',
  Ai = 'ai',
  Fallback = 'fallback',
}

export type PlanItemType = DailyPlanItemOutput['type'];

export type PlanItemPayload = Pick<
  DailyPlanItemOutput,
  'title' | 'description' | 'explanation'
>;

@Entity({ name: 'plan_items' })
@Index('UQ_plan_items_plan_order', ['planId', 'order'], {
  unique: true,
})
@Check('CHK_plan_items_order_non_negative', '"item_order" >= 0')
export class PlanItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'plan_id',
    type: 'uuid',
  })
  planId!: string;

  @ManyToOne(() => DailyPlan, (plan: DailyPlan) => plan.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'plan_id',
  })
  plan!: DailyPlan;

  @Column({
    type: 'enum',
    enum: [...DAILY_PLAN_ITEM_TYPES],
    enumName: 'plan_item_type_enum',
  })
  type!: PlanItemType;

  @Column({
    type: 'enum',
    enum: PlanItemStatus,
    enumName: 'plan_item_status_enum',
    default: PlanItemStatus.Pending,
  })
  status!: PlanItemStatus;

  @Column({
    name: 'item_order',
    type: 'smallint',
  })
  order!: number;

  @Column({
    type: 'enum',
    enum: PlanItemSource,
    enumName: 'plan_item_source_enum',
  })
  source!: PlanItemSource;

  @Column({
    type: 'jsonb',
  })
  payload!: PlanItemPayload;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}

import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { PlanItem } from './plan-item.entity';

export enum DailyPlanStatus {
  Active = 'active',
  Completed = 'completed',
  Stale = 'stale',
}

@Entity({ name: 'daily_plans' })
@Index('UQ_daily_plans_user_local_date', ['userId', 'localDate'], {
  unique: true,
})
@Check('CHK_daily_plans_schema_version_positive', '"schema_version" > 0')
export class DailyPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @Column({
    name: 'local_date',
    type: 'date',
  })
  localDate!: string;

  @Column({
    type: 'enum',
    enum: DailyPlanStatus,
    enumName: 'daily_plan_status_enum',
    default: DailyPlanStatus.Active,
  })
  status!: DailyPlanStatus;

  @Column({
    name: 'schema_version',
    type: 'smallint',
    default: 1,
  })
  schemaVersion!: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  summary!: string | null;

  @OneToMany(() => PlanItem, (item: PlanItem) => item.plan, {
    cascade: ['insert', 'update'],
  })
  items!: PlanItem[];

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

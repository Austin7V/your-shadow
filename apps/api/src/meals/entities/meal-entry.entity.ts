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

import { User } from '../../users/entities/user.entity';

export enum MealEntryStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
}

export enum MealEntrySource {
  Ai = 'ai',
  Manual = 'manual',
}

@Entity({ name: 'meal_entries' })
@Index('IDX_meal_entries_user_local_date_status', [
  'userId',
  'localDate',
  'status',
])
@Check('CHK_meal_entries_schema_version_positive', '"schema_version" > 0')
@Check(
  'CHK_meal_entries_confirmation_consistent',
  `(
    "status" = 'draft'
    AND "local_date" IS NULL
    AND "confirmed_at" IS NULL
  ) OR (
    "status" = 'confirmed'
    AND "local_date" IS NOT NULL
    AND "confirmed_at" IS NOT NULL
  )`,
)
export class MealEntry {
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
    name: 'encrypted_data',
    type: 'text',
  })
  encryptedData!: string;

  @Column({
    name: 'local_date',
    type: 'date',
    nullable: true,
  })
  localDate!: string | null;

  @Column({
    type: 'enum',
    enum: MealEntryStatus,
    enumName: 'meal_entry_status_enum',
    default: MealEntryStatus.Draft,
  })
  status!: MealEntryStatus;

  @Column({
    type: 'enum',
    enum: MealEntrySource,
    enumName: 'meal_entry_source_enum',
  })
  source!: MealEntrySource;

  @Column({
    name: 'schema_version',
    type: 'smallint',
    default: 1,
  })
  schemaVersion!: number;

  @Column({
    name: 'confirmed_at',
    type: 'timestamptz',
    nullable: true,
  })
  confirmedAt!: Date | null;

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

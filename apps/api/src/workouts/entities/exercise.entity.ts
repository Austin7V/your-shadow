import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExerciseLevel {
  Gentle = 'gentle',
  Light = 'light',
  Standard = 'standard',
}

@Entity({ name: 'exercises' })
@Check('CHK_exercises_schema_version_positive', '"schema_version" > 0')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'text',
  })
  instructions!: string;

  @Column({
    type: 'enum',
    enum: ExerciseLevel,
    enumName: 'exercise_level_enum',
  })
  level!: ExerciseLevel;

  @Column({
    type: 'jsonb',
    default: '[]',
    name: 'target_areas',
  })
  targetAreas!: string[];

  @Column({
    type: 'jsonb',
    default: '{}',
  })
  workload!: Record<string, unknown>;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: 'jsonb',
    default: '{}',
    name: 'safety_metadata',
  })
  safetyMetadata!: Record<string, unknown>;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    name: 'asset_reference',
  })
  assetReference!: string | null;

  @Column({
    name: 'schema_version',
    type: 'smallint',
    default: 1,
  })
  schemaVersion!: number;

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

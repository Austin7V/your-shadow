import {
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

@Entity('refresh_tokens')
@Index('UQ_refresh_tokens_token_hash', ['tokenHash'], {
  unique: true,
})
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  tokenHash!: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

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

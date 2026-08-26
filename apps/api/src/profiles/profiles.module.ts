import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthConstraint } from './entities/health-constraint.entity';
import { Profile } from './entities/profile.entity';
import { WeightEntry } from './entities/weight-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, HealthConstraint, WeightEntry])],
})
export class ProfilesModule {}

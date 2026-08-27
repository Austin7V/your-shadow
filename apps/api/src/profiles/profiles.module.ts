import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SecurityModule } from '../security/security.module';
import { HealthConstraint } from './entities/health-constraint.entity';
import { Profile } from './entities/profile.entity';
import { WeightEntry } from './entities/weight-entry.entity';
import { ProfilesController } from './profiles.controller';
import { HealthConstraintsService } from './services/health-constraints.service';
import { ProfilesService } from './services/profiles.service';
import { WeightEntriesService } from './services/weight-entries.service';

@Module({
  imports: [
    AuthModule,
    SecurityModule,
    TypeOrmModule.forFeature([Profile, HealthConstraint, WeightEntry]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, WeightEntriesService, HealthConstraintsService],
})
export class ProfilesModule {}

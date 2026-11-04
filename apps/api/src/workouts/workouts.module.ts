import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Exercise } from './entities/exercise.entity';
import { ExerciseConstraintsService } from './services/exercise-constraints.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  providers: [ExerciseConstraintsService],
  exports: [ExerciseConstraintsService],
})
export class WorkoutsModule {}

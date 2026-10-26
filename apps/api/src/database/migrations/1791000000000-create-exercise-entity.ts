import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExerciseEntity1791000000000 implements MigrationInterface {
  name = 'CreateExerciseEntity1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."exercise_level_enum" AS ENUM('gentle', 'light', 'standard')`,
    );
    await queryRunner.query(
      `CREATE TABLE "exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "instructions" text NOT NULL, "level" "public"."exercise_level_enum" NOT NULL, "target_areas" jsonb NOT NULL DEFAULT '[]', "workload" jsonb NOT NULL DEFAULT '{}', "is_active" boolean NOT NULL DEFAULT true, "safety_metadata" jsonb NOT NULL DEFAULT '{}', "asset_reference" character varying(512), "schema_version" smallint NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_exercises_schema_version_positive" CHECK ("schema_version" > 0), CONSTRAINT "PK_exercises_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "exercises"`);
    await queryRunner.query(`DROP TYPE "public"."exercise_level_enum"`);
  }
}

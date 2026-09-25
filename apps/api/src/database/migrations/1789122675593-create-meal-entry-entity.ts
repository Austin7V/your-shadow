import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMealEntryEntity1789122675593 implements MigrationInterface {
  name = 'CreateMealEntryEntity1789122675593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."meal_entry_status_enum" AS ENUM('draft', 'confirmed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."meal_entry_source_enum" AS ENUM('ai', 'manual')`,
    );
    await queryRunner.query(
      `CREATE TABLE "meal_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "encrypted_data" text NOT NULL, "local_date" date, "status" "public"."meal_entry_status_enum" NOT NULL DEFAULT 'draft', "source" "public"."meal_entry_source_enum" NOT NULL, "schema_version" smallint NOT NULL DEFAULT '1', "confirmed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_meal_entries_confirmation_consistent" CHECK ((
        "status" = 'draft'
        AND "local_date" IS NULL
        AND "confirmed_at" IS NULL
      ) OR (
        "status" = 'confirmed'
        AND "local_date" IS NOT NULL
        AND "confirmed_at" IS NOT NULL
      )), CONSTRAINT "CHK_meal_entries_schema_version_positive" CHECK ("schema_version" > 0), CONSTRAINT "PK_b69a336a32fc8e1a770994db17d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_meal_entries_user_local_date_status" ON "meal_entries" ("user_id", "local_date", "status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_entries" ADD CONSTRAINT "FK_fb3ceb37a4f2d38c59053146a40" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meal_entries" DROP CONSTRAINT "FK_fb3ceb37a4f2d38c59053146a40"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_meal_entries_user_local_date_status"`,
    );
    await queryRunner.query(`DROP TABLE "meal_entries"`);
    await queryRunner.query(`DROP TYPE "public"."meal_entry_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."meal_entry_status_enum"`);
  }
}

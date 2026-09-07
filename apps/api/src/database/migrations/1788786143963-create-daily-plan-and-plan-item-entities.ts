import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyPlanAndPlanItemEntities1788786143963 implements MigrationInterface {
  name = 'CreateDailyPlanAndPlanItemEntities1788786143963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."plan_item_type_enum" AS ENUM('nutrition', 'workout', 'check_in')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_item_status_enum" AS ENUM('pending', 'completed', 'skipped', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_item_source_enum" AS ENUM('rules', 'ai', 'fallback')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_id" uuid NOT NULL, "type" "public"."plan_item_type_enum" NOT NULL, "status" "public"."plan_item_status_enum" NOT NULL DEFAULT 'pending', "item_order" smallint NOT NULL, "source" "public"."plan_item_source_enum" NOT NULL, "payload" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_plan_items_order_non_negative" CHECK ("item_order" >= 0), CONSTRAINT "PK_7095e15f5d5d331a9f170564d5b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_plan_items_plan_order" ON "plan_items"  ("plan_id", "item_order") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."daily_plan_status_enum" AS ENUM('active', 'completed', 'stale')`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "local_date" date NOT NULL, "status" "public"."daily_plan_status_enum" NOT NULL DEFAULT 'active', "schema_version" smallint NOT NULL DEFAULT '1', "summary" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_daily_plans_schema_version_positive" CHECK ("schema_version" > 0), CONSTRAINT "PK_ebf4c93c574708a8ba6919252df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_daily_plans_user_local_date" ON "daily_plans"  ("user_id", "local_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_items" ADD CONSTRAINT "FK_a27f8030dda3e574e606dc0ae81" FOREIGN KEY ("plan_id") REFERENCES "daily_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_plans" ADD CONSTRAINT "FK_a47107b15178fa4d736e029920c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_plans" DROP CONSTRAINT "FK_a47107b15178fa4d736e029920c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_items" DROP CONSTRAINT "FK_a27f8030dda3e574e606dc0ae81"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_daily_plans_user_local_date"`,
    );
    await queryRunner.query(`DROP TABLE "daily_plans"`);
    await queryRunner.query(`DROP TYPE "public"."daily_plan_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_plan_items_plan_order"`);
    await queryRunner.query(`DROP TABLE "plan_items"`);
    await queryRunner.query(`DROP TYPE "public"."plan_item_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."plan_item_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."plan_item_type_enum"`);
  }
}

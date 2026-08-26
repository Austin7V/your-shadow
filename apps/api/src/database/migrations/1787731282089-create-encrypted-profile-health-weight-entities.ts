import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEncryptedProfileHealthWeightEntities1787731282089 implements MigrationInterface {
  name = 'CreateEncryptedProfileHealthWeightEntities1787731282089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "encrypted_data" text NOT NULL, "onboarding_completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "health_constraints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "encrypted_data" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3b2dafd7d067a008ceb999118d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_health_constraints_user_active" ON "health_constraints"  ("user_id", "is_active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "weight_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "encrypted_data" text NOT NULL, "measured_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_31b8520819a1fde89cc47613dec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_weight_entries_user_measured_at" ON "weight_entries"  ("user_id", "measured_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "health_constraints" ADD CONSTRAINT "FK_7f79e7901633751571990840c73" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weight_entries" ADD CONSTRAINT "FK_565a2952209d6cf8da209f6c9c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "weight_entries" DROP CONSTRAINT "FK_565a2952209d6cf8da209f6c9c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "health_constraints" DROP CONSTRAINT "FK_7f79e7901633751571990840c73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_weight_entries_user_measured_at"`,
    );
    await queryRunner.query(`DROP TABLE "weight_entries"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_health_constraints_user_active"`,
    );
    await queryRunner.query(`DROP TABLE "health_constraints"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
  }
}

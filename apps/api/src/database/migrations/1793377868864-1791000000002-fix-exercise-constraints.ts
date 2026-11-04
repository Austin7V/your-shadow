import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixExerciseConstraints1793377868864 implements MigrationInterface {
  name = 'FixExerciseConstraints1793377868864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440001'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440002'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440004'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440007'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440010'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440014'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '[]') WHERE id = '550e8400-e29b-41d4-a716-446655440015'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440009"]') WHERE id = '550e8400-e29b-41d4-a716-446655440001'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440010"]') WHERE id = '550e8400-e29b-41d4-a716-446655440002'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440010"]') WHERE id = '550e8400-e29b-41d4-a716-446655440004'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440006"]') WHERE id = '550e8400-e29b-41d4-a716-446655440007'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440002"]') WHERE id = '550e8400-e29b-41d4-a716-446655440010'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440009"]') WHERE id = '550e8400-e29b-41d4-a716-446655440014'`,
    );
    await queryRunner.query(
      `UPDATE exercises SET safety_metadata = jsonb_set(safety_metadata, '{allowedReplacements}', '["550e8400-e29b-41d4-a716-446655440003"]') WHERE id = '550e8400-e29b-41d4-a716-446655440015'`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBeginnerExercises1791000000001 implements MigrationInterface {
  name = 'SeedBeginnerExercises1791000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exercises = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Push-ups',
        instructions: 'Place hands shoulder-width apart on the ground. Lower your body until your chest nearly touches the floor. Push back to the starting position. Keep your body in a straight line throughout.',
        level: 'light',
        targetAreas: ['chest', 'triceps', 'shoulders'],
        workload: { reps: 10, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'wrist-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440009'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Squats',
        instructions: 'Stand with feet shoulder-width apart. Lower your body by bending your knees and hips. Keep your chest up and weight in your heels. Return to standing position. Do not let knees go past your toes.',
        level: 'light',
        targetAreas: ['quadriceps', 'glutes', 'hamstrings'],
        workload: { reps: 15, sets: 3, rest: 90 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-extension', 'lower-back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440010'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Plank',
        instructions: 'Place forearms on the ground, elbows under shoulders. Lift your body to create a straight line from head to heels. Engage your core. Hold this position without sagging or lifting hips.',
        level: 'gentle',
        targetAreas: ['core', 'shoulders', 'back'],
        workload: { duration: 30 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['wrist-pain', 'lower-back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440011'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Lunges',
        instructions: 'Stand upright with feet hip-width apart. Step forward and lower your body until your front knee reaches 90 degrees. Push back to starting position. Alternate legs.',
        level: 'light',
        targetAreas: ['quadriceps', 'glutes', 'hamstrings', 'balance'],
        workload: { reps: 12, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-extension', 'balance-issues'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440002'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Jumping Jacks',
        instructions: 'Stand with feet together. Jump while spreading your feet shoulder-width apart and raising your arms above your head. Jump back to starting position.',
        level: 'standard',
        targetAreas: ['full-body', 'cardio'],
        workload: { reps: 20, sets: 2, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['high-impact', 'joint-pain', 'balance-issues'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440012'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Wall Sit',
        instructions: 'Lean against a wall with your back flat. Slide down until your knees are at 90 degrees. Keep your back against the wall throughout. Hold this position without moving.',
        level: 'gentle',
        targetAreas: ['quadriceps', 'glutes'],
        workload: { duration: 30 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440002'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'Glute Bridges',
        instructions: 'Lie on your back with knees bent and feet flat on the floor. Push through your heels to lift your hips. Squeeze your glutes at the top. Lower back down and repeat.',
        level: 'gentle',
        targetAreas: ['glutes', 'hamstrings', 'core'],
        workload: { reps: 15, sets: 3, rest: 45 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['lower-back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440006'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Bicep Curls (bodyweight)',
        instructions: 'Stand facing a wall or door frame. Grip the edge at shoulder height. Lean back keeping your body straight. Pull yourself up towards the frame. Lower and repeat.',
        level: 'light',
        targetAreas: ['biceps', 'shoulders'],
        workload: { reps: 8, sets: 3, rest: 90 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440003'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        name: 'Wall Push-ups',
        instructions: 'Stand arm-length away from a wall. Place hands on the wall at shoulder height. Lean in bending your elbows. Push back to starting position. Easier alternative to floor push-ups.',
        level: 'gentle',
        targetAreas: ['chest', 'triceps', 'shoulders'],
        workload: { reps: 15, sets: 2, rest: 45 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'wrist-pain', 'strength'],
          allowedReplacements: [],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Step-ups',
        instructions: 'Find a sturdy chair or bench. Step up with one leg pushing through your heel. Stand on top. Step back down. Alternate leading leg.',
        level: 'light',
        targetAreas: ['quadriceps', 'glutes', 'hamstrings'],
        workload: { reps: 12, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-extension', 'balance-issues'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440002'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'High Knees',
        instructions: 'Stand upright. Run in place while lifting your knees to waist height. Alternate legs in a quick tempo. Pump your arms naturally.',
        level: 'standard',
        targetAreas: ['cardio', 'quadriceps', 'hip-flexors'],
        workload: { duration: 30 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['high-impact', 'knee-pain', 'joint-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440012'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Marching in Place',
        instructions: 'Stand upright with good posture. Lift one knee toward your chest. Lower and lift the other knee. Continue alternating at a comfortable pace. Low-impact cardio option.',
        level: 'gentle',
        targetAreas: ['cardio', 'hip-flexors'],
        workload: { duration: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: [],
          allowedReplacements: [],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Superman Hold',
        instructions: 'Lie face down on the floor. Extend your arms and legs. Lift your chest, arms, and legs off the ground. Squeeze your back muscles. Hold this position.',
        level: 'light',
        targetAreas: ['back', 'glutes', 'core'],
        workload: { duration: 20 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['lower-back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440003'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Tricep Dips (chair)',
        instructions: 'Sit on the edge of a chair facing away from the seat. Grip the edge with hands. Lower your body by bending elbows. Push back to starting position.',
        level: 'light',
        targetAreas: ['triceps', 'shoulders', 'chest'],
        workload: { reps: 10, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'wrist-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440001'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Mountain Climbers',
        instructions: 'Start in a plank position. Bring one knee toward your chest quickly. Switch legs in a running motion. Keep your core engaged and body in a straight line.',
        level: 'standard',
        targetAreas: ['core', 'cardio', 'shoulders'],
        workload: { reps: 20, sets: 2, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['wrist-pain', 'shoulder-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440003'],
        },
        assetReference: null,
        schemaVersion: 1,
      },
    ];

    for (const exercise of exercises) {
      await queryRunner.query(
        `INSERT INTO exercises
        (id, name, instructions, level, target_areas, workload, is_active, safety_metadata, asset_reference, schema_version, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING`,
        [
          exercise.id,
          exercise.name,
          exercise.instructions,
          exercise.level,
          JSON.stringify(exercise.targetAreas),
          JSON.stringify(exercise.workload),
          exercise.isActive,
          JSON.stringify(exercise.safetyMetadata),
          exercise.assetReference,
          exercise.schemaVersion,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM exercises WHERE id IN (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005',
        '550e8400-e29b-41d4-a716-446655440006',
        '550e8400-e29b-41d4-a716-446655440007',
        '550e8400-e29b-41d4-a716-446655440008',
        '550e8400-e29b-41d4-a716-446655440009',
        '550e8400-e29b-41d4-a716-446655440010',
        '550e8400-e29b-41d4-a716-446655440011',
        '550e8400-e29b-41d4-a716-446655440012',
        '550e8400-e29b-41d4-a716-446655440013',
        '550e8400-e29b-41d4-a716-446655440014',
        '550e8400-e29b-41d4-a716-446655440015'
      )`,
    );
  }
}

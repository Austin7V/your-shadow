import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBeginnerExercises1791000000001
  implements MigrationInterface
{
  name = 'SeedBeginnerExercises1791000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exercises = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Отжимания от пола',
        instructions:
          'Встаньте в позицию планки с руками на ширине плеч. Опустите тело до тех пор, пока грудь почти не коснётся пола. Вернитесь в исходное положение, выпрямив руки. Во время упражнения держите тело прямой линией.',
        level: 'light',
        targetAreas: ['грудь', 'трицепсы', 'плечи'],
        workload: { reps: 10, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'wrist-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440009'],
          notes:
            'Если больны плечи или запястья, начните с отжиманий от стены или колен.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Приседания',
        instructions:
          'Встаньте, расставив ноги на ширину плеч. Согните колени и бёдра, опуская бедра вниз. Держите спину прямой, вес распределяйте на пятки. Колени не должны выходить за носки. Вернитесь в исходное положение.',
        level: 'light',
        targetAreas: ['квадрицепсы', 'ягодицы', 'подколенные сухожилия'],
        workload: { reps: 15, sets: 3, rest: 90 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-pain', 'lower-back-pain'],
          allowedReplacements: [
            '550e8400-e29b-41d4-a716-446655440010',
          ],
          notes:
            'При боли в коленях или спине замените на приседания у стены или степ-апы.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Планка',
        instructions:
          'Встаньте на предплечья, локти расположены под плечами. Поднимите тело так, чтобы оно образовало прямую линию от головы до пяток. Напрягите мышцы кора. Держите позицию без проседания спины.',
        level: 'gentle',
        targetAreas: ['кор', 'плечи', 'спина'],
        workload: { duration: 30 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['wrist-pain', 'lower-back-pain'],
          allowedReplacements: [],
          notes:
            'Это базовое упражнение на выносливость. Удерживайте максимально возможное время.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Выпады',
        instructions:
          'Встаньте прямо, ноги на ширине плеч. Сделайте шаг вперед и согните колени, опуская бедро задней ноги к полу. Передняя нога должна быть согнута под 90 градусов. Вернитесь и повторите на другую ногу.',
        level: 'light',
        targetAreas: [
          'квадрицепсы',
          'ягодицы',
          'подколенные сухожилия',
          'баланс',
        ],
        workload: { reps: 12, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-pain', 'balance-issues'],
          allowedReplacements: [
            '550e8400-e29b-41d4-a716-446655440010',
          ],
          notes:
            'Хорошее упражнение для баланса. Если скользко, выполняйте возле стены.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Прыгающие джеки',
        instructions:
          'Встаньте, ноги вместе. Прыгните, одновременно разводя ноги в стороны и поднимая руки вверх. Вернитесь в исходное положение. Повторяйте в быстром темпе.',
        level: 'standard',
        targetAreas: ['общая физическая подготовка', 'кардио'],
        workload: { reps: 20, sets: 2, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['high-impact', 'joint-pain', 'balance-issues'],
          allowedReplacements: [
            '550e8400-e29b-41d4-a716-446655440012',
          ],
          notes:
            'Прыжки — высокая нагрузка. При проблемах с суставами используйте низкоударный вариант.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Приседание у стены',
        instructions:
          'Прислонитесь спиной к стене. Слегка отойдите ногами вперед. Опускайтесь, сгибая колени, пока они не образуют угол 90 градусов. Спину держите прижатой к стене. Удерживайте позицию без движения.',
        level: 'gentle',
        targetAreas: ['квадрицепсы', 'ягодицы'],
        workload: { duration: 30 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-pain'],
          allowedReplacements: [],
          notes:
            'Безопасная альтернатива приседаниям при боли в коленях.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'Мостик для ягодиц',
        instructions:
          'Лягте на спину, колени согнуты, стопы на полу. Напрягая ягодицы, поднимите бёдра вверх, образуя прямую линию от коленей до плеч. Задержитесь в верхней позиции. Опустите и повторите.',
        level: 'gentle',
        targetAreas: ['ягодицы', 'подколенные сухожилия', 'кор'],
        workload: { reps: 15, sets: 3, rest: 45 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['lower-back-pain'],
          allowedReplacements: [
            '550e8400-e29b-41d4-a716-446655440006',
          ],
          notes:
            'Мягкое упражнение для ягодиц. Не перегибайте спину в верхней позиции.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Подтягивания на дверном проёме',
        instructions:
          'Встаньте лицом к дверному проёму. Ухватитесь за верхний край. Отклонитесь назад, сохраняя прямое тело. Подтягивайте себя вверх, сгибая руки в локтях. Медленно опускайтесь и повторите.',
        level: 'light',
        targetAreas: ['бицепсы', 'плечи', 'спина'],
        workload: { reps: 8, sets: 3, rest: 90 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440003'],
          notes: 'Требует стабильный дверной проём. Сложное упражнение.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        name: 'Отжимания от стены',
        instructions:
          'Встаньте лицом к стене на расстоянии вытянутой руки. Поместите ладони на стену на уровне плеч. Опускайтесь к стене, сгибая локти. Отталкивайтесь обратно. Это облегчённый вариант отжиманий.',
        level: 'gentle',
        targetAreas: ['грудь', 'трицепсы', 'плечи'],
        workload: { reps: 15, sets: 2, rest: 45 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'wrist-pain', 'strength'],
          allowedReplacements: [],
          notes:
            'Идеальный вариант для новичков или восстановления после травмы.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Степ-апы',
        instructions:
          'Найдите прочный стул или скамью. Сделайте шаг вверх на сиденье одной ногой. Полностью встаньте, затем спустите вторую ногу. Чередуйте ноги поочередно.',
        level: 'light',
        targetAreas: ['квадрицепсы', 'ягодицы', 'подколенные сухожилия'],
        workload: { reps: 12, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['knee-pain', 'balance-issues'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440002'],
          notes: 'Хорошая альтернатива приседаниям для ног.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Высокие колени на месте',
        instructions:
          'Стойте прямо. Поднимайте колени до уровня талии поочередно в быстром темпе. Продолжайте как бег на месте. Размахивайте руками естественно.',
        level: 'standard',
        targetAreas: ['кардио', 'квадрицепсы', 'сгибатели бёдер'],
        workload: { duration: 30 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['high-impact', 'knee-pain', 'joint-pain'],
          allowedReplacements: [
            '550e8400-e29b-41d4-a716-446655440012',
          ],
          notes: 'Интенсивное кардио упражнение. Низкоударный вариант — марш.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Марш на месте',
        instructions:
          'Стойте прямо с хорошей осанкой. Поднимайте одно колено к груди. Опускайте и поднимайте другое. Чередуйте ноги в комфортном темпе. Низкоударное кардио.',
        level: 'gentle',
        targetAreas: ['кардио', 'сгибатели бёдер'],
        workload: { duration: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: [],
          allowedReplacements: [],
          notes:
            'Самое безопасное кардио упражнение. Подходит для всех уровней.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Супермен',
        instructions:
          'Лягте лицом вниз. Вытяните руки и ноги. Одновременно поднимите грудь, руки и ноги от пола. Напрягите мышцы спины и ягодиц. Удерживайте позицию.',
        level: 'light',
        targetAreas: ['спина', 'ягодицы', 'кор'],
        workload: { duration: 20 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['lower-back-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440006'],
          notes:
            'Укрепляет спину. При боли в пояснице не поднимайте ноги высоко.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Отжимания на стуле',
        instructions:
          'Сядьте на стул спиной к сиденью. Возьмитесь руками за край сиденья. Опускайте тело, сгибая локти. Отталкивайтесь руками, возвращаясь в исходное положение.',
        level: 'light',
        targetAreas: ['трицепсы', 'плечи', 'грудь'],
        workload: { reps: 10, sets: 3, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['shoulder-pain', 'wrist-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440009'],
          notes:
            'Хорошее упражнение для трицепсов. Стул должен быть прочным.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Альпинист',
        instructions:
          'Встаньте в позицию планки. Быстро подтягивайте колени к груди поочередно, как при беге. Держите тело прямым и кор напряженным на протяжении упражнения.',
        level: 'standard',
        targetAreas: ['кор', 'кардио', 'плечи'],
        workload: { reps: 20, sets: 2, rest: 60 },
        isActive: true,
        safetyMetadata: {
          constraintCodes: ['wrist-pain', 'shoulder-pain'],
          allowedReplacements: ['550e8400-e29b-41d4-a716-446655440003'],
          notes:
            'Интенсивное упражнение. При боли в запястьях выполняйте медленнее.',
        },
        assetReference: null,
        schemaVersion: 1,
      },
    ];

    for (const exercise of exercises) {
      await queryRunner.query(
        `INSERT INTO exercises
        (id, name, instructions, level, target_areas, workload, is_active,
         safety_metadata, asset_reference, schema_version, created_at, updated_at)
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
    const ids = [
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
      '550e8400-e29b-41d4-a716-446655440015',
    ];

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    await queryRunner.query(`DELETE FROM exercises WHERE id IN (${placeholders})`, ids);
  }
}

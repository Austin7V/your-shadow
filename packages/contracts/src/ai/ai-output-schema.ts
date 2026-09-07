import { z } from "zod";

export const AI_OUTPUT_SCHEMA_VERSIONS = {
    dailyPlan: 1,
    mealDraft: 1,
    substitution: 1,
    dailySummary: 1,
} as const;

export function createVersionedAiOutputSchema<
    const TVersion extends number,
    TShape extends z.ZodRawShape,
>(schemaVersion: TVersion, shape: TShape) {
    return z.strictObject({
        ...shape,

        // Версия добавляется последней, чтобы её нельзя было переопределить через shape.
        schemaVersion: z.literal(schemaVersion),
    });
}
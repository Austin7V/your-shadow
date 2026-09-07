import { z } from "zod";

import {
    AI_OUTPUT_SCHEMA_VERSIONS,
    createVersionedAiOutputSchema,
} from "./ai-output-schema";

export const substitutionOutputSchema = createVersionedAiOutputSchema(
    AI_OUTPUT_SCHEMA_VERSIONS.substitution,
    {
        originalExerciseId: z.string().trim().min(1).max(64),
        replacementExerciseId: z.string().trim().min(1).max(64),
        reason: z.literal("too_hard"),
        explanation: z.string().trim().min(1).max(300),
    },
);

export const SUBSTITUTION_RESPONSE_FORMAT = {
    name: "substitution_v1",
    schema: z.toJSONSchema(substitutionOutputSchema),
} as const;

export type SubstitutionOutput = z.infer<typeof substitutionOutputSchema>;
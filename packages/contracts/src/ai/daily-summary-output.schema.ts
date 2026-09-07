import { z } from "zod";

import {
    AI_OUTPUT_SCHEMA_VERSIONS,
    createVersionedAiOutputSchema,
} from "./ai-output-schema";

export const dailySummaryOutputSchema = createVersionedAiOutputSchema(
    AI_OUTPUT_SCHEMA_VERSIONS.dailySummary,
    {
        message: z.string().trim().min(1).max(500),
        completedFacts: z
            .array(z.string().trim().min(1).max(160))
            .max(12),
        tomorrowFocus: z.string().trim().min(1).max(200),
    },
);

export const DAILY_SUMMARY_RESPONSE_FORMAT = {
    name: "daily_summary_v1",
    schema: z.toJSONSchema(dailySummaryOutputSchema),
} as const;

export type DailySummaryOutput = z.infer<typeof dailySummaryOutputSchema>;
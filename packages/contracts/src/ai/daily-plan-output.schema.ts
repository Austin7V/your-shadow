import { z } from "zod";

import {
    AI_OUTPUT_SCHEMA_VERSIONS,
    createVersionedAiOutputSchema,
} from "./ai-output-schema";

export const DAILY_PLAN_ITEM_TYPES = [
    "nutrition",
    "workout",
    "check_in",
] as const;

export const dailyPlanItemSchema = z.strictObject({
    type: z.enum(DAILY_PLAN_ITEM_TYPES),
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(500),

    source: z.literal("ai"),
    explanation: z.string().trim().min(1).max(300).nullable(),
});

export const dailyPlanOutputSchema = createVersionedAiOutputSchema(
    AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan,
    {
        items: z.array(dailyPlanItemSchema).min(1).max(4),
    },
);

export const DAILY_PLAN_RESPONSE_FORMAT = {
    name: "daily_plan_v1",
    schema: z.toJSONSchema(dailyPlanOutputSchema),
} as const;

export type DailyPlanItemOutput = z.infer<typeof dailyPlanItemSchema>;
export type DailyPlanOutput = z.infer<typeof dailyPlanOutputSchema>;
import { z } from "zod";

export const AI_SCHEMA_VALIDATION_ERROR_CODE =
    "AI_SCHEMA_VALIDATION_FAILED" as const;

export interface AiSchemaValidationIssue {
    code: string;
    path: string;
}

export class AiSchemaValidationError extends Error {
    readonly code = AI_SCHEMA_VALIDATION_ERROR_CODE;

    constructor(public readonly issues: readonly AiSchemaValidationIssue[]) {
        super("AI output failed schema validation");

        this.name = AiSchemaValidationError.name;
    }
}

export function mapAiSchemaValidationError(
    error: z.ZodError,
): AiSchemaValidationError {
    const issues = error.issues.map((issue) => ({
        code: issue.code,
        path:
            issue.path.length === 0
                ? "$"
                : `$.${issue.path.map(String).join(".")}`,
    }));

    return new AiSchemaValidationError(issues);
}

export function validateAiOutput<TSchema extends z.ZodType>(
    schema: TSchema,
    input: unknown,
): z.output<TSchema> {
    const result = schema.safeParse(input);

    if (!result.success) {
        throw mapAiSchemaValidationError(result.error);
    }

    return result.data;
}
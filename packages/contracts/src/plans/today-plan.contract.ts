import type { DailyPlanItemOutput } from "../ai/daily-plan-output.schema";

export const DAILY_PLAN_STATUSES = ["active", "completed", "stale"] as const;

export type DailyPlanStatusValue = (typeof DAILY_PLAN_STATUSES)[number];

export const PLAN_ITEM_STATUSES = [
  "pending",
  "completed",
  "skipped",
  "blocked",
] as const;

export type PlanItemStatusValue = (typeof PLAN_ITEM_STATUSES)[number];

export const PLAN_ITEM_SOURCES = ["rules", "ai", "fallback"] as const;

export type PlanItemSourceValue = (typeof PLAN_ITEM_SOURCES)[number];

export const DAILY_PLAN_GENERATION_MODES = ["ai", "rules", "fallback"] as const;

export type DailyPlanGenerationModeValue =
  (typeof DAILY_PLAN_GENERATION_MODES)[number];

export const ALLOWED_PLAN_ITEM_STATUS_UPDATES = [
  "completed",
  "skipped",
] as const;

export type AllowedPlanItemStatusUpdate =
  (typeof ALLOWED_PLAN_ITEM_STATUS_UPDATES)[number];

export type TodayPlanItemPayload = Pick<
  DailyPlanItemOutput,
  "title" | "description" | "explanation"
>;

export type TodayPlanItemResponse = {
  id: string;
  type: DailyPlanItemOutput["type"];
  status: PlanItemStatusValue;
  order: number;
  source: PlanItemSourceValue;
  payload: TodayPlanItemPayload;
  createdAt: string;
  updatedAt: string;
};

export type TodayPlanResponse = {
  id: string;
  localDate: string;
  status: DailyPlanStatusValue;
  schemaVersion: number;
  summary: string | null;
  items: TodayPlanItemResponse[];
  createdAt: string;
  updatedAt: string;
};

export type TodayPlanGenerationResponse = {
  mode: DailyPlanGenerationModeValue;
  userMessage: string | null;
};

export type TodayPlanNotGeneratedResponse = {
  state: "not_generated";
  localDate: string;
  plan: null;
  generation: null;
};

export type TodayPlanReadyResponse = {
  state: "ready";
  localDate: string;
  plan: TodayPlanResponse;
  generation: TodayPlanGenerationResponse;
};

export type GetTodayPlanResponse =
  | TodayPlanNotGeneratedResponse
  | TodayPlanReadyResponse;

export type GenerateTodayPlanResponse = TodayPlanReadyResponse;

export type UpdateTodayPlanItemStatusRequest = {
  status: AllowedPlanItemStatusUpdate;
};

export type UpdateTodayPlanItemStatusResponse = TodayPlanItemResponse;

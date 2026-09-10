"use client";

import type {
  AllowedPlanItemStatusUpdate,
  GenerateTodayPlanResponse,
  GetTodayPlanResponse,
  UpdateTodayPlanItemStatusResponse,
} from "@/lib/contracts";
import useSWR from "swr";

import {
  generateTodayPlan,
  getTodayPlanWithRefresh,
  updateTodayPlanItemStatus,
} from "@/lib/api/today-plan-api";
import { ApiRequestError } from "@/lib/api/auth-api";

export const TODAY_PLAN_SWR_KEY = "/api/plans/today";

export function useTodayPlan() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    GetTodayPlanResponse,
    ApiRequestError
  >(TODAY_PLAN_SWR_KEY, getTodayPlanWithRefresh, {
    shouldRetryOnError: (requestError) => requestError.statusCode !== 401,
  });

  async function generate(): Promise<GenerateTodayPlanResponse> {
    const response = await generateTodayPlan();

    await mutate(response, {
      revalidate: false,
    });

    return response;
  }

  async function updateItemStatus(
    itemId: string,
    status: AllowedPlanItemStatusUpdate,
  ): Promise<UpdateTodayPlanItemStatusResponse> {
    const response = await updateTodayPlanItemStatus(itemId, {
      status,
    });

    await mutate();

    return response;
  }

  return {
    data,
    error,
    isLoading,
    isValidating,
    generate,
    updateItemStatus,
    mutate,
  };
}

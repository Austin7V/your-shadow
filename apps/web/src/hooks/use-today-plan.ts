"use client";

import { useRef } from "react";
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
  const generationRequestRef =
    useRef<Promise<GenerateTodayPlanResponse> | null>(null);

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    GetTodayPlanResponse,
    ApiRequestError
  >(TODAY_PLAN_SWR_KEY, getTodayPlanWithRefresh, {
    shouldRetryOnError: (requestError) => requestError.statusCode !== 401,
  });

  function generate(): Promise<GenerateTodayPlanResponse> {
    if (generationRequestRef.current !== null) {
      return generationRequestRef.current;
    }

    const generationRequest = generateTodayPlan()
      .then(async (response) => {
        await mutate(response, {
          revalidate: true,
        });

        return response;
      })
      .finally(() => {
        generationRequestRef.current = null;
      });

    generationRequestRef.current = generationRequest;

    return generationRequest;
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

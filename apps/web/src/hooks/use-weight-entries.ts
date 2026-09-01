"use client";

import useSWR from "swr";
import { getWeightEntries } from "@/lib/api/profile-api";
import type { WeightEntryResponse } from "@/lib/contracts";

export function useWeightEntries() {
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    } = useSWR<WeightEntryResponse[], Error>(
        "/api/profile/weights",
        getWeightEntries,
    );

    return {
        weightEntries: data ?? [],
        error: error ?? null,
        isLoading,
        isValidating,
        refreshWeightEntries: mutate,
    };
}
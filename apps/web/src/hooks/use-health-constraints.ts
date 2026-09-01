"use client";

import useSWR from "swr";
import {
    getHealthConstraints,
} from "@/lib/api/profile-api";
import type {
    HealthConstraintResponse,
} from "@/lib/contracts";

export function useHealthConstraints() {
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    } = useSWR<HealthConstraintResponse[], Error>(
        "/api/profile/health-constraints",
        getHealthConstraints,
    );

    return {
        healthConstraints: data ?? [],
        error: error ?? null,
        isLoading,
        isValidating,
        refreshHealthConstraints: mutate,
    };
}
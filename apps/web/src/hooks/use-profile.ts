"use client";

import useSWR from "swr";
import { getCurrentProfile } from "@/lib/api/profile-api";
import type { ProfileResponse } from "@/lib/contracts";

export function useProfile() {
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    } = useSWR<ProfileResponse, Error>(
        "/api/profile",
        getCurrentProfile,
    );

    return {
        profile: data ?? null,
        error: error ?? null,
        isLoading,
        isValidating,
        refreshProfile: mutate,
    };
}
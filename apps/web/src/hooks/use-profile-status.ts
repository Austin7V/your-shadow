"use client";

import useSWR from "swr";
import { hasCurrentProfile } from "@/lib/api/profile-api";

export function useProfileStatus() {
  const { data, error, isLoading, mutate } = useSWR<boolean, Error>(
    "/api/profile/status",
    hasCurrentProfile,
    {
      revalidateOnFocus: true,
      errorRetryCount: 2,
    },
  );

  return {
    hasProfile: data,
    isLoading,
    error: error ?? null,
    refreshProfileStatus: mutate,
  };
}

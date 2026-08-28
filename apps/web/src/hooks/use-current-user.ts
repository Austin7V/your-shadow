"use client";

import useSWR from "swr";
import type { CurrentUserResponse } from "@/lib/contracts";
import { ApiRequestError, getCurrentUserWithRefresh } from "@/lib/api/auth-api";

export type SessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export function useCurrentUser() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    CurrentUserResponse,
    Error
  >("/api/auth/me", () => getCurrentUserWithRefresh(), {
    revalidateOnFocus: true,
    errorRetryCount: 2,
    shouldRetryOnError: (requestError) => {
      return !(
        requestError instanceof ApiRequestError &&
        requestError.statusCode === 401
      );
    },
  });

  const isUnauthenticated =
    error instanceof ApiRequestError && error.statusCode === 401;

  const status: SessionStatus = isLoading
    ? "loading"
    : data
      ? "authenticated"
      : isUnauthenticated
        ? "unauthenticated"
        : "error";

  const refreshCurrentUser = async (): Promise<
    CurrentUserResponse | undefined
  > => {
    return mutate();
  };

  return {
    user: data ?? null,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated,
    isValidating,
    error: status === "error" ? error : null,
    refreshCurrentUser,
  };
}

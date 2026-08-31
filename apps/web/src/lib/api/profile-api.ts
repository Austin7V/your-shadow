import type {
  CreateHealthConstraintRequest,
  CreateProfileRequest,
  CreateWeightEntryRequest,
} from "@/lib/contracts";
import {
  ApiRequestError,
  refreshSession,
} from "@/lib/api/auth-api";

type ApiErrorBody = {
  message?: unknown;
};

const readErrorMessage = async (
    response: Response,
    fallbackMessage: string,
): Promise<string> => {
  try {
    const body = (await response.json()) as unknown;

    if (typeof body !== "object" || body === null) {
      return fallbackMessage;
    }

    const { message } = body as ApiErrorBody;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      const messages = message.filter(
          (value): value is string =>
              typeof value === "string",
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
};

const requestWithRefresh = async (
    createRequest: () => Promise<Response>,
): Promise<Response> => {
  let response = await createRequest();

  if (response.status === 401) {
    await refreshSession();
    response = await createRequest();
  }

  return response;
};

const postJson = async <TBody>(
    path: string,
    body: TBody,
    fallbackErrorMessage: string,
): Promise<void> => {
  const serializedBody = JSON.stringify(body);

  const response = await requestWithRefresh(() =>
      fetch(`/api${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: serializedBody,
      }),
  );

  if (!response.ok) {
    throw new ApiRequestError(
        await readErrorMessage(
            response,
            fallbackErrorMessage,
        ),
        response.status,
    );
  }
};

export const hasCurrentProfile =
    async (): Promise<boolean> => {
      const response = await requestWithRefresh(() =>
          fetch("/api/profile", {
            method: "GET",
            credentials: "include",
          }),
      );

      if (response.ok) {
        return true;
      }

      if (response.status === 404) {
        return false;
      }

      throw new ApiRequestError(
          await readErrorMessage(
              response,
              "Unable to load your profile.",
          ),
          response.status,
      );
    };

export const createProfile = (
    request: CreateProfileRequest,
): Promise<void> => {
  return postJson(
      "/profile",
      request,
      "Unable to create your profile.",
  );
};

export const createWeightEntry = (
    request: CreateWeightEntryRequest,
): Promise<void> => {
  return postJson(
      "/profile/weights",
      request,
      "Unable to save your current weight.",
  );
};

export const createHealthConstraint = (
    request: CreateHealthConstraintRequest,
): Promise<void> => {
  return postJson(
      "/profile/health-constraints",
      request,
      "Unable to save a health constraint.",
  );
};
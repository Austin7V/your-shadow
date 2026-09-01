import type {
    CreateHealthConstraintRequest,
    CreateProfileRequest,
    CreateWeightEntryRequest,
    HealthConstraintResponse,
    ProfileResponse,
    UpdateHealthConstraintRequest,
    UpdateProfileRequest,
    WeightEntryResponse,
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

const throwForFailedResponse = async (
    response: Response,
    fallbackErrorMessage: string,
): Promise<void> => {
    if (response.ok) {
        return;
    }

    throw new ApiRequestError(
        await readErrorMessage(
            response,
            fallbackErrorMessage,
        ),
        response.status,
    );
};

const getJson = async <TResponse>(
    path: string,
    fallbackErrorMessage: string,
): Promise<TResponse> => {
    const response = await requestWithRefresh(() =>
        fetch(`/api${path}`, {
            method: "GET",
            credentials: "include",
        }),
    );

    await throwForFailedResponse(
        response,
        fallbackErrorMessage,
    );

    return (await response.json()) as TResponse;
};

const sendJson = async <TBody>(
    method: "POST" | "PATCH",
    path: string,
    body: TBody,
    fallbackErrorMessage: string,
): Promise<void> => {
    const serializedBody = JSON.stringify(body);

    const response = await requestWithRefresh(() =>
        fetch(`/api${path}`, {
            method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: serializedBody,
        }),
    );

    await throwForFailedResponse(
        response,
        fallbackErrorMessage,
    );
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

export const getCurrentProfile =
    (): Promise<ProfileResponse> => {
        return getJson(
            "/profile",
            "Unable to load your profile.",
        );
    };

export const updateCurrentProfile = (
    request: UpdateProfileRequest,
): Promise<void> => {
    return sendJson(
        "PATCH",
        "/profile",
        request,
        "Unable to update your profile.",
    );
};

export const getWeightEntries =
    (): Promise<WeightEntryResponse[]> => {
        return getJson(
            "/profile/weights",
            "Unable to load your weight history.",
        );
    };

export const getHealthConstraints =
    (): Promise<HealthConstraintResponse[]> => {
        return getJson(
            "/profile/health-constraints",
            "Unable to load your health constraints.",
        );
    };

export const createProfile = (
    request: CreateProfileRequest,
): Promise<void> => {
    return sendJson(
        "POST",
        "/profile",
        request,
        "Unable to create your profile.",
    );
};

export const createWeightEntry = (
    request: CreateWeightEntryRequest,
): Promise<void> => {
    return sendJson(
        "POST",
        "/profile/weights",
        request,
        "Unable to save your current weight.",
    );
};

export const createHealthConstraint = (
    request: CreateHealthConstraintRequest,
): Promise<void> => {
    return sendJson(
        "POST",
        "/profile/health-constraints",
        request,
        "Unable to save a health constraint.",
    );
};

export const updateHealthConstraint = (
    constraintId: string,
    request: UpdateHealthConstraintRequest,
): Promise<void> => {
    return sendJson(
        "PATCH",
        `/profile/health-constraints/${encodeURIComponent(
            constraintId,
        )}`,
        request,
        "Unable to update the health constraint.",
    );
};
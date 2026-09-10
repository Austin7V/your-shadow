import { ApiRequestError, refreshSession } from "@/lib/api/auth-api";
import type {
  GenerateTodayPlanResponse,
  GetTodayPlanResponse,
  UpdateTodayPlanItemStatusRequest,
  UpdateTodayPlanItemStatusResponse,
} from "@/lib/contracts";

interface ApiErrorBody {
  message?: string | string[];
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && "message" in value;
}

function resolveErrorMessage(body: unknown): string {
  if (!isApiErrorBody(body)) {
    return "The request could not be completed.";
  }

  if (Array.isArray(body.message)) {
    return body.message.join(" ");
  }

  if (typeof body.message === "string") {
    return body.message;
  }

  return "The request could not be completed.";
}

async function parseErrorBody(response: Response): Promise<unknown> {
  try {
    const body: unknown = await response.json();

    return body;
  } catch {
    return null;
  }
}

async function assertSuccessfulResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  const body = await parseErrorBody(response);

  throw new ApiRequestError(resolveErrorMessage(body), response.status);
}

async function requestJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const sendRequest = (): Promise<Response> =>
    fetch(`/api${path}`, {
      ...init,
      credentials: "include",
    });

  let response = await sendRequest();

  if (response.status === 401) {
    await refreshSession();
    response = await sendRequest();
  }

  await assertSuccessfulResponse(response);

  const body: unknown = await response.json();

  return body as TResponse;
}

export function getTodayPlan(): Promise<GetTodayPlanResponse> {
  return requestJson<GetTodayPlanResponse>("/plans/today");
}

export function getTodayPlanWithRefresh(): Promise<GetTodayPlanResponse> {
  return getTodayPlan();
}

export function generateTodayPlan(): Promise<GenerateTodayPlanResponse> {
  return requestJson<GenerateTodayPlanResponse>("/plans/today/generate", {
    method: "POST",
  });
}

export function updateTodayPlanItemStatus(
  itemId: string,
  request: UpdateTodayPlanItemStatusRequest,
): Promise<UpdateTodayPlanItemStatusResponse> {
  return requestJson<UpdateTodayPlanItemStatusResponse>(
    `/plans/today/items/${encodeURIComponent(itemId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
}

export function getTodayPlanErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return "Something went wrong while loading your plan.";
}

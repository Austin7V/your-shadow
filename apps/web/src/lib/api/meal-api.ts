import { ApiRequestError, refreshSession } from "@/lib/api/auth-api";
import type {
  ConfirmMealRequest,
  ConfirmMealResponse,
  ParseMealRequest,
  ParseMealResponse,
} from "@/lib/contracts";

export async function parseMeal(
  request: ParseMealRequest,
): Promise<ParseMealResponse> {
  const sendRequest = () =>
    fetch("/api/meals/parse", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

  let response = await sendRequest();

  if (response.status === 401) {
    await refreshSession();
    response = await sendRequest();
  }

  if (!response.ok) {
    throw new ApiRequestError("Unable to parse this meal.", response.status);
  }

  return (await response.json()) as ParseMealResponse;
}

export function getMealParsingErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    if (error.statusCode === 401) {
      return "Your session has expired. Please sign in again.";
    }
  }

  return "We couldn't parse this meal right now. Your description is still here; please try again.";
}

export async function confirmMeal(
  meal: ConfirmMealRequest,
  requestId: string,
): Promise<ConfirmMealResponse> {
  const send = (): Promise<Response> =>
    fetch("/api/meals/confirm", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify(meal),
    });

  let response = await send();

  if (response.status === 401) {
    await refreshSession();
    response = await send();
  }

  if (!response.ok) {
    throw new ApiRequestError("Unable to save this meal.", response.status);
  }

  return (await response.json()) as ConfirmMealResponse;
}

export function getMealConfirmationErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 400) {
      return "Check the meal details and try again.";
    }

    if (error.statusCode === 401) {
      return "Your session has expired. Please sign in again.";
    }
  }

  return "We couldn't confirm whether the meal was saved. Please check before trying again.";
}

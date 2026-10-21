import { ApiRequestError, refreshSession } from "@/lib/api/auth-api";
import type {
  DailyNutritionTotalsResponse,
  ListMealsResponse,
  MealEntryResponse,
  UpdateMealRequest,
} from "@/lib/contracts";

async function sendMealRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const send = (): Promise<Response> =>
    fetch(`/api${path}`, {
      ...init,
      credentials: "include",
    });

  let response = await send();

  if (response.status === 401) {
    await refreshSession();
    response = await send();
  }

  if (!response.ok) {
    throw new ApiRequestError(
      "Unable to load or update meals.",
      response.status,
    );
  }

  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json();
  return body as T;
}

export async function listMealsByDate(
  date: string,
): Promise<ListMealsResponse> {
  const response = await sendMealRequest(
    `/meals?date=${encodeURIComponent(date)}`,
  );

  return readJson<ListMealsResponse>(response);
}

export async function getDailyNutritionTotals(
  date: string,
): Promise<DailyNutritionTotalsResponse> {
  const response = await sendMealRequest(
    `/meals/totals?date=${encodeURIComponent(date)}`,
  );

  return readJson<DailyNutritionTotalsResponse>(response);
}

export async function getMeal(id: string): Promise<MealEntryResponse> {
  const response = await sendMealRequest(`/meals/${encodeURIComponent(id)}`);

  return readJson<MealEntryResponse>(response);
}

export async function updateMeal(
  id: string,
  meal: UpdateMealRequest,
): Promise<MealEntryResponse> {
  const response = await sendMealRequest(`/meals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meal),
  });

  return readJson<MealEntryResponse>(response);
}

export async function deleteMeal(id: string): Promise<void> {
  await sendMealRequest(`/meals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getMealManagementErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (error.statusCode === 404) {
      return "This meal is no longer available. Refresh the list.";
    }
  }

  return "Could not load or update your meals. Please try again.";
}

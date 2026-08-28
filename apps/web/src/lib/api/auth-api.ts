import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/lib/contracts";

type ApiErrorBody = {
  message?: unknown;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const getApiErrorMessage = (body: unknown): string => {
  if (typeof body !== "object" || body === null) {
    return "Something went wrong. Please try again.";
  }

  const { message } = body as ApiErrorBody;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (value): value is string => typeof value === "string",
    );

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return "Something went wrong. Please try again.";
};

const assertSuccessfulResponse = async (response: Response): Promise<void> => {
  if (response.ok) {
    return;
  }

  let responseBody: unknown = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  throw new ApiRequestError(getApiErrorMessage(responseBody), response.status);
};

const postJson = async <TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> => {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  await assertSuccessfulResponse(response);

  return (await response.json()) as TResponse;
};

const getJson = async <TResponse>(path: string): Promise<TResponse> => {
  const response = await fetch(`/api${path}`, {
    method: "GET",
    credentials: "include",
  });

  await assertSuccessfulResponse(response);

  return (await response.json()) as TResponse;
};

const postWithoutResponse = async (path: string): Promise<void> => {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
  });

  await assertSuccessfulResponse(response);
};

export const registerUser = (
  request: RegisterRequest,
): Promise<RegisterResponse> => {
  return postJson<RegisterResponse, RegisterRequest>("/auth/register", request);
};

export const loginUser = (request: LoginRequest): Promise<LoginResponse> => {
  return postJson<LoginResponse, LoginRequest>("/auth/login", request);
};

export const getCurrentUser = (): Promise<CurrentUserResponse> => {
  return getJson<CurrentUserResponse>("/auth/me");
};

export const refreshSession = (): Promise<void> => {
  return postWithoutResponse("/auth/refresh");
};

export const getCurrentUserWithRefresh =
  async (): Promise<CurrentUserResponse> => {
    try {
      return await getCurrentUser();
    } catch (error: unknown) {
      if (!(error instanceof ApiRequestError) || error.statusCode !== 401) {
        throw error;
      }

      await refreshSession();

      return getCurrentUser();
    }
  };

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return "Unable to connect to the server. Please try again.";
};

import { ApiRequestError } from "@/lib/api/auth-api";

export const hasCurrentProfile = async (): Promise<boolean> => {
  const response = await fetch("/api/profile", {
    method: "GET",
    credentials: "include",
  });

  if (response.ok) {
    return true;
  }

  if (response.status === 404) {
    return false;
  }

  throw new ApiRequestError("Unable to load your profile.", response.status);
};

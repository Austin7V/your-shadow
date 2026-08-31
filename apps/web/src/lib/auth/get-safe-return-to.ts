const DEFAULT_RETURN_TO = "/dashboard";
const INTERNAL_ORIGIN = "https://your-shadow.local";

const protectedRoutes = [
  "/dashboard",
  "/meals",
  "/workout",
  "/history",
  "/account",
  "/onboarding",
];

export const getSafeReturnTo = (value: string | null): string => {
  if (value === null || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }

  try {
    const url = new URL(value, INTERNAL_ORIGIN);

    if (url.origin !== INTERNAL_ORIGIN) {
      return DEFAULT_RETURN_TO;
    }

    const isProtectedRoute = protectedRoutes.some(
      (route) => url.pathname === route || url.pathname.startsWith(`${route}/`),
    );

    if (!isProtectedRoute) {
      return DEFAULT_RETURN_TO;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_RETURN_TO;
  }
};

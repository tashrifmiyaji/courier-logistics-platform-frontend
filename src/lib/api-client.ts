type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readResponseBody<T>(
  response: Response,
): Promise<ApiEnvelope<T> | { message?: string; errors?: { message?: string }[] } | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default async function apiClient<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  };
  const url = `/api/backend${path}`;
  let response = await fetch(url, requestInit);
  if (response.status === 401 && !path.startsWith("/auth/")) {
    const refresh = await fetch("/api/backend/auth/refresh-token", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (refresh.ok) response = await fetch(url, requestInit);
  }
  const body = await readResponseBody<T>(response);

  if (!response.ok) {
    const message = body && "message" in body
      ? (body.message ?? ("errors" in body ? body.errors?.[0]?.message : undefined))
      : undefined;
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("GOparcel:unauthorized"));
    }
    throw new ApiError(message || "We couldn't complete that request.", response.status);
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    const message = body && "message" in body && typeof body.message === "string"
      ? body.message
      : "The API returned an invalid response.";
    throw new ApiError(message, response.status);
  }

  return body;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export class ApiAuthError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiAuthError";
    this.status = status;
  }
}

let refreshPromise: Promise<void> | null = null;

async function parseErrorMessage(response: Response): Promise<string> {
  let message = `API request failed: ${response.status}`;

  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (typeof body.message === "string") {
      message = body.message;
    } else if (Array.isArray(body.message)) {
      message = body.message.join(", ");
    }
  } catch {
    // ignore parse errors
  }

  return message;
}

async function refreshAuthSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new ApiAuthError(await parseErrorMessage(response), response.status);
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
}

type ApiJsonOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

export async function apiJson<T>(path: string, init?: ApiJsonOptions): Promise<T> {
  const { retryOnUnauthorized = true, ...requestInit } = init ?? {};

  const request = async () =>
    fetch(`${apiBaseUrl}${path}`, {
      ...requestInit,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(requestInit.headers ?? {}),
      },
    });

  let response = await request();

  if (response.status === 401 && retryOnUnauthorized && path !== "/auth/refresh") {
    try {
      await refreshAuthSession();
      response = await request();
    } catch (error) {
      if (error instanceof ApiAuthError) {
        throw error;
      }

      throw new ApiAuthError("Phiên đăng nhập không hợp lệ.", 401);
    }
  }

  if (!response.ok) {
    throw new ApiAuthError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function refreshAuthSessionPublic(): Promise<void> {
  await refreshAuthSession();
}

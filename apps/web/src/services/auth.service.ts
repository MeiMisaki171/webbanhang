import type { AuthUser, LoginInput, RegisterInput } from "@repo/shared";
import { apiJson } from "@/lib/http-client";

export async function loginRequest(input: LoginInput): Promise<AuthUser> {
  return apiJson<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
    retryOnUnauthorized: false,
  });
}

export async function registerRequest(input: RegisterInput): Promise<AuthUser> {
  return apiJson<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
    retryOnUnauthorized: false,
  });
}

export async function logoutRequest(): Promise<void> {
  await apiJson<{ success: boolean }>("/auth/logout", {
    method: "POST",
    retryOnUnauthorized: false,
  });
}

export async function fetchMeRequest(): Promise<AuthUser> {
  return apiJson<AuthUser>("/auth/me", { cache: "no-store" });
}

export async function refreshSessionRequest(): Promise<AuthUser> {
  return apiJson<AuthUser>("/auth/refresh", {
    method: "POST",
    retryOnUnauthorized: false,
  });
}

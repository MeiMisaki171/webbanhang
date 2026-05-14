import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser, OrderListItemView } from "@repo/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchWithSession<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function requireAuthUser(): Promise<AuthUser> {
  try {
    return await fetchWithSession<AuthUser>("/auth/me");
  } catch {
    redirect("/login");
  }
}

export async function fetchMyOrdersServer(): Promise<OrderListItemView[]> {
  return fetchWithSession<OrderListItemView[]>("/orders");
}

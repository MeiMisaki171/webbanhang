import type {
  CartView,
  CheckoutInput,
  OrderListItemView,
  OrderView,
  ProvinceSummary,
  WardSummary,
} from "@repo/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchCommerceJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
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
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchCart(): Promise<CartView> {
  return fetchCommerceJson<CartView>("/cart", { cache: "no-store" });
}

export async function addCartItem(productId: string, quantity: number): Promise<CartView> {
  return fetchCommerceJson<CartView>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartView> {
  return fetchCommerceJson<CartView>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: string): Promise<CartView> {
  return fetchCommerceJson<CartView>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function fetchCheckoutSummary(): Promise<{ shippingFee: number }> {
  return fetchCommerceJson<{ shippingFee: number }>("/checkout/summary", {
    cache: "no-store",
  });
}

export async function submitCheckout(input: CheckoutInput): Promise<OrderView> {
  return fetchCommerceJson<OrderView>("/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchProvinces(): Promise<ProvinceSummary[]> {
  return fetchCommerceJson<ProvinceSummary[]>("/geo/provinces", { cache: "no-store" });
}

export async function fetchWards(provinceCode: string): Promise<WardSummary[]> {
  const params = new URLSearchParams({ provinceCode });
  return fetchCommerceJson<WardSummary[]>(`/geo/wards?${params.toString()}`, {
    cache: "no-store",
  });
}

export async function fetchMyOrders(): Promise<OrderListItemView[]> {
  return fetchCommerceJson<OrderListItemView[]>("/orders", { cache: "no-store" });
}

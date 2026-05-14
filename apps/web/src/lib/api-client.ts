import type {
  CategoryDetail,
  CategorySummary,
  OrderView,
  PaginatedResponse,
  ProductCard,
  ProductDetail,
  ProductListQuery,
  SearchQuery,
  SearchSuggestion,
} from "@repo/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export type HealthResponse = {
  status: string;
  database: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/health", { next: { revalidate: 30 } });
}

export async function fetchCategories(): Promise<CategorySummary[]> {
  return fetchJson<CategorySummary[]>("/categories", { next: { revalidate: 60 } });
}

export async function fetchCategory(slug: string): Promise<CategoryDetail> {
  return fetchJson<CategoryDetail>(`/categories/${slug}`, { next: { revalidate: 60 } });
}

export async function fetchProducts(
  query: Partial<ProductListQuery>,
): Promise<PaginatedResponse<ProductCard>> {
  return fetchJson<PaginatedResponse<ProductCard>>(
    `/products${buildQuery(query as Record<string, string | number | boolean | undefined>)}`,
    { next: { revalidate: 30 } },
  );
}

export async function fetchProduct(slug: string): Promise<ProductDetail> {
  return fetchJson<ProductDetail>(`/products/${slug}`, { next: { revalidate: 30 } });
}

export async function searchProducts(
  query: Partial<SearchQuery>,
): Promise<PaginatedResponse<ProductCard>> {
  return fetchJson<PaginatedResponse<ProductCard>>(
    `/search${buildQuery(query as Record<string, string | number | boolean | undefined>)}`,
    { cache: "no-store" },
  );
}

export async function fetchSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query.trim()) {
    return [];
  }

  return fetchJson<SearchSuggestion[]>(
    `/search/suggest${buildQuery({ q: query, limit: 5 })}`,
    { cache: "no-store" },
  );
}

export async function fetchBrands(category?: string): Promise<string[]> {
  return fetchJson<string[]>(
    `/products/brands/list${buildQuery({ category })}`,
    { next: { revalidate: 120 } },
  );
}

export async function fetchOrder(code: string): Promise<OrderView> {
  return fetchJson<OrderView>(`/orders/${code}`, { cache: "no-store" });
}

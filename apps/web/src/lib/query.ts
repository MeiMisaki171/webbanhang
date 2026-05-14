import type { ProductListQuery, SearchQuery } from "@repo/shared";

export function toQueryString(
  params: Partial<ProductListQuery | SearchQuery> & { q?: string },
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function parseNumberParam(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseBooleanParam(value: string | string[] | undefined): boolean | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }
  return undefined;
}

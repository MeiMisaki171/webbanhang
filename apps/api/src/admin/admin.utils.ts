export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeSpecs(specs: Record<string, string | number | boolean>): Record<string, string> {
  return Object.fromEntries(Object.entries(specs).map(([key, value]) => [key, String(value)]));
}

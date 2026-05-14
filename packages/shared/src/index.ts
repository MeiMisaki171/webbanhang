export * from "./enums.js";

export function formatVnd(amount: number): string {
  const formatted = new Intl.NumberFormat("vi-VN").format(amount);
  return `${formatted} ₫`;
}

export const API_PREFIX = "/api/v1";

export * from "./auth.js";
export * from "./catalog.js";
export * from "./commerce.js";
export * from "./admin.js";

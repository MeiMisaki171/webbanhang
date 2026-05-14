export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PaymentMethod {
  COD = "COD",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export function formatVnd(amount: number): string {
  const formatted = new Intl.NumberFormat("vi-VN").format(amount);
  return `${formatted} ₫`;
}

export const API_PREFIX = "/api/v1";

export const AUTH_ACCESS_COOKIE = "dgp_access_token";
export const AUTH_REFRESH_COOKIE = "dgp_refresh_token";

export function normalizePhone(phone: string): string {
  return phone.trim();
}

export function isEmailIdentifier(identifier: string): boolean {
  return identifier.includes("@");
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
) {
  return {
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

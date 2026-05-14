import type { Request, Response } from "express";
import { GUEST_CART_COOKIE } from "@repo/shared";

const CART_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function readGuestToken(request: Request): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name === GUEST_CART_COOKIE) {
      const value = valueParts.join("=");
      return value ? decodeURIComponent(value) : undefined;
    }
  }

  return undefined;
}

export function writeGuestTokenCookie(response: Response, guestToken: string): void {
  const encoded = encodeURIComponent(guestToken);
  response.setHeader(
    "Set-Cookie",
    `${GUEST_CART_COOKIE}=${encoded}; Path=/; Max-Age=${CART_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax`,
  );
}

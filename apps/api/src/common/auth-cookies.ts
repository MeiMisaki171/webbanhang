import type { Request, Response } from "express";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@repo/shared";

const ACCESS_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const REMEMBER_REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = part.trim().split("=");
    if (cookieName === name) {
      const value = valueParts.join("=");
      return value ? decodeURIComponent(value) : undefined;
    }
  }

  return undefined;
}

export function readAccessToken(request: Request): string | undefined {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim() || undefined;
  }

  return readCookie(request, AUTH_ACCESS_COOKIE);
}

export function readRefreshToken(request: Request): string | undefined {
  return readCookie(request, AUTH_REFRESH_COOKIE);
}

function buildCookie(name: string, value: string, maxAgeSeconds: number): string {
  const encoded = encodeURIComponent(value);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

export function writeAuthCookies(
  response: Response,
  tokens: { accessToken: string; refreshToken: string },
  options?: { rememberMe?: boolean },
): void {
  const refreshMaxAge = options?.rememberMe
    ? REMEMBER_REFRESH_MAX_AGE_SECONDS
    : REFRESH_MAX_AGE_SECONDS;

  response.append("Set-Cookie", buildCookie(AUTH_ACCESS_COOKIE, tokens.accessToken, ACCESS_MAX_AGE_SECONDS));
  response.append(
    "Set-Cookie",
    buildCookie(AUTH_REFRESH_COOKIE, tokens.refreshToken, refreshMaxAge),
  );
}

export function clearAuthCookies(response: Response): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.append(
    "Set-Cookie",
    `${AUTH_ACCESS_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
  );
  response.append(
    "Set-Cookie",
    `${AUTH_REFRESH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
  );
}

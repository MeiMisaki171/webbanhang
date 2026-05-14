import type { StateStorage } from "zustand/middleware";

export const AUTH_STORAGE_KEY = "dgp-auth";
export const AUTH_STORAGE_VERSION = 1;

export const authPersistedKeys = [
  "user",
  "rememberMe",
  "lastLoginAt",
  "sessionId",
] as const;

export function createBrowserStorage(): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === "undefined") {
        return null;
      }

      return window.localStorage.getItem(name);
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(name, value);
    },
    removeItem: (name) => {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.removeItem(name);
    },
  };
}

export function clearCorruptedAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return;
    }

    JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

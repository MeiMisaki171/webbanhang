import type { LoginInput, RegisterInput } from "@repo/shared";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { ApiAuthError } from "@/lib/http-client";
import {
  fetchMeRequest,
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  registerRequest,
} from "@/services/auth.service";
import {
  createSessionId,
  publishAuthLogout,
  subscribeAuthLogout,
} from "@/services/session.service";
import {
  AUTH_STORAGE_KEY,
  AUTH_STORAGE_VERSION,
  clearCorruptedAuthStorage,
  createBrowserStorage,
} from "@/stores/auth.persist";
import type { AuthState, AuthStatus } from "@/stores/auth.types";

let bootstrapPromise: Promise<void> | null = null;

function createInitialAuthState(): Pick<
  AuthState,
  "user" | "rememberMe" | "lastLoginAt" | "sessionId" | "status" | "hasHydrated"
> {
  return {
    user: null,
    rememberMe: false,
    lastLoginAt: null,
    sessionId: null,
    status: "idle",
    hasHydrated: false,
  };
}

function applyAuthenticatedUser(
  set: (partial: Partial<AuthState>) => void,
  user: AuthState["user"],
  rememberMe: boolean,
): void {
  set({
    user,
    rememberMe,
    lastLoginAt: new Date().toISOString(),
    sessionId: createSessionId(),
    status: "authenticated",
  });
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...createInitialAuthState(),
        setHasHydrated: (value) => set({ hasHydrated: value }),
        setUser: (user) => set({ user }),
        clearUser: () =>
          set({
            user: null,
            rememberMe: false,
            lastLoginAt: null,
            sessionId: null,
            status: "unauthenticated",
          }),
        bootstrap: async () => {
          if (bootstrapPromise) {
            return bootstrapPromise;
          }

          bootstrapPromise = (async () => {
            clearCorruptedAuthStorage();
            await useAuthStore.persist.rehydrate();
            set({ hasHydrated: true });

            const persistedUser = get().user;
            if (!persistedUser) {
              set({ status: "unauthenticated" });
              return;
            }

            set({ status: "loading" });

            try {
              const user = await fetchMeRequest();
              set({ user, status: "authenticated" });
            } catch (error) {
              if (error instanceof ApiAuthError && error.status === 401) {
                try {
                  const refreshedUser = await refreshSessionRequest();
                  applyAuthenticatedUser(set, refreshedUser, get().rememberMe);
                  return;
                } catch {
                  set({
                    user: null,
                    rememberMe: false,
                    lastLoginAt: null,
                    sessionId: null,
                    status: "expired",
                  });
                  return;
                }
              }

              set({ status: "authenticated" });
            }
          })().finally(() => {
            bootstrapPromise = null;
          });

          return bootstrapPromise;
        },
        refreshSession: async () => {
          set({ status: "loading" });

          try {
            const user = await refreshSessionRequest();
            applyAuthenticatedUser(set, user, get().rememberMe);
          } catch {
            get().clearUser();
            set({ status: "expired" });
          }
        },
        login: async (input: LoginInput) => {
          set({ status: "loading" });
          const user = await loginRequest(input);
          applyAuthenticatedUser(set, user, Boolean(input.rememberMe));
          return user;
        },
        register: async (input: RegisterInput) => {
          set({ status: "loading" });
          const user = await registerRequest(input);
          applyAuthenticatedUser(set, user, false);
          return user;
        },
        logout: async () => {
          try {
            await logoutRequest();
          } finally {
            get().clearUser();
            publishAuthLogout();
          }
        },
      }),
      {
        name: AUTH_STORAGE_KEY,
        version: AUTH_STORAGE_VERSION,
        storage: createJSONStorage(() => createBrowserStorage()),
        partialize: (state) => ({
          user: state.user,
          rememberMe: state.rememberMe,
          lastLoginAt: state.lastLoginAt,
          sessionId: state.sessionId,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            clearCorruptedAuthStorage();
          }

          state?.setHasHydrated(true);
        },
      },
    ),
  ),
);

if (typeof window !== "undefined") {
  subscribeAuthLogout(() => {
    useAuthStore.getState().clearUser();
  });
}

export function getAuthStatusLabel(status: AuthStatus): string {
  switch (status) {
    case "authenticated":
      return "authenticated";
    case "expired":
      return "expired";
    case "loading":
      return "loading";
    case "unauthenticated":
      return "unauthenticated";
    default:
      return "idle";
  }
}

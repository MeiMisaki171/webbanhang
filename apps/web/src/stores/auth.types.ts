export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "expired";

export type AuthPersistedState = {
  user: import("@repo/shared").AuthUser | null;
  rememberMe: boolean;
  lastLoginAt: string | null;
  sessionId: string | null;
};

export type AuthState = AuthPersistedState & {
  status: AuthStatus;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
  refreshSession: () => Promise<void>;
  login: (input: import("@repo/shared").LoginInput) => Promise<import("@repo/shared").AuthUser>;
  register: (input: import("@repo/shared").RegisterInput) => Promise<import("@repo/shared").AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: import("@repo/shared").AuthUser | null) => void;
  clearUser: () => void;
};

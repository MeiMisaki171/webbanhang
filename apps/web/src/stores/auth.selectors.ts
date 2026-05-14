import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/stores/auth.store";

export function useAuthUser() {
  return useAuthStore((state) => state.user);
}

export function useIsAuthenticated() {
  return useAuthStore((state) => state.status === "authenticated" && state.user !== null);
}

export function useAuthStatus() {
  return useAuthStore((state) => state.status);
}

export function useAuthActions() {
  return useAuthStore(
    useShallow((state) => ({
      bootstrap: state.bootstrap,
      refreshSession: state.refreshSession,
      login: state.login,
      register: state.register,
      logout: state.logout,
      setUser: state.setUser,
      clearUser: state.clearUser,
    })),
  );
}

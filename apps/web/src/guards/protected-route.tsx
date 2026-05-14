"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@repo/shared";
import { useAuthStatus, useAuthUser } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
};

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  fallback = <p className="text-sm text-slate-600">Đang tải phiên đăng nhập...</p>,
}: ProtectedRouteProps) {
  const router = useRouter();
  const status = useAuthStatus();

  useEffect(() => {
    if (status === "unauthenticated" || status === "expired") {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status]);

  if (status === "idle" || status === "loading") {
    return fallback;
  }

  if (status !== "authenticated") {
    return null;
  }

  return children;
}

type GuestRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function GuestRoute({ children, redirectTo = "/account" }: GuestRouteProps) {
  const router = useRouter();
  const status = useAuthStatus();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status]);

  if (status === "authenticated") {
    return null;
  }

  return children;
}

type RoleRouteProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
};

export function RoleRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleRouteProps) {
  const router = useRouter();
  const status = useAuthStatus();
  const user = useAuthUser();

  useEffect(() => {
    if (status === "authenticated" && user && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [allowedRoles, redirectTo, router, status, user]);

  if (status === "idle" || status === "loading") {
    return <p className="text-sm text-slate-600">Đang tải phiên đăng nhập...</p>;
  }

  if (status !== "authenticated" || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}

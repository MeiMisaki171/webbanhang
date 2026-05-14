"use client";

import Link from "next/link";
import { useAuthStatus, useAuthUser } from "@/hooks/use-auth";

function getAccountLabel(user: NonNullable<ReturnType<typeof useAuthUser>>): string {
  if (user.fullName) {
    return user.fullName;
  }

  if (user.email) {
    return user.email;
  }

  return user.phone ?? "Tài khoản";
}

export function AccountMenu() {
  const user = useAuthUser();
  const status = useAuthStatus();

  if (status === "loading" || status === "idle") {
    return (
      <Link href="/account" className="hover:text-sky-700">
        Tài khoản
      </Link>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className="hover:text-sky-700">
        Đăng nhập
      </Link>
    );
  }

  return (
    <Link href="/account" className="hover:text-sky-700">
      {getAccountLabel(user)}
    </Link>
  );
}

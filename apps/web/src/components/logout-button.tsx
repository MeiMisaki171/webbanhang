"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart.store";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuthActions();
  const refreshCart = useCartStore((state) => state.refreshCart);

  async function handleLogout() {
    try {
      await logout();
      await refreshCart();
    } finally {
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Đăng xuất
    </button>
  );
}

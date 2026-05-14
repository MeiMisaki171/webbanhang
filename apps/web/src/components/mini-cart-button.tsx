"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart.store";

export function MiniCartButton() {
  const cart = useCartStore((state) => state.cart);
  const status = useCartStore((state) => state.status);
  const itemCount = cart?.itemCount ?? 0;

  const label =
    status === "loading" || status === "idle"
      ? "Giỏ hàng"
      : `Giỏ hàng, ${itemCount} sản phẩm`;

  return (
    <Link href="/cart" aria-label={label} className="relative inline-flex hover:text-sky-700">
      Giỏ hàng
      {status === "ready" && itemCount > 0 ? (
        <span
          className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-700 px-1 text-xs font-medium text-white"
          aria-hidden="true"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

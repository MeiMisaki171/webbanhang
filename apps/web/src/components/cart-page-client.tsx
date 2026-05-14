"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@repo/shared";
import { Price } from "@/components/price";
import { EmptyState } from "@/components/ui/empty-state";
import { CartSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { useCartStore } from "@/stores/cart.store";

export function CartPageClient() {
  const { showToast } = useToast();
  const cart = useCartStore((state) => state.cart);
  const status = useCartStore((state) => state.status);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  async function handleQuantityChange(itemId: string, quantity: number) {
    setPendingItemId(itemId);
    setError(null);

    try {
      await updateCartItem(itemId, quantity);
      showToast("Đã cập nhật số lượng.");
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : "Không cập nhật được số lượng.";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleRemove(itemId: string) {
    setPendingItemId(itemId);
    setError(null);

    try {
      await removeCartItem(itemId);
      showToast("Đã xóa sản phẩm khỏi giỏ.");
    } catch (removeError) {
      const message =
        removeError instanceof Error ? removeError.message : "Không xóa được sản phẩm.";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingItemId(null);
    }
  }

  if (status === "loading" || status === "idle") {
    return <CartSkeleton />;
  }

  if (status === "error" && !cart) {
    return (
      <EmptyState
        title="Không tải được giỏ hàng"
        description={error ?? "Không tải được giỏ hàng."}
        actionHref="/"
        actionLabel="Về trang chủ"
      />
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy thêm sản phẩm trước khi thanh toán."
        actionHref="/"
        actionLabel="Tiếp tục mua sắm"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {cart.items.map((item) => (
          <article
            key={item.id}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Link href={`/san-pham/${item.product.slug}`} className="font-medium text-slate-900 hover:text-sky-700">
                {item.product.name}
              </Link>
              <p className="text-sm text-slate-500">SKU: {item.product.sku}</p>
              <Price price={item.product.price} />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-600" htmlFor={`qty-${item.id}`}>
                  Số lượng
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  max={item.product.stock}
                  value={item.quantity}
                  disabled={pendingItemId === item.id}
                  onChange={(event) =>
                    handleQuantityChange(item.id, Number(event.target.value))
                  }
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1"
                  aria-label={`Số lượng ${item.product.name}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={pendingItemId === item.id}
                  className="text-sm text-red-600 hover:text-red-700"
                  aria-label={`Xóa ${item.product.name} khỏi giỏ`}
                >
                  Xóa
                </button>
              </div>
            </div>
            <div className="text-right font-medium text-slate-900">
              {formatVnd(item.lineTotal)}
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tóm tắt</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Tạm tính</dt>
            <dd className="font-medium text-slate-900">{formatVnd(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Số lượng</dt>
            <dd className="font-medium text-slate-900">{cart.itemCount}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-sky-700 px-4 py-3 text-sm font-medium text-white hover:bg-sky-800"
        >
          Tiến hành thanh toán
        </Link>
      </aside>
    </div>
  );
}

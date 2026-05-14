"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { useCartStore } from "@/stores/cart.store";

type AddToCartButtonProps = {
  productId: string;
  stock: number;
};

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const addCartItem = useCartStore((state) => state.addCartItem);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);

  const disabled = stock <= 0 || pending;

  async function handleAddToCart() {
    setPending(true);

    try {
      await addCartItem(productId, quantity);
      showToast("Đã thêm vào giỏ hàng.");
      router.push("/cart");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể thêm vào giỏ.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <label className="block text-sm font-medium text-slate-700" htmlFor="quantity">
        Số lượng
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id="quantity"
          type="number"
          min={1}
          max={Math.max(stock, 1)}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="w-24 rounded-lg border border-slate-300 px-3 py-2"
          disabled={stock <= 0}
          aria-label="Số lượng sản phẩm"
        />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={disabled}
          className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label={stock > 0 ? "Thêm vào giỏ hàng" : "Sản phẩm hết hàng"}
        >
          {pending ? "Đang thêm..." : stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}

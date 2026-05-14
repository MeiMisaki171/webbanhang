import type { CartView } from "@repo/shared";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { apiJson } from "@/lib/http-client";

export type CartStatus = "idle" | "loading" | "ready" | "error";

type CartState = {
  cart: CartView | null;
  status: CartStatus;
  bootstrap: () => Promise<void>;
  refreshCart: () => Promise<void>;
  setCart: (cart: CartView | null) => void;
  addCartItem: (productId: string, quantity: number) => Promise<CartView>;
  updateCartItem: (itemId: string, quantity: number) => Promise<CartView>;
  removeCartItem: (itemId: string) => Promise<CartView>;
};

let bootstrapPromise: Promise<void> | null = null;

export const useCartStore = create<CartState>()(
  subscribeWithSelector((set, get) => ({
    cart: null,
    status: "idle",
    setCart: (cart) => set({ cart, status: "ready" }),
    bootstrap: async () => {
      if (bootstrapPromise) {
        return bootstrapPromise;
      }

      bootstrapPromise = get()
        .refreshCart()
        .finally(() => {
          bootstrapPromise = null;
        });

      return bootstrapPromise;
    },
    refreshCart: async () => {
      set({ status: "loading" });

      try {
        const cart = await apiJson<CartView>("/cart", { cache: "no-store" });
        set({ cart, status: "ready" });
      } catch {
        set({ status: "error" });
      }
    },
    addCartItem: async (productId, quantity) => {
      const cart = await apiJson<CartView>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });
      set({ cart, status: "ready" });
      return cart;
    },
    updateCartItem: async (itemId, quantity) => {
      const cart = await apiJson<CartView>(`/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      set({ cart, status: "ready" });
      return cart;
    },
    removeCartItem: async (itemId) => {
      const cart = await apiJson<CartView>(`/cart/items/${itemId}`, {
        method: "DELETE",
      });
      set({ cart, status: "ready" });
      return cart;
    },
  })),
);

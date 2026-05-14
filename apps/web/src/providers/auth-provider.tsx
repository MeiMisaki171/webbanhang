"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const bootstrapCart = useCartStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrapAuth();
    void bootstrapCart();
  }, [bootstrapAuth, bootstrapCart]);

  return children;
}

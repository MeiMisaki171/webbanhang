"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GuestRoute } from "@/guards/protected-route";
import { useAuthActions } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart.store";

export function RegisterPageClient() {
  const router = useRouter();
  const { register } = useAuthActions();
  const refreshCart = useCartStore((state) => state.refreshCart);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await register({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
        fullName: fullName.trim() || undefined,
      });
      await refreshCart();
      router.push("/account");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GuestRoute>
      <div className="mx-auto max-w-md space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Đăng ký</h1>
          <p className="mt-2 text-sm text-slate-600">Tạo tài khoản để theo dõi đơn hàng.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <label className="block text-sm font-medium text-slate-700">
            Họ tên
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Số điện thoại
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <p className="text-xs text-slate-500">Nhập ít nhất email hoặc số điện thoại.</p>
          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
          >
            {submitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-sky-700 hover:text-sky-800">
            Đăng nhập
          </Link>
        </p>
      </div>
    </GuestRoute>
  );
}

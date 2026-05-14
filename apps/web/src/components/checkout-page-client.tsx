"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatVnd,
  PaymentMethod,
  type CartView,
  type CheckoutInput,
  type ProvinceSummary,
  type WardSummary,
} from "@repo/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckoutSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { fetchCheckoutSummary, fetchProvinces, fetchWards, submitCheckout } from "@/lib/commerce-client";
import { useCartStore } from "@/stores/cart.store";

export function CheckoutPageClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const recipientNameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const provinceId = useId();
  const wardId = useId();
  const line1Id = useId();
  const noteId = useId();
  const storeCart = useCartStore((state) => state.cart);
  const cartStatus = useCartStore((state) => state.status);
  const refreshCart = useCartStore((state) => state.refreshCart);
  const [cart, setCart] = useState<CartView | null>(null);
  const [provinces, setProvinces] = useState<ProvinceSummary[]>([]);
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    email: "",
    provinceCode: "",
    wardCode: "",
    line1: "",
    note: "",
    paymentMethod: PaymentMethod.COD,
  });

  useEffect(() => {
    let active = true;

    Promise.all([
      cartStatus === "ready" && storeCart ? Promise.resolve(storeCart) : refreshCart().then(() => useCartStore.getState().cart),
      fetchProvinces(),
      fetchCheckoutSummary(),
    ])
      .then(([cartData, provinceData, summary]) => {
        if (!active) {
          return;
        }

        setCart(cartData);
        setProvinces(provinceData);
        setShippingFee(summary.shippingFee);
      })
      .catch((fetchError) => {
        if (active) {
          const message =
            fetchError instanceof Error ? fetchError.message : "Không tải được dữ liệu checkout.";
          setError(message);
          showToast(message, "error");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cartStatus, refreshCart, showToast, storeCart]);

  useEffect(() => {
    if (!form.provinceCode) {
      setWards([]);
      return;
    }

    let active = true;
    fetchWards(form.provinceCode)
      .then((data) => {
        if (active) {
          setWards(data);
        }
      })
      .catch(() => {
        if (active) {
          setWards([]);
          showToast("Không tải được danh sách phường/xã.", "error");
        }
      });

    return () => {
      active = false;
    };
  }, [form.provinceCode, showToast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CheckoutInput = {
      recipientName: form.recipientName,
      phone: form.phone,
      email: form.email,
      provinceCode: form.provinceCode,
      wardCode: form.wardCode,
      line1: form.line1,
      paymentMethod: form.paymentMethod,
      note: form.note || undefined,
    };

    try {
      const order = await submitCheckout(payload);
      showToast("Đặt hàng thành công.");
      router.push(`/don-hang/${order.code}`);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Không thể đặt hàng.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Vui lòng thêm sản phẩm trước khi thanh toán."
        actionHref="/"
        actionLabel="Tiếp tục mua sắm"
      />
    );
  }

  const total = cart.subtotal + shippingFee;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Thông tin giao hàng</h2>
          <p className="mt-1 text-sm text-slate-600">Nhập địa chỉ nhận hàng tại Việt Nam.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm" htmlFor={recipientNameId}>
            <span className="font-medium text-slate-700">Họ tên</span>
            <input
              id={recipientNameId}
              required
              value={form.recipientName}
              onChange={(event) => setForm((current) => ({ ...current, recipientName: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm" htmlFor={phoneId}>
            <span className="font-medium text-slate-700">Số điện thoại</span>
            <input
              id={phoneId}
              required
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2" htmlFor={emailId}>
            <span className="font-medium text-slate-700">Email</span>
            <input
              id={emailId}
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm" htmlFor={provinceId}>
            <span className="font-medium text-slate-700">Tỉnh/thành</span>
            <select
              id={provinceId}
              required
              value={form.provinceCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  provinceCode: event.target.value,
                  wardCode: "",
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Chọn tỉnh/thành</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm" htmlFor={wardId}>
            <span className="font-medium text-slate-700">Phường/xã</span>
            <select
              id={wardId}
              required
              value={form.wardCode}
              onChange={(event) => setForm((current) => ({ ...current, wardCode: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              disabled={!form.provinceCode}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm sm:col-span-2" htmlFor={line1Id}>
            <span className="font-medium text-slate-700">Địa chỉ chi tiết</span>
            <input
              id={line1Id}
              required
              value={form.line1}
              onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2" htmlFor={noteId}>
            <span className="font-medium text-slate-700">Ghi chú</span>
            <textarea
              id={noteId}
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700">Phương thức thanh toán</legend>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              checked={form.paymentMethod === PaymentMethod.COD}
              onChange={() => setForm((current) => ({ ...current, paymentMethod: PaymentMethod.COD }))}
            />
            <span>Thanh toán khi nhận hàng (COD)</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              checked={form.paymentMethod === PaymentMethod.BANK_TRANSFER}
              onChange={() =>
                setForm((current) => ({ ...current, paymentMethod: PaymentMethod.BANK_TRANSFER }))
              }
            />
            <span>Chuyển khoản ngân hàng</span>
          </label>
        </fieldset>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sky-700 px-4 py-3 text-sm font-medium text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tóm tắt đơn hàng</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="text-slate-700">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-slate-900">{formatVnd(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Tạm tính</dt>
            <dd className="font-medium text-slate-900">{formatVnd(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Phí vận chuyển</dt>
            <dd className="font-medium text-slate-900">{formatVnd(shippingFee)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold text-slate-900">Tổng cộng</dt>
            <dd className="font-semibold text-sky-700">{formatVnd(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatVnd, OrderStatus, PaymentStatus, type AdminOrderDetail } from "@repo/shared";
import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "@/lib/admin-client";

type AdminOrderDetailClientProps = {
  orderId: string;
};

export function AdminOrderDetailClient({ orderId }: AdminOrderDetailClientProps) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);

  async function loadOrder() {
    const data = await fetchAdminOrder(orderId);
    setOrder(data);
    setOrderStatus(data.status);
    setPaymentStatus(data.payment.status);
  }

  useEffect(() => {
    loadOrder().catch((fetchError) => {
      setError(fetchError instanceof Error ? fetchError.message : "Không tải được đơn hàng.");
    });
  }, [orderId]);

  async function handleOrderStatusSave() {
    setError(null);
    try {
      const updated = await updateAdminOrderStatus(orderId, { status: orderStatus });
      setOrder(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không cập nhật được đơn.");
    }
  }

  async function handlePaymentStatusSave() {
    if (!order) {
      return;
    }

    setError(null);
    try {
      const updated = await updateAdminPaymentStatus(order.payment.id, { status: paymentStatus });
      setOrder(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không cập nhật được thanh toán.");
    }
  }

  if (error && !order) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error}</p>
        <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium underline">
          Đăng nhập admin
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="text-slate-600">Đang tải đơn hàng...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{order.code}</h2>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-sky-700 hover:underline">
          Quay lại
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-medium text-slate-900">Sản phẩm</h3>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatVnd(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right font-semibold text-slate-900">Tổng: {formatVnd(order.total)}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-medium text-slate-900">Trạng thái đơn</h3>
          <select
            value={orderStatus}
            onChange={(event) => setOrderStatus(event.target.value as OrderStatus)}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleOrderStatusSave}
            className="mt-3 rounded-xl bg-sky-700 px-4 py-2 text-sm font-medium text-white"
          >
            Lưu trạng thái đơn
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-medium text-slate-900">Trạng thái thanh toán</h3>
          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            {Object.values(PaymentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePaymentStatusSave}
            className="mt-3 rounded-xl bg-sky-700 px-4 py-2 text-sm font-medium text-white"
          >
            Lưu thanh toán
          </button>
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

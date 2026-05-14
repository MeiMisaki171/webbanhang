"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatVnd, type AdminOrderListItem } from "@repo/shared";
import { fetchAdminOrders } from "@/lib/admin-client";

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOrders()
      .then((response) => setOrders(response.data))
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Không tải được đơn hàng.");
      });
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error}</p>
        <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium underline">
          Đăng nhập admin
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3">Mã đơn</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thanh toán</th>
            <th className="px-4 py-3">Tổng</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${order.id}`} className="font-medium text-sky-700">
                  {order.code}
                </Link>
              </td>
              <td className="px-4 py-3">{order.status}</td>
              <td className="px-4 py-3">
                {order.payment.method} / {order.payment.status}
              </td>
              <td className="px-4 py-3">{formatVnd(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

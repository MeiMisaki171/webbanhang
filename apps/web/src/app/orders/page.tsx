import Link from "next/link";
import { formatVnd } from "@repo/shared";
import { requireAuthUser, fetchMyOrdersServer } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAuthUser();
  const orders = await fetchMyOrdersServer();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Đơn hàng của tôi</h1>
        <p className="mt-2 text-sm text-slate-600">Theo dõi trạng thái và chi tiết đơn đã đặt.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Bạn chưa có đơn hàng nào.
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.code} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{order.code}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString("vi-VN")} · {order.itemCount} sản phẩm
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sky-700">{formatVnd(order.total)}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.status} · {order.payment.status}
                  </p>
                </div>
              </div>
              <Link
                href={`/don-hang/${order.code}`}
                className="mt-4 inline-flex text-sm font-medium text-sky-700 hover:text-sky-800"
              >
                Xem chi tiết
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

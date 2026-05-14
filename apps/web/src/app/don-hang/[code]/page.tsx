import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatVnd, PaymentMethod } from "@repo/shared";
import { fetchOrder } from "@/lib/api-client";

export const dynamic = "force-dynamic";

type OrderPageProps = {
  params: Promise<{ code: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { code } = await params;

  let order;
  try {
    order = await fetchOrder(code);
  } catch {
    notFound();
  }

  const isBankTransfer = order.payment.method === PaymentMethod.BANK_TRANSFER;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Đặt hàng thành công</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Mã đơn: {order.code}</h1>
        <p className="mt-2 text-slate-700">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn trong thời gian sớm nhất.
        </p>
      </div>

      {isBankTransfer && order.bankTransfer ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Thông tin chuyển khoản</h2>
          <p className="mt-2 text-sm text-slate-600">
            Vui lòng chuyển khoản đúng số tiền và ghi nội dung mã đơn hàng.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Ngân hàng</dt>
              <dd className="font-medium text-slate-900">{order.bankTransfer.bankName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Số tài khoản</dt>
              <dd className="font-medium text-slate-900">{order.bankTransfer.bankAccount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Chủ tài khoản</dt>
              <dd className="font-medium text-slate-900">{order.bankTransfer.bankHolder}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Số tiền</dt>
              <dd className="font-semibold text-sky-700">{formatVnd(order.total)}</dd>
            </div>
          </dl>
          {order.bankTransfer.bankQrUrl ? (
            <div className="mt-6 flex justify-center">
              <Image
                src={order.bankTransfer.bankQrUrl}
                alt="Mã QR chuyển khoản"
                width={240}
                height={240}
                className="rounded-xl border border-slate-200"
              />
            </div>
          ) : null}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Thanh toán khi nhận hàng</h2>
          <p className="mt-2 text-sm text-slate-600">
            Bạn sẽ thanh toán cho nhân viên giao hàng khi nhận sản phẩm.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Chi tiết đơn hàng</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="text-slate-700">
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium text-slate-900">{formatVnd(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Tạm tính</dt>
            <dd className="font-medium text-slate-900">{formatVnd(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Phí vận chuyển</dt>
            <dd className="font-medium text-slate-900">{formatVnd(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold text-slate-900">Tổng cộng</dt>
            <dd className="font-semibold text-sky-700">{formatVnd(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Địa chỉ giao hàng</h2>
        <p className="mt-3 text-sm text-slate-700">{order.shippingAddress.recipientName}</p>
        <p className="text-sm text-slate-700">{order.shippingAddress.phone}</p>
        <p className="text-sm text-slate-700">{order.shippingAddress.email}</p>
        <p className="mt-2 text-sm text-slate-700">
          {order.shippingAddress.line1}, {order.shippingAddress.wardName},{" "}
          {order.shippingAddress.provinceName}
        </p>
        {order.note ? <p className="mt-3 text-sm text-slate-600">Ghi chú: {order.note}</p> : null}
      </section>

      <Link
        href="/"
        className="inline-flex rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}

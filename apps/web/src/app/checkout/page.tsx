import { CheckoutPageClient } from "@/components/checkout-page-client";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Thanh toán</h1>
        <p className="mt-2 text-slate-600">Nhập thông tin giao hàng và chọn phương thức thanh toán.</p>
      </div>
      <CheckoutPageClient />
    </div>
  );
}

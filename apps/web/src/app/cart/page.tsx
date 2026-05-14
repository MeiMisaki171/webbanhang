import { CartPageClient } from "@/components/cart-page-client";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Giỏ hàng</h1>
        <p className="mt-2 text-slate-600">Kiểm tra sản phẩm trước khi thanh toán.</p>
      </div>
      <CartPageClient />
    </div>
  );
}

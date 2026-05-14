import type { ProductCard } from "@repo/shared";
import { ProductCardItem } from "./product-card";

type ProductGridProps = {
  products: ProductCard[];
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  emptyMessage = "Không có sản phẩm phù hợp.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCardItem key={product.id} product={product} />
      ))}
    </div>
  );
}

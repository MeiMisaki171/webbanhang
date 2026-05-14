import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagination } from "@/components/pagination";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { fetchBrands, searchProducts } from "@/lib/api-client";
import { parseBooleanParam, parseNumberParam } from "@/lib/query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tìm kiếm | Điện Gia Dụng Pro",
  description: "Tìm sản phẩm đồ gia dụng, điện và điện máy theo tên, SKU hoặc thương hiệu.",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] ?? "" : query.q ?? "";
  const page = parseNumberParam(query.page) ?? 1;
  const products = await searchProducts({
    q,
    brand: Array.isArray(query.brand) ? query.brand[0] : query.brand,
    minPrice: parseNumberParam(query.minPrice),
    maxPrice: parseNumberParam(query.maxPrice),
    inStock: parseBooleanParam(query.inStock),
    sort: (Array.isArray(query.sort) ? query.sort[0] : query.sort) as
      | "newest"
      | "price_asc"
      | "price_desc"
      | "bestseller"
      | undefined,
    page,
    pageSize: 12,
  });
  const brands = await fetchBrands();
  const basePath = "/tim-kiem";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Tìm kiếm</h1>
        <p className="text-slate-600">
          {q ? `Kết quả cho “${q}”` : "Nhập từ khóa để tìm sản phẩm."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 rounded-xl bg-slate-100" />}>
          <ProductFilters brands={brands} basePath={basePath} />
        </Suspense>
        <div className="space-y-6">
          <ProductGrid
            products={products.data}
            emptyMessage={q ? "Không tìm thấy sản phẩm phù hợp." : "Hãy nhập từ khóa tìm kiếm."}
          />
          <Pagination
            page={products.meta.page}
            totalPages={products.meta.totalPages}
            basePath={basePath}
            searchParams={query}
          />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pagination } from "@/components/pagination";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { fetchBrands, fetchCategory, fetchProducts } from "@/lib/api-client";
import { parseBooleanParam, parseNumberParam } from "@/lib/query";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await fetchCategory(slug);
    return {
      title: `${category.name} | Điện Gia Dụng Pro`,
      description: `Mua sắm ${category.name} chính hãng tại Điện Gia Dụng Pro.`,
    };
  } catch {
    return { title: "Danh mục | Điện Gia Dụng Pro" };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await fetchCategory(slug);
  const page = parseNumberParam(query.page) ?? 1;
  const products = await fetchProducts({
    category: slug,
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
  const brands = await fetchBrands(slug);
  const basePath = `/danh-muc/${slug}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Breadcrumbs items={category.breadcrumbs} />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{category.name}</h1>
        {category.children.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <a
                key={child.id}
                href={`/danh-muc/${child.slug}`}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:border-sky-400"
              >
                {child.name}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 rounded-xl bg-slate-100" />}>
          <ProductFilters brands={brands} basePath={basePath} />
        </Suspense>
        <div className="space-y-6">
          <ProductGrid products={products.data} />
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

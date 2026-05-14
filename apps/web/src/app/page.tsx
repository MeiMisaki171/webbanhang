import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagination } from "@/components/pagination";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { fetchBrands, fetchProducts, searchProducts } from "@/lib/api-client";
import { parseBooleanParam, parseNumberParam } from "@/lib/query";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] ?? "" : query.q ?? "";

  if (q) {
    return {
      title: `Tìm kiếm “${q}”`,
      description: `Kết quả tìm kiếm “${q}” tại Điện Gia Dụng Pro.`,
      openGraph: {
        title: `Tìm kiếm “${q}” | Điện Gia Dụng Pro`,
        description: `Kết quả tìm kiếm “${q}” tại Điện Gia Dụng Pro.`,
        type: "website",
        locale: "vi_VN",
      },
    };
  }

  return {
    title: "Điện Gia Dụng Pro",
    description:
      "Mua đồ gia dụng, điện và điện máy chính hãng với giá VND, giao hàng toàn quốc và thanh toán COD hoặc chuyển khoản.",
    keywords: [
      "đồ gia dụng",
      "điện máy",
      "nồi cơm",
      "tủ lạnh",
      "mua sắm online",
      "Điện Gia Dụng Pro",
    ],
    openGraph: {
      title: "Điện Gia Dụng Pro",
      description:
        "Cửa hàng đồ gia dụng, điện và điện máy trực tuyến tại Việt Nam.",
      type: "website",
      locale: "vi_VN",
    },
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] ?? "" : query.q ?? "";

  if (q) {
    const page = parseNumberParam(query.page) ?? 1;
    const [products, brands] = await Promise.all([
      searchProducts({
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
      }),
      fetchBrands(),
    ]);
    const basePath = "/";

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Tìm kiếm</h1>
          <p className="text-slate-600">Kết quả cho “{q}”</p>
        </div>

        <div className="space-y-6">
          <Suspense
            fallback={
              <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
            }
          >
            <ProductFilters brands={brands} basePath={basePath} />
          </Suspense>
          <ProductGrid
            products={products.data}
            emptyMessage="Không tìm thấy sản phẩm phù hợp."
          />
          <Pagination
            page={products.meta.page}
            totalPages={products.meta.totalPages}
            basePath={basePath}
            searchParams={query}
          />
        </div>
      </div>
    );
  }

  const [featuredProducts, saleProducts] = await Promise.all([
    fetchProducts({ sort: "bestseller", pageSize: 8 }),
    fetchProducts({ onSale: true, pageSize: 8 }),
  ]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-linear-to-br from-sky-700 to-sky-500 px-6 py-12 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-100">
          Điện Gia Dụng Pro
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
          Đồ gia dụng, điện và điện máy chính hãng, giao nhanh toàn quốc
        </h1>
        <p className="mt-4 max-w-2xl text-base text-sky-50">
          Duyệt danh mục, lọc theo thương hiệu và giá, xem chi tiết sản phẩm
          trực tiếp từ PostgreSQL qua API NestJS.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Sản phẩm bán chạy
        </h2>
        <ProductGrid products={featuredProducts.data} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Khuyến mãi</h2>
        <ProductGrid
          products={saleProducts.data}
          emptyMessage="Chưa có sản phẩm khuyến mãi."
        />
      </section>
    </div>
  );
}

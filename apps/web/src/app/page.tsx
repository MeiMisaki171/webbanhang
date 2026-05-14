import { CategoryGrid } from "@/components/category-grid";
import { ProductGrid } from "@/components/product-grid";
import { fetchCategories, fetchProducts } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featuredProducts, saleProducts] = await Promise.all([
    fetchCategories(),
    fetchProducts({ sort: "bestseller", pageSize: 8 }),
    fetchProducts({ onSale: true, pageSize: 8 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-br from-sky-700 to-sky-500 px-6 py-12 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-100">
          Điện Gia Dụng Pro
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
          Đồ gia dụng, điện và điện máy chính hãng, giao nhanh toàn quốc
        </h1>
        <p className="mt-4 max-w-2xl text-base text-sky-50">
          Duyệt danh mục, lọc theo thương hiệu và giá, xem chi tiết sản phẩm trực tiếp từ
          PostgreSQL qua API NestJS.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Danh mục nổi bật</h2>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Sản phẩm bán chạy</h2>
        <ProductGrid products={featuredProducts.data} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Khuyến mãi</h2>
        <ProductGrid products={saleProducts.data} emptyMessage="Chưa có sản phẩm khuyến mãi." />
      </section>
    </div>
  );
}

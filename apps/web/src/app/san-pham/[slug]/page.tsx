import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Price } from "@/components/price";
import { ProductGrid } from "@/components/product-grid";
import { fetchProduct } from "@/lib/api-client";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchProduct(slug);
    return {
      title: `${product.name} | Điện Gia Dụng Pro`,
      description: product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Sản phẩm | Điện Gia Dụng Pro" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await fetchProduct(slug);
  } catch {
    notFound();
  }

  const primaryImage = product.images[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <Breadcrumbs items={product.categoryBreadcrumbs} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">Chưa có ảnh</div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-500">SKU: {product.sku}</p>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          <p className="text-sm text-slate-600">
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
          </p>
          <p className="text-base leading-7 text-slate-700">{product.shortDescription}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Mô tả sản phẩm</h2>
        <p className="whitespace-pre-line text-slate-700">{product.description}</p>
      </section>

      {Object.keys(product.specs).length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Thông số kỹ thuật</h2>
          <dl className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm text-slate-500">{key}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Sản phẩm liên quan</h2>
        <ProductGrid
          products={product.relatedProducts}
          emptyMessage="Chưa có sản phẩm liên quan."
        />
      </section>
    </div>
  );
}

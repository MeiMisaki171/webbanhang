import type { ProductCard } from "@repo/shared";
import Image from "next/image";
import Link from "next/link";
import { Price } from "./price";

type ProductCardProps = {
  product: ProductCard;
};

export function ProductCardItem({ product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/san-pham/${product.slug}`} className="block">
        <div className="relative aspect-square bg-slate-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Chưa có ảnh
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
          <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{product.shortDescription}</p>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          <p className="text-xs text-slate-500">
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
          </p>
        </div>
      </Link>
    </article>
  );
}

import { formatVnd } from "@repo/shared";

type PriceProps = {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
};

export function Price({ price, compareAtPrice, className }: PriceProps) {
  const onSale =
    compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className ?? ""}`}>
      <span className="text-lg font-semibold text-sky-700">{formatVnd(price)}</span>
      {onSale ? (
        <span className="text-sm text-slate-400 line-through">{formatVnd(compareAtPrice)}</span>
      ) : null}
    </div>
  );
}

import type { CategorySummary } from "@repo/shared";
import Link from "next/link";

type CategoryGridProps = {
  categories: CategorySummary[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  const roots = categories
    .filter((category) => category.parentId === null)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {roots.map((category) => (
        <Link
          key={category.id}
          href={`/danh-muc/${category.slug}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
          <p className="mt-2 text-sm text-slate-500">Xem sản phẩm trong danh mục</p>
        </Link>
      ))}
    </div>
  );
}

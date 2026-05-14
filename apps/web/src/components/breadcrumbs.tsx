import type { CategorySummary } from "@repo/shared";
import Link from "next/link";

type BreadcrumbsProps = {
  items: CategorySummary[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-sky-700">
            Trang chủ
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link href={`/danh-muc/${item.slug}`} className="hover:text-sky-700">
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

"use client";

import type { CategorySummary } from "@repo/shared";
import Link from "next/link";
import { usePathname } from "next/navigation";

type CategorySidebarProps = {
  categories: CategorySummary[];
  onNavigate?: () => void;
  className?: string;
};

export function CategorySidebar({ categories, onNavigate, className }: CategorySidebarProps) {
  const pathname = usePathname();
  const roots = categories
    .filter((category) => category.parentId === null)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const navClassName =
    className ?? "space-y-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm";

  return (
    <nav aria-label="Danh mục sản phẩm" className={navClassName}>
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Danh mục
      </p>
      <ul className="space-y-1">
        {roots.map((category) => {
          const href = `/danh-muc/${category.slug}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={category.id}>
              <Link
                href={href}
                onClick={onNavigate}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sky-50 font-medium text-sky-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-sky-700"
                }`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

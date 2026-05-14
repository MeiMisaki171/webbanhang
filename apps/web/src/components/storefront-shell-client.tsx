"use client";

import type { CategorySummary } from "@repo/shared";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CategorySidebar } from "@/components/category-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type StorefrontShellClientProps = {
  categories: CategorySummary[];
  children: React.ReactNode;
};

export function StorefrontShellClient({ categories, children }: StorefrontShellClientProps) {
  const pathname = usePathname();
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setMobileCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileCategoriesOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileCategoriesOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileCategoriesOpen]);

  if (isAdmin) {
    return children;
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader
        onToggleCategories={() => setMobileCategoriesOpen((open) => !open)}
        categoriesOpen={mobileCategoriesOpen}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <CategorySidebar
            categories={categories}
            className="sticky top-6 space-y-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          />
        </aside>
        <main id="main-content" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
      <SiteFooter />

      {mobileCategoriesOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Đóng danh mục"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileCategoriesOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(20rem,85vw)] bg-white p-4 shadow-xl">
            <CategorySidebar
              categories={categories}
              onNavigate={() => setMobileCategoriesOpen(false)}
              className="h-full overflow-y-auto border-0 p-0 shadow-none"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

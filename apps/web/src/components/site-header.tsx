"use client";

import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { MiniCartButton } from "@/components/mini-cart-button";
import { SearchForm } from "@/components/search-form";

type SiteHeaderProps = {
  onToggleCategories?: () => void;
  categoriesOpen?: boolean;
};

export function SiteHeader({ onToggleCategories, categoriesOpen }: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {onToggleCategories ? (
            <button
              type="button"
              className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-700 hover:border-sky-300 hover:text-sky-700 lg:hidden"
              aria-label="Danh mục"
              aria-expanded={categoriesOpen}
              onClick={onToggleCategories}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
          <Link href="/" className="text-lg font-semibold text-sky-700">
            Điện Gia Dụng Pro
          </Link>
        </div>
        <SearchForm />
        <nav
          className="flex items-center gap-4 text-sm text-slate-600"
          aria-label="Điều hướng chính"
        >
          <MiniCartButton />
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}

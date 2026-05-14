import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { MiniCartButton } from "@/components/mini-cart-button";
import { SearchForm } from "@/components/search-form";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="text-lg font-semibold text-sky-700">
          Điện Gia Dụng Pro
        </Link>
        <SearchForm />
        <nav
          className="flex items-center gap-4 text-sm text-slate-600"
          aria-label="Điều hướng chính"
        >
          <Link href="/tim-kiem" className="hidden hover:text-sky-700 lg:inline">
            Tìm kiếm
          </Link>
          <MiniCartButton />
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}

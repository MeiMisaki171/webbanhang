import Link from "next/link";
import { SearchForm } from "@/components/search-form";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-sky-700">
            Điện Gia Dụng Pro
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600 lg:hidden">
            <Link href="/cart" className="hover:text-sky-700">
              Giỏ hàng
            </Link>
            <Link href="/account" className="hover:text-sky-700">
              Tài khoản
            </Link>
          </nav>
        </div>
        <SearchForm />
        <nav className="hidden items-center gap-4 text-sm text-slate-600 lg:flex">
          <Link href="/tim-kiem" className="hover:text-sky-700">
            Tìm kiếm
          </Link>
          <Link href="/cart" className="hover:text-sky-700">
            Giỏ hàng
          </Link>
          <Link href="/account" className="hover:text-sky-700">
            Tài khoản
          </Link>
        </nav>
      </div>
    </header>
  );
}

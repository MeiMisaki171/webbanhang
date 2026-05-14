import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-sky-700">
          Điện Gia Dụng Pro
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/" className="hover:text-sky-700">
            Trang chủ
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

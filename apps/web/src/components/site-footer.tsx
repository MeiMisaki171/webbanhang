import Link from "next/link";

const footerLinks = [
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Điều khoản sử dụng", href: "#" },
  { label: "Hỗ trợ khách hàng", href: "#" },
  { label: "Về chúng tôi", href: "#" },
];

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Zalo", href: "#" },
  { label: "YouTube", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-sky-700">Điện Gia Dụng Pro</p>
            <p className="text-sm text-slate-600">
              Đồ gia dụng, điện và điện máy chính hãng, giao hàng toàn quốc.
            </p>
            <p className="text-sm text-slate-600">Hotline: 1900 1234</p>
            <p className="text-sm text-slate-600">Email: support@diengiadungpro.local</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Liên kết</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-sky-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Thanh toán</p>
            <p className="text-sm text-slate-600">COD (thanh toán khi nhận hàng)</p>
            <p className="text-sm text-slate-600">Chuyển khoản ngân hàng</p>
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-sky-300 hover:text-sky-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Điện Gia Dụng Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

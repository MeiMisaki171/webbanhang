import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { StorefrontShell } from "@/components/storefront-shell";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Điện Gia Dụng Pro",
    template: "%s | Điện Gia Dụng Pro",
  },
  description: "Cửa hàng đồ gia dụng, điện và điện máy trực tuyến tại Việt Nam.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Điện Gia Dụng Pro",
    title: "Điện Gia Dụng Pro",
    description: "Cửa hàng đồ gia dụng, điện và điện máy trực tuyến tại Việt Nam.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Bỏ qua đến nội dung chính
        </a>
        <ToastProvider>
          <div className="flex flex-1 flex-col">
            <AuthProvider>
              <StorefrontShell>{children}</StorefrontShell>
            </AuthProvider>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

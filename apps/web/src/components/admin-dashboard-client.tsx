"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatVnd, type AdminDashboardStats } from "@repo/shared";
import { fetchAdminDashboardStats } from "@/lib/admin-client";

export function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchAdminDashboardStats()
      .then((data) => {
        if (active) {
          setStats(data);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Không tải được dashboard.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error}</p>
        <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium underline">
          Đăng nhập admin
        </Link>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-slate-600">Đang tải dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Tổng đơn hàng</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.orderCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Doanh thu</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatVnd(stats.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Ngưỡng sắp hết hàng</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.lowStockThreshold}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Sản phẩm sắp hết hàng</h2>
        {stats.lowStockProducts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Không có sản phẩm dưới ngưỡng.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {stats.lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-slate-500">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-amber-700">Còn {product.stock}</p>
                  <Link href="/admin/products" className="text-sky-700 hover:underline">
                    Quản lý
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

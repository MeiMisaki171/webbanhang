"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatVnd, type AdminProductSummary } from "@repo/shared";
import { fetchAdminProducts } from "@/lib/admin-client";

export function AdminProductsClient() {
  const [products, setProducts] = useState<AdminProductSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminProducts()
      .then((response) => setProducts(response.data))
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Không tải được sản phẩm.");
      });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Danh sách sản phẩm</h2>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-medium text-white"
        >
          Thêm sản phẩm
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-sky-700">
                    {product.name}
                  </Link>
                  <p className="text-xs text-slate-500">{product.sku}</p>
                </td>
                <td className="px-4 py-3">{formatVnd(product.price)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{product.isActive ? "Đang bán" : "Ẩn"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireAuthUser();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold text-slate-900">Tài khoản</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Email</dt>
            <dd className="font-medium text-slate-900">{user.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Số điện thoại</dt>
            <dd className="font-medium text-slate-900">{user.phone ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Họ tên</dt>
            <dd className="font-medium text-slate-900">{user.fullName ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Vai trò</dt>
            <dd className="font-medium text-slate-900">{user.role}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/orders"
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Xem đơn hàng
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}

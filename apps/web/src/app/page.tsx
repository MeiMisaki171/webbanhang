import { fetchHealth } from "@/lib/api-client";

export default async function Home() {
  let healthStatus = "không kết nối được";
  let databaseStatus = "unknown";

  try {
    const health = await fetchHealth();
    healthStatus = health.status;
    databaseStatus = health.database;
  } catch {
    healthStatus = "offline";
    databaseStatus = "down";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-br from-sky-700 to-sky-500 px-6 py-12 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-100">
          Điện Gia Dụng Pro
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
          Đồ gia dụng, điện và điện máy chính hãng, giao nhanh toàn quốc
        </h1>
        <p className="mt-4 max-w-2xl text-base text-sky-50">
          MVP storefront đang được dựng theo phase. Phase 1 đã có schema Postgres,
          API health và shell giao diện tiếng Việt.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">API health</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{healthStatus}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Database</h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{databaseStatus}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Phase tiếp theo</h2>
          <p className="mt-2 text-base text-slate-700">
            Catalog, search và trang chi tiết sản phẩm trên API NestJS.
          </p>
        </article>
      </section>
    </div>
  );
}

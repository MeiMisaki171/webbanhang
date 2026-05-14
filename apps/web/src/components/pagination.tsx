import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export function Pagination({ page, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) {
        continue;
      }

      const normalized = Array.isArray(value) ? value[0] : value;
      if (normalized) {
        params.set(key, normalized);
      }
    }

    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          Trước
        </Link>
      ) : null}
      <span className="text-sm text-slate-600">
        Trang {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          Sau
        </Link>
      ) : null}
    </nav>
  );
}

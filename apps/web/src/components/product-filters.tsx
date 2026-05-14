"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProductFiltersProps = {
  brands: string[];
  basePath: string;
};

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "bestseller", label: "Bán chạy" },
];

export function ProductFilters({ brands, basePath }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <label htmlFor="sort" className="mb-2 block text-sm font-medium text-slate-700">
          Sắp xếp
        </label>
        <select
          id="sort"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="brand" className="mb-2 block text-sm font-medium text-slate-700">
          Thương hiệu
        </label>
        <select
          id="brand"
          value={searchParams.get("brand") ?? ""}
          onChange={(event) => updateParam("brand", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="minPrice" className="mb-2 block text-sm font-medium text-slate-700">
            Giá từ
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(event) => updateParam("minPrice", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="mb-2 block text-sm font-medium text-slate-700">
            Giá đến
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(event) => updateParam("maxPrice", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={searchParams.get("inStock") === "true"}
          onChange={(event) => updateParam("inStock", event.target.checked ? "true" : "")}
        />
        Chỉ hiển thị còn hàng
      </label>
    </aside>
  );
}

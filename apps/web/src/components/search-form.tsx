"use client";

import type { SearchSuggestion } from "@repo/shared";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { fetchSearchSuggestions } from "@/lib/api-client";

export function SearchForm() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchSearchSuggestions(query)
        .then((items) => {
          setSuggestions(items);
          setOpen(true);
        })
        .catch(() => {
          setSuggestions([]);
        });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <form action="/tim-kiem" method="get" className="relative w-full max-w-xl">
      <label htmlFor={inputId} className="sr-only">
        Tìm kiếm sản phẩm
      </label>
      <input
        id={inputId}
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Tìm nồi cơm, tủ lạnh, thiết bị điện..."
        className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
      />
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((item) => (
            <li key={item.id}>
              <Link
                href={`/san-pham/${item.slug}`}
                className="block px-4 py-3 text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{item.name}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {item.brand} · {item.sku}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

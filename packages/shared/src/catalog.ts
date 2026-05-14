import { z } from "zod";

export const productSortSchema = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "bestseller",
]);

export type ProductSort = z.infer<typeof productSortSchema>;

const booleanQuery = z.preprocess((value) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}, z.boolean().optional());

export const productListQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  inStock: booleanQuery,
  onSale: booleanQuery,
  sort: productSortSchema.default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(48).default(12),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const searchQuerySchema = productListQuerySchema.extend({
  q: z.string().trim().default(""),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const searchSuggestQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().positive().max(10).default(5),
});

export type SearchSuggestQuery = z.infer<typeof searchSuggestQuerySchema>;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
};

export type CategoryDetail = CategorySummary & {
  breadcrumbs: CategorySummary[];
  children: CategorySummary[];
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  brand: string;
  soldCount: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ProductDetail = ProductCard & {
  description: string;
  specs: Record<string, string>;
  images: ProductImage[];
  categoryBreadcrumbs: CategorySummary[];
  relatedProducts: ProductCard[];
};

export type SearchSuggestion = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: number;
  imageUrl: string | null;
};

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

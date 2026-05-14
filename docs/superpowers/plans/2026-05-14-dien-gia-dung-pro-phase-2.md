# Điện Gia Dụng Pro — Phase 2 Implementation Plan

**Trạng thái:** Hoàn thành (2026-05-14)

**Goal:** Catalog và search storefront trên Postgres thật: danh mục, danh sách/lọc/sắp xếp sản phẩm, PDP, tìm kiếm + gợi ý; web đồng bộ filter qua URL query.

**Phụ thuộc:** Phase 1 (schema, seed, API shell, web shell).

**Verification (spec):** Duyệt/lọc/tìm qua API + DB; `pnpm build` và `pnpm test` pass.

---

### Task 1: Shared catalog contracts

**Files:**
- `packages/shared/src/catalog.ts`
- `packages/shared/src/index.ts` (re-export)

- [x] Zod `productListQuerySchema`: `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `onSale`, `sort`, `page`, `pageSize`.
- [x] `searchQuerySchema`, `searchSuggestQuerySchema`.
- [x] Types: `CategorySummary`, `CategoryDetail`, `ProductCard`, `ProductDetail`, `PaginatedResponse`, `SearchSuggestion`.
- [x] Helper `buildPaginationMeta`.

### Task 2: API catalog module

**Files:**
- `apps/api/src/catalog/catalog.module.ts`
- `apps/api/src/catalog/catalog.controller.ts`
- `apps/api/src/catalog/catalog.service.ts`
- `apps/api/src/catalog/catalog.repository.ts`
- `apps/api/src/catalog/catalog.service.spec.ts`

- [x] `GET /api/v1/categories` — danh mục active, sort `sortOrder` + tên.
- [x] `GET /api/v1/categories/:slug` — chi tiết, breadcrumbs cha-con, children.
- [x] `GET /api/v1/products` — filter theo query shared; resolve `category` slug → cây con; sort `newest` | `price_asc` | `price_desc` | `bestseller`.
- [x] `GET /api/v1/products/brands/list` — thương hiệu (tuỳ chọn theo category).
- [x] `GET /api/v1/products/:slug` — PDP: mô tả, specs JSON, ảnh, breadcrumbs, related.
- [x] Repository Prisma: index/filter, `ILIKE` tìm kiếm trên name/shortDescription/sku/brand.
- [x] Unit test: category slug không tồn tại → pagination rỗng; breadcrumbs; product missing → 404.

### Task 3: API search module

**Files:**
- `apps/api/src/search/search.module.ts`
- `apps/api/src/search/search.controller.ts`

- [x] `GET /api/v1/search` — cùng filter/sort/pagination + `q`.
- [x] `GET /api/v1/search/suggest` — gợi ý theo `q`, `limit` (tối đa 10).

### Task 4: Web API client & query helpers

**Files:**
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/lib/query.ts`

- [x] Typed client: categories, products, product detail, search, suggest, brands.
- [x] `buildQuery` / parse URL cho filter storefront.

### Task 5: Web storefront pages & components

**Files:**
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/danh-muc/[slug]/page.tsx`
- `apps/web/src/app/san-pham/[slug]/page.tsx`
- `apps/web/src/app/tim-kiem/page.tsx`
- `apps/web/src/components/site-header.tsx`, `search-form.tsx`, `category-grid.tsx`, `product-grid.tsx`, `product-card.tsx`, `product-filters.tsx`, `pagination.tsx`, `breadcrumbs.tsx`, `price.tsx`

- [x] Home: hero, danh mục, sản phẩm bán chạy, khuyến mãi (`onSale`).
- [x] Trang danh mục: lọc brand/giá/tồn/sale, sort, phân trang; query trên URL.
- [x] PDP: ảnh, giá VND, tồn, mô tả, specs, liên quan; `generateMetadata` + Open Graph cơ bản.
- [x] Tìm kiếm: `q` + filter; gợi ý debounce từ header (`SearchForm`).

### Task 6: Verification

- [x] `pnpm --filter @repo/api test` (catalog specs).
- [x] `pnpm --filter @repo/web build`.
- [x] Dữ liệu từ seed Postgres; không mock catalog trong luồng chính.

**Chưa trong Phase 2 (phase sau):** giỏ, checkout, auth, admin, upload S3.

# Điện Gia Dụng Pro — Phase 5 Implementation Plan

**Trạng thái:** Hoàn thành (2026-05-14)

**Goal:** Admin CRUD danh mục/sản phẩm, upload ảnh S3 presign, xem/cập nhật đơn và thanh toán, dashboard; UI `/admin/*` gọi REST với cookie admin.

**Phụ thuộc:** Phase 1–4 (schema, catalog, checkout/orders, JWT `JwtAuthGuard` + `RolesGuard`).

**Verification (spec):** Admin đổi giá/tồn phản ánh storefront qua catalog API; `pnpm --filter @repo/shared build`, `pnpm --filter @repo/api test`, `pnpm --filter @repo/api build`, `pnpm --filter @repo/web build`.

---

### Task 1: Shared admin contracts

**Files:**
- `packages/shared/src/admin.ts`
- `packages/shared/src/index.ts`

- [x] Zod: login admin, category/product input, order list query, PATCH order/payment status, upload presign.
- [x] Types: cây danh mục admin, product summary/detail, order list/detail, dashboard stats, presign response.

### Task 2: API admin + guard

**Files:**
- `apps/api/src/admin/**`
- `apps/api/src/app.module.ts`

- [x] `POST /auth/login` (Phase 4) + cookie access JWT; `JwtAuthGuard` + `RolesGuard` + `@Roles(ADMIN)` trên `/admin/**` và `POST /upload/presign`.
- [x] CRUD `GET/POST/PATCH/DELETE /admin/categories` (cây cha-con).
- [x] CRUD `GET/POST/PATCH/DELETE /admin/products` (giá, tồn, specs JSON, ảnh URL).
- [x] `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id`, `PATCH /admin/payments/:id`.
- [x] `GET /admin/dashboard/stats` — tổng đơn, doanh thu (`COMPLETED` hoặc payment `PAID`), low stock theo `LOW_STOCK_THRESHOLD`.
- [x] Unit test `AdminCategoriesService` (slug trùng, xóa khi còn sản phẩm).

### Task 3: Upload & payments

**Files:**
- `apps/api/src/upload/**`
- `apps/api/src/payments/**`

- [x] `POST /upload/presign` — S3-compatible (`S3_*` env), guard admin.
- [x] `PaymentProvider` interface + stub provider.
- [x] `POST /payments/webhook/:provider` — no-op acknowledge.

### Task 4: Web admin UI

**Files:**
- `apps/web/src/lib/admin-client.ts`
- `apps/web/src/app/admin/**`
- `apps/web/src/components/admin-*-client.tsx`
- `apps/web/next.config.ts` (remote image localhost:9000)

- [x] `/admin/login` dùng `auth-client.login` (admin seed); các trang admin gọi REST với cookie Phase 4.

### Task 5: Verification

- [x] Shared build, API test/build, web build.

**Chưa Phase 5:** Register khách, merge giỏ, `/auth/me` storefront, route guard account/orders (Phase 4).

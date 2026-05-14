# Điện Gia Dụng Pro — Phase 6 Implementation Plan

**Trạng thái:** Hoàn thành baseline (2026-05-14); **bổ sung storefront shell chưa làm** (Task 6–8).

**Goal:** Polish storefront (mobile-first sky/white/gray), SEO metadata, toast/skeleton/empty UX, mini cart header, mở rộng test giỏ/đơn/kho API, tài liệu deploy Vercel + VPS, cập nhật smoke checklist.

**Phụ thuộc:** Phase 1–3 (catalog, cart, checkout); không yêu cầu hoàn tất Phase 4–5 cho polish Phase 6.

**Verification (spec §9, §11, §13, §14):** `pnpm test`, `pnpm build` pass; smoke 1–3 xác minh local; deploy public (mục 6) manual.

---

### Task 1: API tests giỏ / checkout / kho

**Files:**
- `apps/api/src/cart/cart.service.spec.ts`
- `apps/api/src/checkout/checkout.service.spec.ts`
- `apps/api/src/checkout/checkout.repository.spec.ts`

- [x] Sửa signature test theo `userId` + `guestToken` (Phase 4).
- [x] Cart: vượt tồn, thêm/cập nhật/xóa, merge guest → user clamp stock.
- [x] Checkout service: giỏ trống, ward sai tỉnh, map `INSUFFICIENT_STOCK`, tạo đơn guest.
- [x] Checkout repository: `updateMany` trừ stock, xóa cart items sau đơn.

### Task 2: Web UX polish

**Files:**
- `apps/web/src/components/ui/skeleton.tsx`, `empty-state.tsx`, `toast-provider.tsx`
- `apps/web/src/components/mini-cart-button.tsx`, `site-header.tsx`
- `apps/web/src/components/cart-page-client.tsx`, `checkout-page-client.tsx`, `add-to-cart-button.tsx`
- `apps/web/src/app/layout.tsx`, `globals.css`

- [x] Skeleton giỏ/checkout; empty state giỏ/checkout/lỗi tải.
- [x] Toast thành công/lỗi (`aria-live`); skip link + label form.
- [x] Mini cart count header (gọi `fetchCart`, không mock).
- [x] Palette sky/slate, bỏ dark mode tự động.

### Task 3: SEO metadata

**Files:**
- `apps/web/src/app/layout.tsx`, `page.tsx`, `danh-muc/[slug]/page.tsx`, `tim-kiem/page.tsx`

- [x] `metadataBase`, title template, Open Graph root.
- [x] Home keywords + OG; category/search dynamic metadata.

### Task 4: Deploy & docs

**Files:**
- `README.md`, `.env.example` (`NEXT_PUBLIC_SITE_URL`)
- `docs/superpowers/plans/2026-05-14-dien-gia-dung-pro-progress.md`

- [x] Hướng dẫn Vercel (web), VPS (API, Postgres, S3), tài khoản seed, smoke checklist.
- [x] Cross-link webhook payment stub trong spec (không triển khai provider thật).
- [x] `docker-compose.yml` Postgres local (đã có).

### Task 5: Verification

- [x] `pnpm test` monorepo.
- [x] `pnpm build` monorepo.

**Chưa Phase 6 (manual / phase khác):** smoke #4–#6 production URL; auth order history; admin CRUD.

---

## Phase 6 bổ sung — Storefront shell (chưa làm)

**Spec:** [§9.2 Storefront shell](../../specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md#92-storefront-shell--sidebar-footer-search-trên-home-đã-chốt)

### Task 6: Layout storefront + sidebar + footer

**Files:**
- `apps/web/src/app/(storefront)/layout.tsx` (hoặc refactor `layout.tsx` + route group)
- `apps/web/src/components/category-sidebar.tsx`, `category-sidebar-drawer.tsx`
- `apps/web/src/components/site-footer.tsx`
- `apps/web/src/components/site-header.tsx`

- [ ] Shell header → sidebar + `main` + footer cho mọi trang ngoài `/admin/*`.
- [ ] Sidebar: danh mục gốc từ `fetchCategories`; highlight route; desktop cố định, mobile icon toggle drawer.
- [ ] Footer: liên hệ, cột link placeholder, COD/chuyển khoản, social placeholder; sticky bottom qua flex layout.

### Task 7: Search trên home + gỡ `/tim-kiem`

**Files:**
- `apps/web/src/app/(storefront)/page.tsx`
- `apps/web/src/components/search-form.tsx`
- `apps/web/src/app/tim-kiem/page.tsx` (redirect) hoặc xóa route + `next.config` redirect
- `apps/web/src/components/product-filters.tsx` (basePath `/`)

- [ ] `SearchForm` action `/?q=...`; home đọc `searchParams` khi có `q`.
- [ ] Tái dùng `searchProducts` + filters + pagination trên home; ẩn hero khi có `q`.
- [ ] Bỏ link “Tìm kiếm” header; redirect `/tim-kiem` → `/?q=...`.
- [ ] Bỏ `CategoryGrid` trên home (danh mục đã ở sidebar).

### Task 8: Verification bổ sung

- [ ] `pnpm --filter @repo/web build`
- [ ] Smoke: sidebar/footer trên cart/checkout/login; mobile drawer; search `/?q=`; admin không shell storefront.

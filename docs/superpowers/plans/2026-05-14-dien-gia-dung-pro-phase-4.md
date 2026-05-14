# Điện Gia Dụng Pro — Phase 4 Implementation Plan

**Trạng thái:** Hoàn thành baseline (2026-05-14); **bổ sung auth/state + email/SĐT chưa làm** (xem cuối file).

**Goal:** JWT auth (httpOnly cookies), route bảo vệ web/API, giỏ khách merge khi đăng nhập, checkout gắn `userId`, lịch sử đơn cho user.

**Goal bổ sung (spec §6, §9.1):** refresh cookie + `rememberMe`, đăng ký/đăng nhập email hoặc SĐT, Zustand auth/cart dedupe, guard client hydration-safe, khách không gọi `GET /auth/me` khi storage không có user.

**Phụ thuộc:** Phase 3 (cart/checkout/orders), schema `User`/`Cart.userId`/`Order.userId`.

**Verification (spec):** Login thấy lịch sử đơn; `pnpm --filter @repo/shared build`, `pnpm --filter @repo/api test`, `pnpm --filter @repo/api build`, `pnpm --filter @repo/web build`.

---

### Task 1: Shared auth contracts

**Files:**
- `packages/shared/src/auth.ts`
- `packages/shared/src/index.ts`

- [x] Zod `registerSchema`, `loginSchema`; types `AuthUser`, `OrderListItemView`.
- [x] Hằng cookie `AUTH_ACCESS_COOKIE`, `AUTH_REFRESH_COOKIE`.

### Task 2: API auth module

**Files:**
- `apps/api/src/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`, `auth.service.spec.ts`
- `apps/api/src/common/auth-cookies.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`, `roles.guard.ts`
- `apps/api/src/common/decorators/current-user.decorator.ts`, `roles.decorator.ts`
- `apps/api/src/app.module.ts` (import `AuthModule`)

- [x] `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- [x] JWT access + refresh trong httpOnly cookies; bcrypt mật khẩu; CORS credentials.
- [x] Unit test `AuthService` (email trùng, mật khẩu sai, phát hành token).

### Task 3: Cart/checkout/orders cho user + merge giỏ

**Files:**
- `apps/api/src/cart/*`, `apps/api/src/checkout/*`, `apps/api/src/orders/*`

- [x] Cart theo `userId` khi đăng nhập; cookie `dgp_guest_token` cho khách.
- [x] Login/register merge guest cart → user cart (cộng qty, clamp tồn).
- [x] Checkout gắn `userId` khi có session.
- [x] `GET /orders` (owner); `GET /orders/:code` kiểm tra owner khi đã đăng nhập.
- [x] Unit test merge giỏ trong `cart.service.spec.ts`.

### Task 4: Web auth UX

**Files:**
- `apps/web/src/lib/auth-client.ts`, `auth-server.ts`
- `apps/web/src/app/login/page.tsx`, `register/page.tsx`, `account/page.tsx`, `orders/page.tsx`
- `apps/web/src/components/login-page-client.tsx`, `register-page-client.tsx`, `account-menu.tsx`, `logout-button.tsx`
- `apps/web/src/components/site-header.tsx`

- [x] Login/register với `credentials: "include"`.
- [x] `/account`, `/orders` bảo vệ (redirect `/login`).
- [x] Header hiển thị đăng nhập hoặc tên tài khoản.

### Task 5: Verification

- [x] `pnpm --filter @repo/shared build`
- [x] `pnpm --filter @repo/api test` (19 passed)
- [ ] `pnpm --filter @repo/api build` (blocked by existing `admin-orders.service.ts` Prisma enum vs `@repo/shared` types)
- [x] `pnpm --filter @repo/web build`

---

## Phase 4 bổ sung — Auth production storefront (chưa làm)

**Spec:** [§6 Authentication](../../specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md#6-authentication--authorization), [§9.1 Storefront auth state](../../specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md#91-storefront-auth-state--cart-sync-đã-chốt)

### Task 6: Shared identity contracts (email / SĐT)

**Files:**
- `packages/shared/src/auth.ts`
- `packages/db/prisma/schema.prisma` + migration
- `packages/db/prisma/seed.ts` (nếu cần)

- [ ] `User.phone` nullable `@unique`; `User.email` nullable `@unique`; service đảm bảo ít nhất một identifier.
- [ ] `registerSchema`: `email?`, `phone?`, `password`, `fullName?` + refine ít nhất một identifier; chuẩn hóa SĐT VN.
- [ ] `loginSchema`: `identifier` + `password`.
- [ ] `AuthUser`: `email | null`, `phone | null`, `createdAt`.

### Task 7: API auth refresh & identifier login

**Files:**
- `apps/api/src/auth/auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`, `auth.service.spec.ts`
- `apps/api/src/common/auth-cookies.ts`

- [ ] `POST /auth/refresh` từ refresh cookie; rotate/set lại cookies.
- [ ] Login `identifier` → `findByEmail` hoặc `findByPhone`; register kiểm tra trùng từng field gửi lên.
- [ ] `rememberMe` trên login điều chỉnh `Max-Age` refresh cookie.
- [ ] Unit test: login SĐT, register chỉ SĐT, refresh, 401 khi identifier sai.

### Task 8: Web API client & auth store

**Files:**
- `apps/web/package.json` (`zustand`, `immer`; `tsx` dev cho test nếu cần)
- `apps/web/src/stores/auth.store.ts`, `auth.selectors.ts`, `auth.persist.ts`, `auth.types.ts`
- `apps/web/src/services/auth.service.ts`, `session.service.ts`
- `apps/web/src/lib/api-client.ts` (hoặc mở rộng client hiện có)
- `apps/web/src/hooks/use-auth.ts`
- `apps/web/src/providers/auth-provider.tsx`
- `apps/web/src/stores/auth.store.test.ts`

- [ ] `fetch` + `credentials: "include"`; 401 → refresh dedupe → retry; refresh fail → `expired` + clear persist.
- [ ] Bootstrap: không `me` khi không có `user` persist; có user → reconcile `me`.
- [ ] Persist chỉ profile/metadata; không token trong storage.
- [ ] Hooks/selectors: `useAuthUser`, `useIsAuthenticated`, `useAuthStatus`, `useAuthActions`.
- [ ] Multi-tab logout: `BroadcastChannel` + clear persist.

### Task 9: Cart store dedupe & header

**Files:**
- `apps/web/src/stores/cart.store.ts` (hoặc tách slice trong storefront store theo spec)
- `apps/web/src/components/storefront-bootstrap.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/site-header.tsx`, `mini-cart-button.tsx`, `account-menu.tsx`

- [ ] Một instance mini cart + account menu; cart bootstrap một lần.
- [ ] Login/register/logout và mutation giỏ cập nhật cart store; bỏ fetch trùng trong header.

### Task 10: Guards & auth pages

**Files:**
- `apps/web/src/guards/protected-route.tsx`, `guest-route.tsx`, `role-route.tsx`
- `apps/web/src/components/login-page-client.tsx`, `register-page-client.tsx`, `logout-button.tsx`
- `apps/web/src/app/account/page.tsx`, `orders/page.tsx` (layout/guard client)

- [ ] Login một ô identifier; register email/SĐT với validate ít nhất một.
- [ ] `ProtectedRoute` / `GuestRoute` / `RoleRoute`; redirect sau login; loading khi `status === loading`.

### Task 11: Verification bổ sung

- [ ] `pnpm --filter @repo/shared build` && `pnpm --filter @repo/api test`
- [ ] `pnpm --filter @repo/web test` (store bootstrap: khách không gọi `me`)
- [ ] `pnpm --filter @repo/web build`
- [ ] Smoke: trang chủ khách — 0 `/auth/me`, 1 `/cart`; đăng nhập SĐT-only; reload có user persist + reconcile `me`.

---

**Phase tiếp theo:** [Phase 5 — Admin & upload](./2026-05-14-dien-gia-dung-pro-phase-5.md) · [Tiến độ tổng](./2026-05-14-dien-gia-dung-pro-progress.md)

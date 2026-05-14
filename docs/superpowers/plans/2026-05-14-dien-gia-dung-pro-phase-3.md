# Điện Gia Dụng Pro — Phase 3 Implementation Plan

**Trạng thái:** Hoàn thành (2026-05-14)

**Goal:** Giỏ khách, checkout tạo đơn trong transaction (trừ kho), thanh toán COD/chuyển khoản trên UI; địa chỉ tỉnh/thành + phường/xã từ master seed.

**Phụ thuộc:** Phase 1 (schema Cart/Order/Payment, geo seed), Phase 2 (PDP, catalog).

**Verification (spec):** E2E tạo đơn trên DB; `pnpm build`, `pnpm test` pass.

---

### Task 1: Shared commerce contracts

**Files:**
- `packages/shared/src/enums.ts` (tách enums khỏi `index.ts`)
- `packages/shared/src/commerce.ts`
- `packages/shared/src/index.ts`

- [x] Hằng `GUEST_CART_COOKIE` (`dgp_guest_token`).
- [x] Zod: `addCartItemSchema`, `updateCartItemSchema`, `checkoutAddressSchema`, `checkoutSchema` (`paymentMethod` COD | BANK_TRANSFER).
- [x] Types: `CartView`, `CartItemView`, `OrderView`, `ShippingAddressSnapshot`, `ProvinceSummary`, `WardSummary`, `BankTransferInfo`.

### Task 2: API geo

**Files:**
- `apps/api/src/geo/geo.module.ts`, `geo.controller.ts`, `geo.service.ts`

- [x] `GET /api/v1/geo/provinces`.
- [x] `GET /api/v1/geo/wards?provinceCode=` — validate thiếu mã → 400.

### Task 3: API cart (khách)

**Files:**
- `apps/api/src/common/guest-cart-cookie.ts`
- `apps/api/src/cart/cart.module.ts`, `cart.controller.ts`, `cart.service.ts`, `cart.repository.ts`, `cart.service.spec.ts`

- [x] `GET /cart` — lấy hoặc tạo giỏ `guestToken`; Set-Cookie httpOnly `SameSite=Lax`, 30 ngày.
- [x] `POST /cart/items` — merge quantity, kiểm tra tồn active.
- [x] `PATCH /cart/items/:id`, `DELETE /cart/items/:id`.
- [x] Unit test: vượt tồn; cập nhật/xóa item; item không tồn tại.

**Chưa Phase 3:** cart `userId`, merge khi login (Phase 4).

### Task 4: API checkout & orders

**Files:**
- `apps/api/src/checkout/checkout.module.ts`, `checkout.controller.ts`, `checkout.service.ts`, `checkout.repository.ts`, `checkout.service.spec.ts`
- `apps/api/src/orders/orders.module.ts`, `orders.controller.ts`, `orders.service.ts`

- [x] `GET /checkout/summary` — `shippingFee` từ `SHIPPING_FLAT_FEE`.
- [x] `POST /checkout` — validate địa chỉ (province/ward trong DB); transaction Prisma:
  - `updateMany` trừ `stock` + tăng `soldCount` (từ chối nếu không đủ);
  - tạo `Order` (mã `DGP-YYYYMMDD-XXXXXX`), `OrderItem` snapshot, `Payment` `UNPAID`;
  - snapshot `shippingAddress` JSON (tên + mã tỉnh/phường);
  - xóa `CartItem` sau khi thành công.
- [x] `GET /orders/:code` — chi tiết đơn; chuyển khoản kèm `bankTransfer` từ `BANK_*`.
- [x] Unit test: giỏ trống; ward không thuộc tỉnh.

**Chưa Phase 3:** `PaymentProvider` webhook, guard owner/admin (Phase 4–5).

### Task 5: Web commerce UI

**Files:**
- `apps/web/src/lib/commerce-client.ts` (`credentials: "include"`)
- `apps/web/src/lib/api-client.ts` (`fetchOrder`)
- `apps/web/src/components/add-to-cart-button.tsx`, `cart-page-client.tsx`, `checkout-page-client.tsx`
- `apps/web/src/app/cart/page.tsx`, `checkout/page.tsx`, `don-hang/[code]/page.tsx`
- `apps/web/src/app/san-pham/[slug]/page.tsx` (nút thêm giỏ)

- [x] PDP: chọn số lượng, thêm giỏ → `/cart`.
- [x] `/cart`: danh sách, đổi số lượng, xóa, tóm tắt, link checkout.
- [x] `/checkout`: form giao hàng, chọn tỉnh → phường, COD / chuyển khoản, phí ship + tổng.
- [x] `/don-hang/[code]`: xác nhận; COD hoặc QR/thông tin CK.

### Task 6: Verification

- [x] `pnpm test` monorepo; API 9 tests pass.
- [x] E2E API (cookie jar): thêm giỏ → checkout COD → đơn `PENDING`, payment `COD`/`UNPAID`, tồn giảm trên Postgres.

**Ví dụ E2E:** `DGP-20260514-IH9G8M`, tổng 1.320.000 ₫ (tạm tính + phí ship 30.000 ₫).

**Chưa Phase 3:** lịch sử đơn theo user, admin đổi trạng thái, upload ảnh S3.

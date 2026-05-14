# Storefront global state — dedupe cart/auth và Zustand

**Date:** 2026-05-14  
**Status:** Approved (brainstorming)  
**Scope:** `apps/web` storefront — gom session + giỏ hàng vào Zustand, persist profile user trong `localStorage`, loại bỏ gọi trùng `/auth/me` và `/cart` trên trang chủ.

## 1. Problem

Trên trang chủ (và mọi trang dùng `SiteHeader`), Network tab ghi nhận **hai request** tới `GET /api/v1/auth/me` và `GET /api/v1/cart` dù khách chưa đăng nhập.

**Nguyên nhân trực tiếp:** `SiteHeader` render **hai instance** `MiniCartButton` và **hai instance** `AccountMenu` (nav mobile `lg:hidden` và nav desktop `hidden lg:flex`). Mỗi component client gọi API trong `useEffect` riêng khi mount.

**Hệ quả:** Tải API thừa, badge giỏ và menu tài khoản không đồng bộ sau login/logout hoặc mutation giỏ nếu chỉ dựa `router.refresh()`.

## 2. Goals & Non-Goals

### Goals

- Mỗi endpoint `auth/me` và `cart` **tối đa một in-flight request** khi bootstrap storefront trong một tab.
- **Zustand** làm global state cho storefront; **persist** profile `AuthUser` vào `localStorage` sau login/register và khi `auth/me` xác nhận.
- Đồng bộ toàn storefront: header, cart page, checkout, add-to-cart, login/register/logout dùng chung state; mutation cập nhật store ngay, không cần `router.refresh()` chỉ để cập nhật header.
- `SiteHeader` chỉ còn **một** `MiniCartButton` và **một** `AccountMenu`, bố cục responsive bằng CSS.

### Non-Goals

- Không đổi contract API NestJS hoặc cookie JWT httpOnly.
- Không lưu token JWT trong `localStorage` / `sessionStorage`.
- Không persist giỏ hàng trong browser storage (server + guest cart cookie là nguồn sự thật).
- Không đưa admin login (`/admin/login`) vào storefront store.
- Không thêm SWR, TanStack Query hay React Context song song với Zustand cho cùng dữ liệu.

## 3. Architecture

### Chosen approach

**Zustand store + bootstrap client component** (đã chốt trong brainstorming):

| Layer | Trách nhiệm |
|-------|-------------|
| `apps/web/src/stores/storefront-store.ts` | State `user`, `cart`, `sessionStatus`, `cartStatus`; actions bootstrap, auth, cart mutations; dedupe in-flight |
| `persist` (Zustand middleware) | Chỉ rehydrate/ghi slice `user` vào `localStorage`, key `dgp-storefront` |
| `StorefrontBootstrap` | Client component mount một lần, gọi `bootstrap()`; đặt trong root `layout.tsx` |
| `auth-client.ts` / `commerce-client.ts` | Giữ làm HTTP client; store gọi các hàm này, UI không fetch trực tiếp trừ geo/checkout summary |

### Rejected alternatives

| Alternative | Lý do loại |
|-------------|------------|
| Chỉ gom header, không global state | Không đồng bộ mutation giữa trang và header. |
| React Context thuần | User yêu cầu Zustand + persist user. |
| SWR / TanStack Query | Dependency mới; vượt phạm vi MVP cho một store nhỏ. |

### State shape

```ts
type LoadStatus = "idle" | "loading" | "ready" | "error";

type StorefrontState = {
  user: AuthUser | null;
  cart: CartView | null;
  sessionStatus: LoadStatus;
  cartStatus: LoadStatus;
  bootstrap: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshCart: () => Promise<void>;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  addCartItem: (productId: string, quantity: number) => Promise<CartView>;
  updateCartItem: (itemId: string, quantity: number) => Promise<CartView>;
  removeCartItem: (itemId: string) => Promise<CartView>;
};
```

`itemCount` cho header lấy từ `cart?.itemCount` (hoặc `0` khi `cart` null).

### Persist rules

- **Persist:** `user` (các field `AuthUser` từ `@repo/shared`).
- **Không persist:** `cart`, `sessionStatus`, `cartStatus`, promise dedupe refs.
- **Logout / `auth/me` trả 401:** `user = null` và xóa dữ liệu user đã persist.
- **Token:** chỉ cookie httpOnly (`dgp_access_token`, `dgp_refresh_token`); không ghi token vào storage.

## 4. Data Flow

### Bootstrap (mỗi full load / hard navigation vào app)

1. Zustand `persist` rehydrate `user` từ `localStorage` (nếu có) để UI header có thể hiện tên ngay.
2. `StorefrontBootstrap` gọi `bootstrap()` **một lần**; bên trong dedupe nếu đã có promise in-flight.
3. Song song: `fetchMe()` và `fetchCart()`.
4. `fetchMe` thành công → `set user`, persist cập nhật.
5. `fetchMe` 401 → `user = null`, clear persist user.
6. `fetchCart` thành công → `set cart`.
7. Cập nhật `sessionStatus` / `cartStatus` tương ứng (`loading` → `ready` hoặc `error`).

### Auth

- **Login / register:** gọi API → nhận `AuthUser` → `set user` + persist → `refreshCart()` (phản ánh merge guest cart phía server).
- **Logout:** `POST /auth/logout` → clear user + persist → `refreshCart()` (guest cart).

### Cart mutations

- `addCartItem`, `updateCartItem`, `removeCartItem` gọi `commerce-client`, gán `cart` từ response.
- `AddToCartButton`, `CartPageClient`, `CheckoutPageClient` (phần cart) đọc/ghi qua store; checkout vẫn fetch riêng `provinces` và `checkout/summary`.

### Header

- Một `<nav>` responsive; `MiniCartButton` subscribe `cart` / `cartStatus`; `AccountMenu` subscribe `user` / `sessionStatus`.
- Bỏ `useEffect` fetch cục bộ trong hai component trên.

## 5. Error Handling & Edge Cases

| Tình huống | Hành vi |
|------------|---------|
| `fetchMe` lỗi mạng (không phải 401) | Giữ `user` đã rehydrate; `sessionStatus = error`; có thể retry qua `refreshSession()`. |
| `fetchMe` 401 | Coi là khách; `user = null`; xóa persist user. |
| `fetchCart` lỗi | `cartStatus = error`; header badge coi như 0 hoặc ẩn badge; trang cart/checkout hiện lỗi + toast như hiện tại. |
| Mutation cart lỗi | Không đổi `cart` đã có; component hiện toast lỗi. |
| `localStorage` không khả dụng | Bỏ qua persist; state chỉ trong RAM. |
| React Strict Mode (dev) | Dedupe `bootstrap` / `refresh*` để không nhân đôi request. |
| Tab khác logout | Không đồng bộ cross-tab trong MVP; lần `bootstrap` hoặc `refreshSession` tiếp theo sẽ reconcile. |

## 6. Files to Touch (implementation hint)

**Create**

- `apps/web/src/stores/storefront-store.ts`
- `apps/web/src/components/storefront-bootstrap.tsx`
- Test store (ví dụ `apps/web/src/stores/storefront-store.test.ts` hoặc theo convention hiện có)

**Modify**

- `apps/web/package.json` — dependency `zustand`
- `apps/web/src/app/layout.tsx` — bọc `StorefrontBootstrap`
- `apps/web/src/components/site-header.tsx` — một nav, một instance mỗi widget
- `apps/web/src/components/mini-cart-button.tsx`
- `apps/web/src/components/account-menu.tsx`
- `apps/web/src/components/add-to-cart-button.tsx`
- `apps/web/src/components/cart-page-client.tsx`
- `apps/web/src/components/checkout-page-client.tsx` — cart từ store; giữ fetch geo/summary
- `apps/web/src/components/login-page-client.tsx`
- `apps/web/src/components/register-page-client.tsx`
- `apps/web/src/components/logout-button.tsx`

**Unchanged**

- `apps/api/**` auth/cart endpoints
- `apps/web/src/lib/auth-client.ts` / `commerce-client.ts` — chữ ký hàm giữ nguyên trừ khi cần export type nhỏ cho test

## 7. Testing

### Unit / store

- `bootstrap` chỉ một cặp `fetchMe` + `fetchCart` khi gọi lặp in-flight.
- Login/register set `user` và persist slice.
- Logout và 401 clear `user` + persist.
- Mutation cart cập nhật `cart.itemCount`.

### Manual smoke

- Trang chủ, chưa đăng nhập: đúng **một** request `/auth/me` và **một** `/cart`.
- Login: header đổi không full reload; reload trang vẫn hiện user từ persist + `me` reconcile.
- Thêm giỏ từ PDP: badge header đổi mà không cần refresh chỉ cho header.
- Logout: menu về “Đăng nhập”, persist user bị xóa.

## 8. Success Criteria

- Không còn duplicate mount-driven fetch cho `auth/me` và `cart` trên homepage.
- Storefront UI dùng Zustand cho session + cart; user profile persist trong `localStorage` khi đã xác thực.
- JWT không xuất hiện trong browser storage.
- Luồng cart/auth hiện có (guest cart, merge khi login) vẫn hoạt động qua API hiện tại.

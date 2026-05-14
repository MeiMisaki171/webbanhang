# Điện Gia Dụng Pro — MVP E-commerce Design

**Date:** 2026-05-14  
**Status:** Approved (brainstorming)  
**Scope:** MVP storefront + admin tối thiểu trên PostgreSQL thật, không mock luồng catalog/cart/order/auth.

## 1. Goals & Non-Goals

### Goals

- Cửa hàng online đồ gia dụng, điện và điện máy tại Việt Nam: tiếng Việt, VND (`1.290.000 ₫`).
- Luồng mua hàng end-to-end trên database thật: duyệt danh mục → chi tiết → giỏ → checkout → đơn hàng → thanh toán (COD / chuyển khoản).
- Admin tối thiểu: CRUD danh mục/sản phẩm (upload ảnh), xem/cập nhật đơn và trạng thái thanh toán, dashboard đơn giản.
- Deploy production: Next.js trên Vercel; Postgres, S3-compatible storage và NestJS API trên VPS (có thể chuyển web về VPS sau).

### Non-Goals (backlog)

- Đa ngôn ngữ, đa cửa hàng, ERP, kho đa chi nhánh, marketing automation.
- Voucher phức tạp, chat support, so sánh sản phẩm, wishlist, native app.
- Review sản phẩm (schema optional, không triển khai MVP).
- Cổng thanh toán VNPay/MoMo/ZaloPay thật (chỉ interface + webhook stub).
- Quên mật khẩu qua email (MVP+ nếu cấu hình SMTP).

## 2. Architecture Decision

### Chosen approach

**REST + shared Prisma monorepo** (khuyến nghị và đã chốt):

- `apps/api` (NestJS): API duy nhất cho catalog, search, cart, checkout, orders, payments, auth, admin, upload.
- `apps/web` (Next.js App Router): UI storefront + admin; gọi REST qua HTTP; không Prisma trực tiếp trong luồng nghiệp vụ chính.
- `packages/db`: Prisma schema, migrations, seed, exported client.
- `packages/shared`: Zod DTO/schemas, enums, hằng số, format VND.

### Rejected alternatives

| Alternative | Lý do loại |
|-------------|------------|
| GraphQL (NestJS + Apollo) | Phức tạp cache/SSR; vượt nhu cầu MVP. |
| BFF Next.js đọc Prisma + NestJS chỉ mutation | Trùng logic, hai nơi đụng DB; không khớp yêu cầu API duy nhất. |
| Next.js route handlers làm backend chính | User chọn NestJS làm backend. |

### Runtime topology

```text
[Browser / RSC] → HTTPS → apps/web (Vercel)
                              ↓ REST
                         apps/api (VPS, Nginx + TLS)
                              ↓
                    PostgreSQL (VPS, self-host)
                    S3-compatible object storage (VPS hoặc cloud S3-compatible)
```

- **Web:** Vercel, biến `NEXT_PUBLIC_API_URL` trỏ API public.
- **API:** Cùng VPS với Postgres và object storage (hoặc storage endpoint reachable từ API); reverse proxy Nginx.
- **Database:** PostgreSQL self-host; connection string qua `DATABASE_URL` (SSL khi production).
- **Storage:** S3-compatible (MinIO trên VPS, AWS S3, Cloudflare R2, …); upload qua presigned URL; DB lưu URL public.

## 3. Repository Layout

```text
web-ban-hang/
  apps/
    web/                      # Next.js App Router — storefront + /admin UI
      src/
        app/
          (storefront)/       # home, category, product, search, cart, checkout, account, orders
          (admin)/            # dashboard, categories, products, orders
        components/
        lib/
          api-client.ts       # typed REST client
          format.ts           # VND, re-export shared nếu cần
    api/                      # NestJS
      src/
        modules/
          auth/
          catalog/            # categories, products
          search/
          cart/
          checkout/
          orders/
          payments/
          admin/
          upload/
        common/               # guards, pipes, filters, decorators
  packages/
    db/
      prisma/
        schema.prisma
        migrations/
        seed.ts
      src/
        index.ts              # export PrismaClient singleton pattern
    shared/
      src/
        schemas/              # Zod
        constants/
        types/
  docs/superpowers/specs/
  turbo.json
  pnpm-workspace.yaml
  package.json
  .env.example
  README.md
```

**Layering (API):** Controller → Service → Repository (Prisma). Validate input server-side (Zod DTO / ValidationPipe). UI không tin client.

## 4. Data Model

### ERD (logical)

```mermaid
erDiagram
  User ||--o{ Cart : owns
  User ||--o{ Order : places
  User ||--o{ Address : saves
  Category ||--o{ Category : parent
  Category ||--o{ Product : contains
  Product ||--o{ ProductImage : has
  Product ||--o{ CartItem : in
  Product ||--o{ OrderItem : snapshot
  Cart ||--o{ CartItem : has
  Order ||--|{ OrderItem : contains
  Order ||--|| Payment : has
  Province ||--o{ Ward : contains

  User {
    uuid id PK
    string email UK
    string passwordHash
    enum role
    datetime createdAt
    datetime updatedAt
  }
  Category {
    uuid id PK
    uuid parentId FK
    string name
    string slug UK
    int sortOrder
    bool isActive
  }
  Product {
    uuid id PK
    uuid categoryId FK
    string name
    string slug UK
    string sku UK
    string shortDescription
    string description
    int price
    int compareAtPrice
    int stock
    string brand
    json specs
    int soldCount
    bool isActive
    datetime createdAt
  }
  ProductImage {
    uuid id PK
    uuid productId FK
    string url
    int sortOrder
    string alt
  }
  Cart {
    uuid id PK
    uuid userId FK
    string guestToken UK
    datetime expiresAt
    datetime updatedAt
  }
  CartItem {
    uuid id PK
    uuid cartId FK
    uuid productId FK
    int quantity
  }
  Order {
    uuid id PK
    string code UK
    uuid userId FK
    enum status
    int subtotal
    int shippingFee
    int discount
    int total
    json shippingAddress
    string note
    datetime createdAt
  }
  OrderItem {
    uuid id PK
    uuid orderId FK
    uuid productId FK
    string productName
    string sku
    int unitPrice
    int quantity
    int lineTotal
  }
  Payment {
    uuid id PK
    uuid orderId FK UK
    enum method
    enum status
    string providerRef
    json metadata
    datetime updatedAt
  }
  Address {
    uuid id PK
    uuid userId FK
    string recipientName
    string phone
    string email
    string provinceCode FK
    string wardCode FK
    string line1
    bool isDefault
  }
  Province {
    string code PK
    string name
  }
  Ward {
    string code PK
    string provinceCode FK
    string name
  }
```

### Enums

- **UserRole:** `CUSTOMER`, `ADMIN`
- **OrderStatus:** `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
- **PaymentMethod:** `COD`, `BANK_TRANSFER` (mở rộng sau: `VNPAY`, `MOMO`, …)
- **PaymentStatus:** `UNPAID`, `PAID`, `FAILED`, `REFUNDED`

### Constraints & indexes

- Giá và tiền tệ: integer VND (không dùng float).
- `Product.slug`, `Product.sku`, `Category.slug`, `Order.code` unique.
- Index: `categoryId`, `brand`, `price`, `soldCount`, `isActive`, `createdAt`; composite cho filter storefront.
- Search: PostgreSQL `tsvector` / `ILIKE` trên `name`, `shortDescription`, `sku`, `brand` (MVP chọn một chiến lược trong implementation plan).
- `OrderItem` snapshot tên/giá/SKU tại thời điểm mua.
- `Order.shippingAddress` JSON snapshot (họ tên, SĐT, email, mã/tên tỉnh-thành, mã/tên phường-xã, địa chỉ chi tiết).

### Địa chỉ giao hàng (2 cấp)

- Master data: **Tỉnh/thành** + **Phường/xã** (không quận/huyện); seed JSON trong repo.
- Checkout: chọn tỉnh/thành → phường/xã (lọc theo tỉnh) + địa chỉ chi tiết; validate server-side.
- Đơn hàng lưu snapshot text + mã để không phụ thuộc master sau này.

### Cart

- User đăng nhập: một cart gắn `userId`.
- Khách: cart gắn `guestToken` (cookie httpOnly do API set); `expiresAt` dọn giỏ hết hạn.
- Login: merge guest cart vào user cart (cộng quantity, clamp theo tồn kho).

## 5. API Surface (REST)

Prefix ví dụ: `/api/v1`. Response JSON thống nhất; lỗi có `code`, `message` tiếng Việt khi phù hợp.

| Domain | Endpoints (representative) |
|--------|---------------------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Catalog | `GET /categories`, `GET /categories/:slug`, `GET /products`, `GET /products/:slug` |
| Search | `GET /search?q=&page=&sort=`, `GET /search/suggest?q=` (debounce client) |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id` |
| Checkout | `POST /checkout` (tạo order + payment trong transaction) |
| Orders | `GET /orders`, `GET /orders/:code` (owner hoặc admin) |
| Payments | Webhook stub `POST /payments/webhook/:provider` (cấu trúc, chưa tích hợp thật) |
| Admin | CRUD categories/products, `PATCH /admin/orders/:id`, `PATCH /admin/payments/:id` |
| Upload | `POST /upload/presign` → client PUT S3 → confirm URL lưu product |
| Geo | `GET /geo/provinces`, `GET /geo/wards?provinceCode=` |

**Query storefront:** `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `sort` (`newest`, `price_asc`, `price_desc`, `bestseller`), `page`, `pageSize`. Giữ filter trên URL phía web.

## 6. Authentication & Authorization

- NestJS phát hành JWT (access ngắn + refresh dài) trong **httpOnly, Secure** cookies khi phù hợp; hoặc Bearer cho client không cookie — implementation plan chọn một cách nhất quán với CORS Vercel ↔ VPS.
- Mật khẩu: bcrypt hoặc argon2; không log secret.
- Route bảo vệ web: `/account`, `/orders`, `/admin/*`; API guard role `ADMIN` cho `/admin/**`.
- Seed một user `ADMIN` và tài khoản demo `CUSTOMER` (document trong README).

## 7. Payments

- **COD:** `paymentMethod=COD`, `paymentStatus=UNPAID` đến khi admin xác nhận.
- **Bank transfer:** hiển thị QR/thông tin tài khoản từ env (`BANK_NAME`, `BANK_ACCOUNT`, `BANK_HOLDER`, `BANK_QR_URL`); `UNPAID` cho đến admin đánh dấu `PAID`.
- Interface `PaymentProvider` trong API; MVP có implementation no-op/stub cho webhook.
- Admin đổi `OrderStatus` và `PaymentStatus`.

## 8. Checkout & Inventory

- Form: họ tên, SĐT, email, tỉnh/thành, phường/xã, địa chỉ chi tiết, ghi chú.
- Tóm tắt: line items, tạm tính, phí ship (cấu hình/env), giảm giá placeholder, tổng.
- Tạo `Order` + `OrderItem` + `Payment` trong **một transaction**; trừ `Product.stock` với locking/atomic update; từ chối nếu vượt tồn kho.
- Trang xác nhận với mã đơn; user đăng nhập xem lịch sử.

## 9. Frontend (apps/web)

- Next.js App Router, TypeScript, Tailwind; mobile-first; palette xanh/trắng/xám.
- Header: logo, search, mini cart, account.
- Home: hero, danh mục nổi bật, sản phẩm nổi bật/khuyến mãi.
- Skeleton loading, empty state, toast lỗi/thành công.
- SEO: metadata, slug sản phẩm; Open Graph cơ bản trên PDP.
- A11y: label form, alt ảnh, keyboard focus.

## 10. Admin (apps/web + API)

- CRUD danh mục (cây cha-con), sản phẩm (giá, tồn, specs JSON, ảnh qua upload S3).
- Danh sách/chi tiết đơn; cập nhật trạng thái đơn và thanh toán.
- Dashboard: tổng đơn, doanh thu (đơn `COMPLETED` hoặc `PAID` theo quy ước trong plan), sản phẩm sắp hết hàng (ngưỡng env).

## 11. Security & Quality

- Validate mọi input phía server; Zod/shared schemas đồng bộ web ↔ API khi hợp lý.
- Rate limit nhẹ: auth, checkout (middleware NestJS hoặc reverse proxy).
- CSRF/session theo best practice của stack đã chọn.
- Kiểm tra quyền admin **server-side** trên mọi mutation admin.
- Unit/integration tests: logic giỏ, tạo đơn, trừ kho (Vitest/Jest tại API hoặc shared package).

## 12. Environment Variables (.env.example)

| Variable | App | Mô tả |
|----------|-----|--------|
| `DATABASE_URL` | api, db scripts | Postgres self-host |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | api | Ký token |
| `API_PUBLIC_URL` | api | URL public API |
| `NEXT_PUBLIC_API_URL` | web | Base URL REST |
| `CORS_ORIGINS` | api | Origin Vercel web |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL` | api | Object storage |
| `BANK_*` | api/web | Thông tin chuyển khoản |
| `SHIPPING_FLAT_FEE` | api | Phí ship MVP |
| `LOW_STOCK_THRESHOLD` | api | Ngưỡng sắp hết hàng |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | db seed | Chỉ local/staging |

Không commit file `.env` thật.

## 13. Scripts & Deliverables

- Root scripts (turbo): `dev`, `build`, `lint`, `test`, `db:migrate`, `db:seed`.
- README: setup local, env, migrate/seed, deploy Vercel + VPS (Postgres, API, S3), tài khoản demo.
- Migrations + seed: admin, danh mục mẫu, ≥20 sản phẩm điện/gia dụng/điện máy, địa giới hành chính 2 cấp, ảnh placeholder hợp lệ (URL sau upload hoặc URL seed).

## 14. Implementation Phases

| Phase | Deliverables | Verification |
|-------|--------------|--------------|
| **1** | Turborepo, Prisma schema/migrate/seed, Nest skeleton + health, Next shell, `.env.example`, scripts | Seed trên Postgres thật; `build` pass |
| **2** | Catalog, search, PDP, filter/sort, URL query, suggest debounce nếu kịp | Duyệt/lọc/tìm qua API + DB |
| **3** | Cart, checkout, order transaction, stock decrement, COD + bank transfer UI | E2E tạo đơn trên DB |
| **4** | Auth JWT, protected routes, guest cart merge | Login + order history |
| **5** | Admin CRUD, S3 upload, orders/payments, dashboard | Admin đổi giá/tồn → storefront |
| **6** | UI polish, SEO, tests giỏ/đơn/kho, deploy production, smoke checklist | Public URL E2E trên DB production |

### Smoke checklist (manual)

1. Khách duyệt danh mục → chi tiết → thêm giỏ  
2. Search ra đúng sản phẩm  
3. Checkout COD tạo order trong DB  
4. Login thấy lịch sử đơn  
5. Admin sửa tồn kho/giá phản ánh storefront  
6. Deploy public URL chạy end-to-end trên DB production  

## 15. Acceptance Criteria (MVP)

- Không mock API cho catalog, cart, order, auth trong luồng chính.
- Giỏ và đơn không chỉ localStorage.
- PostgreSQL self-host; ảnh sản phẩm upload S3-compatible.
- NestJS là backend duy nhất; Next.js UI/SSR gọi REST.
- Monorepo `apps/web`, `apps/api`, `packages/db`, `packages/shared`.
- Địa chỉ checkout: tỉnh/thành + phường/xã + chi tiết.
- Hai phương thức thanh toán COD và chuyển khoản; model `Payment` và `PaymentProvider` sẵn mở rộng.

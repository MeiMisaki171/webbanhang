# Điện Gia Dụng Pro — Tiến độ implementation theo phase



**Spec:** [2026-05-14-dien-gia-dung-pro-ecommerce-design.md](../specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md)



| Phase | Trạng thái | Plan chi tiết |

|-------|------------|---------------|

| 1 | Hoàn thành | [phase-1](./2026-05-14-dien-gia-dung-pro-phase-1.md) |

| 2 | Hoàn thành | [phase-2](./2026-05-14-dien-gia-dung-pro-phase-2.md) |

| 3 | Hoàn thành | [phase-3](./2026-05-14-dien-gia-dung-pro-phase-3.md) |

| 4 | Baseline xong; **bổ sung auth/state + email/SĐT chưa làm** | [phase-4](./2026-05-14-dien-gia-dung-pro-phase-4.md) (Task 6–11) |

| 5 | Hoàn thành | [phase-5](./2026-05-14-dien-gia-dung-pro-phase-5.md) |

| 6 | Hoàn thành | [phase-6](./2026-05-14-dien-gia-dung-pro-phase-6.md) |



## Tóm tắt deliverable đã có



### Phase 1 — Nền monorepo



- Turborepo + pnpm workspaces; scripts `dev`, `build`, `lint`, `test`, `db:migrate`, `db:seed`.

- `packages/db`: Prisma schema đầy đủ MVP, migration `20260514100000_init`, seed admin/customer, danh mục, ≥20 sản phẩm, tỉnh/phường 2 cấp, ảnh placeholder.

- `packages/shared`: `formatVnd`, enums nghiệp vụ, `API_PREFIX`.

- `apps/api`: NestJS, prefix `api/v1`, CORS, `PrismaModule`, `GET /health`.

- `apps/web`: App Router, Tailwind, layout/header, home gọi API thật.

- `.env.example`, `README.md` hướng dẫn local.



### Phase 2 — Catalog & search storefront



- API: `GET /categories`, `GET /categories/:slug`, `GET /products`, `GET /products/:slug`, `GET /products/brands/list`, `GET /search`, `GET /search/suggest`.

- Shared: Zod `productListQuerySchema`, `searchQuerySchema`, types `ProductCard`, `ProductDetail`, pagination.

- Web: `/`, `/danh-muc/[slug]`, `/san-pham/[slug]`, `/tim-kiem`; filter/sort/pagination trên URL; suggest tìm kiếm; metadata PDP cơ bản.



### Phase 3 — Giỏ, checkout, đơn hàng



- API: `GET/POST/PATCH/DELETE /cart` (cookie `dgp_guest_token`), `GET /geo/provinces`, `GET /geo/wards`, `GET /checkout/summary`, `POST /checkout`, `GET /orders/:code`.

- Transaction checkout: Order + OrderItem + Payment, trừ `stock`, tăng `soldCount`, snapshot địa chỉ; COD và chuyển khoản (`UNPAID`).

- Shared: `commerce.ts` (cart, checkout, order, geo).

- Web: thêm giỏ từ PDP, `/cart`, `/checkout`, `/don-hang/[code]` (COD + QR/thông tin CK).

- Test: Jest cart/checkout service; E2E API tạo đơn trên Postgres.



### Phase 5 — Admin, upload, dashboard

- API: CRUD `/admin/categories`, `/admin/products`; `GET/PATCH /admin/orders`, `PATCH /admin/payments/:id`; `GET /admin/dashboard/stats`; `POST /upload/presign`; `POST /payments/webhook/:provider`.
- Shared: `admin.ts` (Zod + types admin).
- Web: `/admin/*` (login, dashboard, danh mục, sản phẩm, đơn hàng) với `credentials: "include"`.
- Guard: `JwtAuthGuard` + `RolesGuard` (`ADMIN`) từ Phase 4.
- Test: `AdminCategoriesService` unit.

### Phase 6 — Polish, SEO, tests, deploy docs



- API: mở rộng unit test cart (merge clamp stock), checkout service/repository (trừ kho, map lỗi tồn).

- Web: skeleton/empty/toast, mini cart header, a11y (skip link, label), SEO home/category/search, palette sky/slate.

- README: deploy Vercel + VPS, smoke checklist, demo seed; `.env.example` `NEXT_PUBLIC_SITE_URL`.



## Smoke checklist (theo spec)



| # | Hạng mục | Phase | Trạng thái |

|---|----------|-------|------------|

| 1 | Duyệt danh mục → chi tiết → thêm giỏ | 2–3 | Đạt (API + UI) |

| 2 | Search từ header → kết quả trên `/?q=` | 2 / 6 bổ sung | Chưa (đang `/tim-kiem`) |

| 3 | Checkout COD tạo order trong DB | 3 | Đạt (E2E API / unit transaction) |

| 4 | Login thấy lịch sử đơn | 4 | Chưa |

| 5 | Admin sửa tồn/giá → storefront | 5 | Đạt (admin PATCH + catalog DB) |

| 6 | Deploy public URL E2E | 6 | Chưa (chỉ tài liệu deploy) |



## Chưa làm (backlog gắn phase)

- **Phase 6 bổ sung (Task 6–8):** sidebar danh mục, footer storefront, search trên home, gỡ `/tim-kiem`, drawer mobile icon danh mục.
- **Phase 4 bổ sung (Task 6–11):** refresh/`rememberMe`, đăng nhập email hoặc SĐT, Zustand auth + cart dedupe, guard client, smoke khách không gọi `GET /auth/me` khi storage không có user.
- **Phase 6 manual:** smoke #6 trên URL production; webhook payment provider thật (stub trong spec).


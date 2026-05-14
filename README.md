# Điện Gia Dụng Pro

MVP e-commerce monorepo cho cửa hàng đồ gia dụng, điện và điện máy tại Việt Nam.

## Stack

- `apps/web`: Next.js App Router (storefront + admin UI)
- `apps/api`: NestJS REST API
- `packages/db`: Prisma + PostgreSQL
- `packages/shared`: enums, format VND, hằng số dùng chung

## Yêu cầu

- Node.js 20+
- pnpm 10+
- PostgreSQL self-host (hoặc Docker Compose local)

## Thiết lập local

1. Sao chép biến môi trường:

```bash
cp .env.example .env
```

2. (Tuỳ chọn) Chạy Postgres local:

```bash
docker compose up -d postgres
```

3. Cài dependency:

```bash
pnpm install
```

4. Migrate và seed database:

```bash
pnpm db:migrate
pnpm db:seed
```

5. Chạy dev:

```bash
pnpm dev
```

Hoặc chạy song song ở hai terminal:

```bash
pnpm dev:api
pnpm dev:web
```

- Web: `http://localhost:3000`
- API health: `http://localhost:8080/api/v1/health` (hoặc cổng trong `API_PORT`)

## Scripts

| Script | Mô tả |
|--------|--------|
| `pnpm dev` | Chạy web + api song song (Turbo) |
| `pnpm dev:api` | Chỉ NestJS API |
| `pnpm dev:web` | Chỉ Next.js storefront |
| `pnpm build` | Build toàn monorepo |
| `pnpm lint` | Lint các package |
| `pnpm test` | Test các package |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:seed` | Seed dữ liệu mẫu |

## Tài khoản demo (seed)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@diengiadungpro.local` | `Admin@12345` |
| Customer | `customer@diengiadungpro.local` | `Customer@12345` |

Có thể ghi đè qua `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER_EMAIL`, `SEED_CUSTOMER_PASSWORD` trong `.env` (chỉ local/staging).

## Deploy production

### Web — Vercel

1. Import repo, chọn root `apps/web` (hoặc monorepo với build filter `@repo/web`).
2. Build command: `pnpm build` (từ root) hoặc `cd ../.. && pnpm --filter @repo/web build`.
3. Biến môi trường:
   - `NEXT_PUBLIC_API_URL` — URL public của API (ví dụ `https://api.example.com/api/v1`)
   - `NEXT_PUBLIC_SITE_URL` — URL storefront (ví dụ `https://shop.example.com`)
4. Redeploy sau khi API public sẵn sàng; kiểm tra CORS phía API.

### API — VPS (NestJS)

1. Node 20+, pnpm, process manager (systemd hoặc PM2).
2. Postgres reachable; copy `.env` production (`DATABASE_URL`, `JWT_*`, `CORS_ORIGINS`, `API_PUBLIC_URL`, `BANK_*`, `SHIPPING_FLAT_FEE`, `S3_*`).
3. `pnpm install`, `pnpm db:migrate`, `pnpm --filter @repo/api build`, chạy `node apps/api/dist/main` hoặc `pnpm --filter @repo/api start:prod`.
4. Nginx reverse proxy TLS → cổng API; `CORS_ORIGINS` gồm origin Vercel web.

### PostgreSQL — VPS

- Self-host Postgres 16+; backup định kỳ; `DATABASE_URL` dùng SSL khi production.
- Local: `docker compose up -d postgres` (xem `docker-compose.yml`).

### Object storage — S3-compatible

- MinIO trên VPS hoặc dịch vụ S3-compatible; cấu hình `S3_ENDPOINT`, `S3_BUCKET`, `S3_PUBLIC_URL` cho upload/presign (Phase 5 admin).

### Thanh toán (webhook stub)

- MVP chưa tích hợp VNPay/MoMo thật; endpoint stub `POST /api/v1/payments/webhook/:provider` được mô tả trong [spec thiết kế](docs/superpowers/specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md) mục Payments — triển khai provider thật là backlog sau deploy.

## Smoke checklist (sau deploy hoặc local)

| # | Hạng mục | Ghi chú |
|---|----------|---------|
| 1 | Duyệt danh mục → chi tiết → thêm giỏ | API + UI, cookie giỏ khách |
| 2 | Search đúng sản phẩm | `/tim-kiem?q=` |
| 3 | Checkout COD tạo order trong DB | `POST /checkout`, tồn giảm |
| 4 | Login thấy lịch sử đơn | Phase 4 |
| 5 | Admin sửa tồn/giá → storefront | Phase 5 |
| 6 | Public URL E2E trên DB production | Web Vercel + API VPS |

## Phase & tài liệu

- Tiến độ: `docs/superpowers/plans/2026-05-14-dien-gia-dung-pro-progress.md`
- Thiết kế: `docs/superpowers/specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md`
- Phase 6 (polish, SEO, tests, deploy): `docs/superpowers/plans/2026-05-14-dien-gia-dung-pro-phase-6.md`

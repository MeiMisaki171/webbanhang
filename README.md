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

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/api/v1/health`

## Scripts

| Script | Mô tả |
|--------|--------|
| `pnpm dev` | Chạy web + api song song |
| `pnpm build` | Build toàn monorepo |
| `pnpm lint` | Lint các package |
| `pnpm test` | Test các package |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:seed` | Seed dữ liệu mẫu |

## Tài khoản demo (seed)

- Admin: `admin@diengiadungpro.local` / `Admin@12345`
- Customer: `customer@diengiadungpro.local` / `Customer@12345`

## Deploy gợi ý

- **Web:** Vercel (`apps/web`), set `NEXT_PUBLIC_API_URL`
- **API:** VPS cùng Postgres + S3-compatible storage, reverse proxy TLS
- **Database:** PostgreSQL self-host, cấu hình `DATABASE_URL` cho API

## Phase hiện tại

Phase 1: monorepo, Prisma schema/seed, NestJS health, Next.js shell.

Tài liệu thiết kế: `docs/superpowers/specs/2026-05-14-dien-gia-dung-pro-ecommerce-design.md`

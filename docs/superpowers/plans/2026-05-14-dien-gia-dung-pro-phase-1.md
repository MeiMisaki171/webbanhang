# Điện Gia Dụng Pro — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Trạng thái:** Hoàn thành (2026-05-14)

**Goal:** Bootstrap monorepo với Prisma schema/seed, NestJS health API, Next.js shell, scripts và `.env.example` để Phase 2+ xây catalog trên Postgres thật.

**Architecture:** Turborepo + pnpm workspaces; `packages/db` (Prisma), `packages/shared` (VND/enums), `apps/api` (NestJS REST), `apps/web` (Next.js App Router). API là điểm vào DB qua Prisma service.

**Tech Stack:** Node 20+, pnpm, Turbo, Prisma, PostgreSQL, NestJS 11, Next.js 16, TypeScript, Tailwind CSS 4, Zod.

**Verification (spec):** Seed trên Postgres thật; `pnpm build` pass.

---

### Task 1: Monorepo root

**Files:**
- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.env.example`, `tsconfig.base.json`

- [x] Workspace `apps/*`, `packages/*`; scripts `dev`, `dev:api`, `dev:web`, `build`, `lint`, `test`, `db:migrate`, `db:seed`.
- [x] `turbo.json` pipeline build/lint/test với `dependsOn: ["^build"]`.
- [x] `.env.example`: `DATABASE_URL`, JWT, API/web URL, CORS, S3, `BANK_*`, `SHIPPING_FLAT_FEE`, `LOW_STOCK_THRESHOLD`, seed credentials.

### Task 2: `packages/shared`

**Files:**
- `packages/shared/package.json`, `tsconfig.json`, `src/index.ts`, `src/enums.ts`, `src/format.test.ts`

- [x] `formatVnd(amount: number): string` (locale `vi-VN`, suffix `₫`).
- [x] Enums: `UserRole`, `OrderStatus`, `PaymentMethod`, `PaymentStatus`.
- [x] `API_PREFIX` = `/api/v1`.
- [x] Build + test format VND.

### Task 3: `packages/db`

**Files:**
- `packages/db/prisma/schema.prisma`, `migrations/20260514100000_init/`, `prisma/seed.ts`, `prisma/data/provinces-wards.json`, `src/index.ts`

- [x] Schema models/enums/index theo design (User, Category, Product, Cart, Order, Payment, Province, Ward, Address, …).
- [x] Seed: admin + customer demo (`SEED_*` env), cây danh mục, ≥20 sản phẩm điện/gia dụng, geo 2 cấp (mẫu HN/HCM/Đà Nẵng), ảnh `placehold.co`.
- [x] `prisma migrate` + export `PrismaClient` qua `@repo/db`.

### Task 4: `apps/api`

**Files:**
- `apps/api/src/main.ts`, `load-env.ts`, `app.module.ts`, `prisma/*`, `health/*`

- [x] Nest bootstrap; global prefix `api/v1`; CORS từ `CORS_ORIGINS` (credentials).
- [x] `PrismaModule` / `PrismaService` dùng `@repo/db`.
- [x] `GET /api/v1/health` → `{ status, database }`.
- [x] Jest smoke `health.controller.spec.ts`; `pnpm build` pass.

### Task 5: `apps/web`

**Files:**
- `apps/web/src/app/layout.tsx`, `page.tsx`, `globals.css`, `components/site-header.tsx`, `lib/api-client.ts`, `next.config.ts`

- [x] App Router, Tailwind 4, layout tiếng Việt, header (logo, search placeholder, link giỏ/tài khoản).
- [x] Home gọi API qua `NEXT_PUBLIC_API_URL` (sau Phase 2 mở rộng catalog trên home).
- [x] `pnpm build` pass.

### Task 6: README & verification

**Files:**
- `README.md`

- [x] Hướng dẫn `.env`, migrate, seed, `dev:api` / `dev:web`.
- [x] `pnpm build`, `pnpm test` ở root.

---

**Phase tiếp theo:** [Phase 2 — Catalog & search](./2026-05-14-dien-gia-dung-pro-phase-2.md) · [Tiến độ tổng](./2026-05-14-dien-gia-dung-pro-progress.md)

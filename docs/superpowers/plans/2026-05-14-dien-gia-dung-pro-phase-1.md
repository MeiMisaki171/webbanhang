# Điện Gia Dụng Pro — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap monorepo với Prisma schema/seed, NestJS health API, Next.js shell, scripts và `.env.example` để Phase 2+ xây catalog trên Postgres thật.

**Architecture:** Turborepo + pnpm workspaces; `packages/db` (Prisma), `packages/shared` (VND/enums), `apps/api` (NestJS REST), `apps/web` (Next.js App Router). API là điểm vào DB qua Prisma service.

**Tech Stack:** Node 22, pnpm, Turbo, Prisma, PostgreSQL, NestJS 11, Next.js 15, TypeScript, Tailwind CSS 4, Zod.

---

### Task 1: Monorepo root

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.env.example`, `tsconfig.base.json`

- [ ] **Step 1:** Khai báo workspace `apps/*`, `packages/*`, scripts `dev`, `build`, `lint`, `test`, `db:migrate`, `db:seed`.
- [ ] **Step 2:** `turbo.json` pipeline build/lint/test với dependsOn `^build`.
- [ ] **Step 3:** `.env.example` đủ biến theo design spec.
- [ ] **Step 4:** Commit scaffold root.

### Task 2: `packages/shared`

**Files:**
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/index.ts`, `packages/shared/src/format/currency.ts`, `packages/shared/src/constants/enums.ts`

- [ ] **Step 1:** Export `formatVnd(amount: number): string`.
- [ ] **Step 2:** Export enums UserRole, OrderStatus, PaymentMethod, PaymentStatus.
- [ ] **Step 3:** Build package; commit.

### Task 3: `packages/db`

**Files:**
- Create: `packages/db/package.json`, `packages/db/tsconfig.json`, `packages/db/prisma/schema.prisma`, `packages/db/prisma/seed.ts`, `packages/db/src/index.ts`, `packages/db/prisma/data/provinces-wards.json`

- [ ] **Step 1:** Schema đầy đủ models/enums/index theo design.
- [ ] **Step 2:** Seed admin, customer demo, categories, ≥20 products, geo 2 cấp, product images URL placeholder.
- [ ] **Step 3:** `prisma migrate dev` khi có `DATABASE_URL`; export `prisma` client.
- [ ] **Step 4:** Commit.

### Task 4: `apps/api`

**Files:**
- Create: Nest app under `apps/api/src/**`

- [ ] **Step 1:** Nest bootstrap, global prefix `api/v1`, CORS từ env.
- [ ] **Step 2:** `PrismaModule` dùng `@repo/db`.
- [ ] **Step 3:** `GET /api/v1/health` trả `{ status: 'ok', database: 'up'|'down' }`.
- [ ] **Step 4:** Jest smoke test health controller; `pnpm build` pass.
- [ ] **Step 5:** Commit.

### Task 5: `apps/web`

**Files:**
- Create: Next app under `apps/web/**`

- [ ] **Step 1:** App Router, Tailwind, layout tiếng Việt, header placeholder.
- [ ] **Step 2:** Home hero + gọi health API qua `NEXT_PUBLIC_API_URL`.
- [ ] **Step 3:** `pnpm build` pass.
- [ ] **Step 4:** Commit.

### Task 6: README & verification

**Files:**
- Create: `README.md`

- [ ] **Step 1:** Hướng dẫn copy `.env.example`, migrate, seed, dev.
- [ ] **Step 2:** Chạy `pnpm build` và `pnpm test` ở root.
- [ ] **Step 3:** Commit README.

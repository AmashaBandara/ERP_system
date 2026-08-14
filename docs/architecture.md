# Waikkal Hospitality ERP — Architecture

Integrated ERP for two businesses under one head office:
- **Ernie's Retreat** – Waikkal Beach Villa (accommodation)
- **Nanga's Kitchen** – Restaurant & catering (POS, online orders, catering)

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 20, TypeScript (strict) |
| Backend | Express + Socket.io + Knex/Objection-style data access (Knex query builder) |
| Database | MySQL 8 (InnoDB, utf8mb4), single DB, `branches` + `branch_id` on all business tables |
| Schema management | SQL migration files + seed via `scripts/migrate.ts` / `scripts/gen-seed-sql.ts` |
| Frontend | React 18 + Vite + Tailwind + shadcn/ui-style components |
| UI state/data | React Router, TanStack Query, Zustand, socket.io-client, react-hook-form + zod, recharts |
| Auth | bcrypt(12), access JWT (1h) + rotating refresh token (30d, httpOnly cookie) |
| Validation | zod at API boundaries; helmet, CORS allow-list, express-rate-limit |

## Repository layout

```
backend\      Express + TS + Knex
frontend\     React + Vite + Tailwind + shadcn-style components
docker\       compose.yml (mysql:8), mysql/init.sql, my.cnf
scripts\      backup.ps1, restore.ps1, dev.ps1
docs\         architecture.md, erd.md
```

## Backend

```
src/
  index.ts               bootstrap: express + http.createServer + Socket.io + helmet/cors/rate-limit
  config/env.ts          zod-validated environment
  db/knex.ts             Knex instance + transaction helper
  db/sql/*.sql           ordered schema (system → accommodation → pos → catering → inventory → hr → finance)
  db/procedures/*.sql    stored procedures (sp_daily_sales_summary, sp_occupancy_report,
                         sp_food_cost_analysis, sp_branch_consolidated_revenue)
  auth/                  password, jwt, middleware (authenticate/authorize/branchScope), session
  modules/<m>/           routes/controllers/services/schemas (auth, users, roles, branches, audit, health)
  sockets/               JWT handshake, branch:<id> rooms, event constants
  hardware/              PrinterProvider + AttendanceProvider contracts + mock adapters
  openapi.ts             OpenAPI 3 spec (served at /api/v1 by Swagger UI)
```

### API conventions
- Base path `/api/v1`; JSON envelopes `{ data }` or `{ error: { code, message, details } }`.
- Every write endpoint writes an `audit_logs` row (action/entity/before/after JSON).
- Permission keys (`pos.order.create`, `hotel.reservation.*`, `users.*`, …) enforced server-side.
- Super-admin bypasses permission checks; branch scope filters come from `user_branch_access`.

### Auth flow
`login` → verify bcrypt → issue access (1h) + refresh (30d, hashed in DB) → cookie `refresh_token`
→ `/auth/refresh` rotates token (reuse-detection revokes the family on replay) → `/auth/me`.

Lockout: 5 failed attempts locks the account for 15 minutes.

### RBAC model
`users → user_roles → roles → role_permissions → permissions`, plus `user_branch_access`
for multi-branch access of head-office roles. Eleven roles are seeded (SUPER_ADMIN … EMPLOYEE).

## Frontend

```
frontend/src/
  app/            router, providers (QueryClient), zustand auth store
  features/       auth, dashboard (shell), users, roles, branches, audit, profile
  shared/api/     fetch client with 401→refresh retry
  shared/components  DataTable, PageHeader, shadcn-style ui primitives
  shared/hooks/   useBranches, useRoles, usePermissions, useHasPermission
  lib/            cn(), formatCurrency (LKR), formatDate
```

- Route guards: `<RequireAuth>` + `<RequirePermission>`.
- Sidebar menu is filtered by the current user's permissions.
- Vite proxies `/api` and `/socket.io` to the backend in dev.

## Multi-location
Every business table carries `branch_id`. Head-office roles can span branches via
`user_branch_access`. Consolidation views, inter-branch transfers and feature flags
are Phase 4 roadmap items.

## Security & ops
- bcrypt(12), helmet, CORS allow-list, rate limits, zod validation, Knex prepared statements.
- Passwords enforced-change on first login; no secrets in the repo (`backend/.env` only).
- Nightly backups via `scripts/backup.ps1` (mysqldump → local retention + S3-compatible cloud).
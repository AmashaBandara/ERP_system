# Waikkal Hospitality ERP

Integrated ERP for two businesses under one head office:
- **Ernie's Retreat** – Waikkal Beach Villa (accommodation)XC
- **Nanga's Kitchen** – Restaurant & catering (POS, online orders, catering)

Monorepo with npm workspaces: `backend` (Express + TypeScript + Knex) and `frontend`
(React + Vite + Tailwind + shadcn/ui). MySQL 8 via Docker.

## Prerequisites

- Node.js >= 20
- Docker Desktop (for the MySQL 8 dev database)

## Quick start

```powershell
# 1. Start MySQL
docker compose -f docker/compose.yml --env-file .env up -d

# 2. Copy environment files
Copy-Item backend/.env.example backend/.env

# 3. Install dependencies
npm install

# 4. Create schema and seed data
npm run db:migrate
npm run db:seed

# 5. Run backend + frontend in dev
npm run dev
```

- Backend API: http://localhost:4000 (`/api/v1`, docs at `/api-docs`)
- Frontend: http://localhost:5173

Bootstrap login: `superadmin` / the `BOOTSTRAP_ADMIN_PASSWORD` value in `backend/.env`.

## Common scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Run backend + frontend concurrently |
| `npm run db:migrate` | Apply Knex migrations |
| `npm run db:seed` | Seed branches, roles, permissions, demo data |
| `npm run db:setup` | Fresh migrate + seed |
| `npm run lint` | ESLint both workspaces |
| `npm run typecheck` | TypeScript strict checks both workspaces |
| `npm run test` | Vitest suites |
| `npm run build` | Production build |

## Backups

```powershell
powershell -File scripts/backup.ps1 -Database waikkal_erp -OutDir .\backups
powershell -File scripts/restore.ps1 -BackupPath .\backups\waikkal_erp_20260101_000000.sql.gz
```

## Documentation

- [Architecture](docs/architecture.md)
- [ERD](docs/erd.md)
- OpenAPI spec served at `/api-docs` in dev

## Repository layout

```
backend\    Express + TypeScript + Knex
frontend\   React + Vite + Tailwind + shadcn/ui
docker\     compose.yml, mysql init, MySQL config
scripts\    backup/restore/dev PowerShell scripts
docs\       architecture.md, erd.md
```

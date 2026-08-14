# dev.ps1 - one-shot local dev bootstrap on Windows.
# Starts MySQL (docker), installs deps, migrates + seeds, and runs backend + frontend.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/dev.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "== Starting MySQL =="
docker compose -f (Join-Path $root "docker\compose.yml") --env-file (Join-Path $root ".env") up -d

Write-Host "== Installing dependencies =="
Push-Location $root
npm install

Write-Host "== Applying schema =="
Push-Location (Join-Path $root "backend")
..\node_modules\.bin\tsx.cmd scripts/migrate.ts reset
..\node_modules\.bin\tsx.cmd scripts/migrate.ts migrate
..\node_modules\.bin\tsx.cmd scripts/gen-seed-sql.ts
..\node_modules\.bin\tsx.cmd scripts/migrate.ts procedures
Pop-Location

Write-Host "== Seeding demo data (run seed.sql via container) =="
$seed = Join-Path $root "backend\build\seed.sql"
if (Test-Path $seed) {
    docker exec -i waikkal-mysql mysql -uwaikkal -pwaikkal waikkal_erp < $seed
}

Write-Host "== Starting backend + frontend =="
Pop-Location
npm run dev
